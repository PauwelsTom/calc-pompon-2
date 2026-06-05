import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { db } from "./db";
import type { SaleRow } from "./db";
import { CATEGORIES, categorieDe, prixDe } from "./catalogue";
import { genererDonneesFake } from "./fakeData";
import type { Metric } from "./stats";
import {
    bucketsJour,
    moyenneMoisParHeure,
    totauxParCategorieJour,
    moyenneMoisParCategorie,
    moyenne7jParHeure,
    moyenne7jParCategorie,
    clientsJour,
    clientsMoyenMois,
    clientsMoyenIntervalle,
    datesDisponibles,
    labelHeure,
    moisDe,
    jourPrecedent,
    decalerJour,
} from "./stats";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Auto-génération des données de test si la base est vide
const total = (db.prepare("SELECT COUNT(*) AS n FROM sales").get() as { n: number }).n;
if (total === 0) {
    console.log("Base vide → génération des données de test (7 derniers jours)…");
    genererDonneesFake();
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Dates disponibles en base (pour le calendrier de la page stats)
app.get("/api/dates", (_req, res) => {
    res.json(datesDisponibles());
});

// Comparaison d'une journée avec un élément de référence
//   ?date=YYYY-MM-DD&metric=ca|count&categorie=all|<cat>&ref=jour-precedent|moyenne-mois
app.get("/api/comparaison", (req, res) => {
    const date = String(req.query.date ?? "");
    if (!date) return res.status(400).json({ error: "Paramètre 'date' requis" });

    const metric: Metric = req.query.metric === "count" ? "count" : "ca";
    const categorie = req.query.categorie && req.query.categorie !== "all" ? String(req.query.categorie) : null;
    const ref = String(req.query.ref ?? "jour-precedent");

    const jour = bucketsJour(date, metric, categorie);

    let refHeure: number[];
    let refCat: Record<string, number>;
    let refLabel: string;
    let clientsRef: number;
    if (ref === "moyenne-mois") {
        refHeure = moyenneMoisParHeure(moisDe(date), metric, categorie);
        refCat = moyenneMoisParCategorie(moisDe(date), metric);
        clientsRef = clientsMoyenMois(moisDe(date));
        refLabel = "Moyenne du mois";
    } else if (ref === "moyenne-7j") {
        refHeure = moyenne7jParHeure(date, metric, categorie);
        refCat = moyenne7jParCategorie(date, metric);
        clientsRef = clientsMoyenIntervalle(decalerJour(date, -7), date);
        refLabel = "Moyenne 7 jours";
    } else if (ref === "meme-jour-semaine") {
        const j = decalerJour(date, -7);
        refHeure = bucketsJour(j, metric, categorie).bars;
        refCat = totauxParCategorieJour(j, metric);
        clientsRef = clientsJour(j);
        refLabel = "Même jour s-1";
    } else {
        const prec = jourPrecedent(date);
        refHeure = bucketsJour(prec, metric, categorie).bars;
        refCat = totauxParCategorieJour(prec, metric);
        clientsRef = clientsJour(prec);
        refLabel = "Journée précédente";
    }

    // Axe horaire = plage de vente de la journée (première → dernière vente)
    const heures: string[] = [];
    const serieJour: number[] = [];
    const serieRef: number[] = [];
    if (jour.min >= 0) {
        for (let i = jour.min; i <= jour.max; i++) {
            heures.push(labelHeure(i));
            serieJour.push(round2(jour.bars[i]));
            serieRef.push(round2(refHeure[i]));
        }
    }

    const catJour = totauxParCategorieJour(date, metric);
    const categories = CATEGORIES.map(c => ({
        categorie: c,
        valeur: round2(catJour[c] ?? 0),
        reference: round2(refCat[c] ?? 0),
    }));

    // Total au-dessus des graphes : CA total (mode ca) ou nombre de ventes (mode count)
    const total = {
        jour: round2(CATEGORIES.reduce((s, c) => s + (catJour[c] ?? 0), 0)),
        reference: round2(CATEGORIES.reduce((s, c) => s + (refCat[c] ?? 0), 0)),
        unite: metric === "ca" ? "ca" : "ventes",
    };
    // Nombre de clients (toujours affiché, sous le total)
    const clients = { jour: clientsJour(date), reference: round2(clientsRef) };

    res.json({
        date,
        metric,
        categorie: categorie ?? "all",
        ref,
        refLabel,
        total,
        clients,
        horaire: { heures, jour: serieJour, reference: serieRef },
        categories,
    });
});

// Statistiques globales sur l'ensemble des données
app.get("/api/global", (_req, res) => {
    const rows = db.prepare(
        "SELECT jour, categorie, article, prix, quantite, paiement FROM sales"
    ).all() as unknown as SaleRow[];

    const jours = new Set<string>();
    let caTotal = 0;
    let ventesTotal = 0;
    let esp = 0;
    let cb = 0;
    const caCat: Record<string, number> = {};
    const venteCat: Record<string, number> = {};
    const venteArticle: Record<string, { categorie: string; quantite: number }> = {};

    for (const r of rows) {
        jours.add(r.jour);
        const ca = r.prix * r.quantite;
        caTotal += ca;
        ventesTotal += r.quantite;
        if (r.paiement === "esp") esp += ca; else cb += ca;
        caCat[r.categorie] = (caCat[r.categorie] ?? 0) + ca;
        venteCat[r.categorie] = (venteCat[r.categorie] ?? 0) + r.quantite;
        if (!venteArticle[r.article]) venteArticle[r.article] = { categorie: r.categorie, quantite: 0 };
        venteArticle[r.article].quantite += r.quantite;
    }

    const n = jours.size || 1;
    const parCategorie = CATEGORIES.map(c => ({
        categorie: c,
        caMoyenJour: round2((caCat[c] ?? 0) / n),
        ventesMoyenJour: round2((venteCat[c] ?? 0) / n),
    }));
    const meilleursArticles = Object.entries(venteArticle)
        .map(([article, v]) => ({ article, categorie: v.categorie, quantite: v.quantite }))
        .sort((a, b) => b.quantite - a.quantite)
        .slice(0, 5);

    const clientsTotal = ((db.prepare("SELECT SUM(clients) AS s FROM jours").get() as { s: number | null }).s) ?? 0;
    const panierMoyen = clientsTotal > 0 ? caTotal / clientsTotal : 0;

    res.json({
        nbJours: jours.size,
        caTotal: round2(caTotal),
        ventesTotal,
        clientsTotal,
        caMoyenJour: round2(caTotal / n),
        clientsMoyenJour: round2(clientsTotal / n),
        panierMoyen: round2(panierMoyen),
        repartitionPaiement: { espece: round2(esp), cb: round2(cb) },
        parCategorie,
        meilleursArticles,
    });
});

// Ingestion d'une journée envoyée par la caisse lors du reset.
// Body = DayData { espece, cb, ventes, historique: [{ timestamp, paiement, items:[{nom,prix,quantite}] }] }
app.post("/jour", (req, res) => {
    const historique = Array.isArray(req.body?.historique) ? req.body.historique : [];
    const insert = db.prepare(
        "INSERT INTO sales (jour, ts, categorie, article, prix, quantite, paiement) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    const businessDate = (ts: number): string => {
        const d = new Date(ts);
        if (d.getHours() < 6) d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const j = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${j}`;
    };

    const upsertClients = db.prepare(
        "INSERT INTO jours (jour, clients) VALUES (?, ?) ON CONFLICT(jour) DO UPDATE SET clients = clients + excluded.clients"
    );

    let lignes = 0;
    const clientsParJour: Record<string, number> = {};
    db.exec("BEGIN");
    try {
        for (const t of historique) {
            const ts: number = t.timestamp ?? Date.now();
            const jour = businessDate(ts);
            const paiement = t.paiement === "cb" ? "cb" : "esp";
            // 1 transaction = 1 client
            clientsParJour[jour] = (clientsParJour[jour] ?? 0) + 1;
            for (const it of t.items ?? []) {
                const categorie = categorieDe[it.nom] ?? "inconnu";
                const prix = typeof it.prix === "number" ? it.prix : (prixDe[it.nom] ?? 0);
                insert.run(jour, ts, categorie, it.nom, prix, it.quantite ?? 0, paiement);
                lignes++;
            }
        }
        for (const [jour, c] of Object.entries(clientsParJour)) upsertClients.run(jour, c);
        db.exec("COMMIT");
    } catch (e) {
        db.exec("ROLLBACK");
        console.error("Échec ingestion /jour :", e);
        return res.status(500).json({ ok: false });
    }

    res.json({ ok: true, lignes });
});

// --- Origine unique : sert aussi le front buildé (frontend/dist) ---
// Permet d'exposer front + API derrière une seule URL (ex: tunnel) sans CORS
// ni mixed-content. En dev, le front passe par Vite (5173) + proxy, ce bloc
// n'est utilisé que si l'on ouvre directement le backend.
const ICI = dirname(fileURLToPath(import.meta.url));
const DIST = join(ICI, "..", "..", "frontend", "dist");
if (existsSync(DIST)) {
    app.use(express.static(DIST));
    // Fallback SPA : toute autre route renvoie l'app (les routes API sont déjà gérées au-dessus)
    app.get("*", (_req, res) => res.sendFile(join(DIST, "index.html")));
} else {
    console.warn(`Build front introuvable (${DIST}). Lance "npm run build" dans frontend/ pour servir l'app.`);
}

const PORT = 4000;
app.listen(PORT, () => console.log(`API caisse prête sur http://localhost:${PORT}`));

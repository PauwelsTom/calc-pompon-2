import { db } from "./db";
import type { SaleRow } from "./db";
import { CATEGORIES } from "./catalogue";

export type Metric = "ca" | "count";

// Heure -> index sur l'axe métier 6h..5h (6h -> 0, 7h -> 1, ... 5h -> 23)
export const hourIdx = (ts: number): number => {
    const h = new Date(ts).getHours();
    return h >= 6 ? h - 6 : h + 18;
};
export const labelHeure = (idx: number): string => `${(idx + 6) % 24}h`;

const valeur = (r: SaleRow, metric: Metric): number =>
    metric === "count" ? r.quantite : r.quantite * r.prix;

function lignesJour(jour: string): SaleRow[] {
    return db.prepare(
        "SELECT jour, ts, categorie, article, prix, quantite, paiement FROM sales WHERE jour = ?"
    ).all(jour) as unknown as SaleRow[];
}

// Valeurs par heure (24 cases) pour un jour, filtrées par catégorie (null = toutes).
// min/max = première/dernière heure où il y a eu une vente (toutes catégories).
export function bucketsJour(jour: string, metric: Metric, categorie: string | null): { bars: number[]; min: number; max: number } {
    const rows = lignesJour(jour);
    const bars = new Array<number>(24).fill(0);
    let min = Infinity;
    let max = -Infinity;
    for (const r of rows) {
        const idx = hourIdx(r.ts);
        if (idx < min) min = idx;
        if (idx > max) max = idx;
        if (categorie && r.categorie !== categorie) continue;
        bars[idx] += valeur(r, metric);
    }
    return { bars, min: min === Infinity ? -1 : min, max: max === -Infinity ? -1 : max };
}

// Moyenne par heure sur tous les jours d'un mois ("YYYY-MM")
export function moyenneMoisParHeure(mois: string, metric: Metric, categorie: string | null): number[] {
    const rows = db.prepare(
        "SELECT jour, ts, categorie, prix, quantite FROM sales WHERE jour LIKE ?"
    ).all(mois + "%") as unknown as SaleRow[];

    const somme = new Array<number>(24).fill(0);
    const jours = new Set<string>();
    for (const r of rows) {
        jours.add(r.jour);
        if (categorie && r.categorie !== categorie) continue;
        somme[hourIdx(r.ts)] += valeur(r, metric);
    }
    const n = jours.size || 1;
    return somme.map(s => s / n);
}

export function totauxParCategorieJour(jour: string, metric: Metric): Record<string, number> {
    const rows = lignesJour(jour);
    const t: Record<string, number> = {};
    for (const c of CATEGORIES) t[c] = 0;
    for (const r of rows) t[r.categorie] = (t[r.categorie] ?? 0) + valeur(r, metric);
    return t;
}

export function moyenneMoisParCategorie(mois: string, metric: Metric): Record<string, number> {
    const rows = db.prepare(
        "SELECT jour, categorie, prix, quantite FROM sales WHERE jour LIKE ?"
    ).all(mois + "%") as unknown as SaleRow[];

    const somme: Record<string, number> = {};
    const jours = new Set<string>();
    for (const c of CATEGORIES) somme[c] = 0;
    for (const r of rows) {
        jours.add(r.jour);
        somme[r.categorie] = (somme[r.categorie] ?? 0) + valeur(r, metric);
    }
    const n = jours.size || 1;
    const moy: Record<string, number> = {};
    for (const c of CATEGORIES) moy[c] = somme[c] / n;
    return moy;
}

export function datesDisponibles(): string[] {
    return (db.prepare("SELECT DISTINCT jour FROM sales ORDER BY jour DESC").all() as unknown as { jour: string }[])
        .map(r => r.jour);
}

export const moisDe = (date: string): string => date.slice(0, 7);

// ---- Nombre de clients (table jours) ----
export function clientsJour(jour: string): number {
    const r = db.prepare("SELECT clients FROM jours WHERE jour = ?").get(jour) as { clients: number } | undefined;
    return r?.clients ?? 0;
}
export function clientsMoyenMois(mois: string): number {
    const r = db.prepare("SELECT AVG(clients) AS m FROM jours WHERE jour LIKE ?").get(mois + "%") as { m: number | null };
    return r.m ?? 0;
}
export function clientsMoyenIntervalle(debut: string, fin: string): number {
    const r = db.prepare("SELECT AVG(clients) AS m FROM jours WHERE jour >= ? AND jour < ?").get(debut, fin) as { m: number | null };
    return r.m ?? 0;
}

export function decalerJour(date: string, n: number): string {
    const [y, m, j] = date.split("-").map(Number);
    const d = new Date(y, m - 1, j);
    d.setDate(d.getDate() + n);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const jj = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${jj}`;
}
export const jourPrecedent = (date: string): string => decalerJour(date, -1);

// Lignes des jours de l'intervalle [debut, fin[ (dates ISO triables tel quel)
function lignesIntervalle(debut: string, fin: string): SaleRow[] {
    return db.prepare(
        "SELECT jour, ts, categorie, prix, quantite FROM sales WHERE jour >= ? AND jour < ?"
    ).all(debut, fin) as unknown as SaleRow[];
}

// Moyenne par heure sur les 7 jours précédant `date`
export function moyenne7jParHeure(date: string, metric: Metric, categorie: string | null): number[] {
    const rows = lignesIntervalle(decalerJour(date, -7), date);
    const somme = new Array<number>(24).fill(0);
    const jours = new Set<string>();
    for (const r of rows) {
        jours.add(r.jour);
        if (categorie && r.categorie !== categorie) continue;
        somme[hourIdx(r.ts)] += valeur(r, metric);
    }
    const n = jours.size || 1;
    return somme.map(s => s / n);
}
export function moyenne7jParCategorie(date: string, metric: Metric): Record<string, number> {
    const rows = lignesIntervalle(decalerJour(date, -7), date);
    const somme: Record<string, number> = {};
    const jours = new Set<string>();
    for (const c of CATEGORIES) somme[c] = 0;
    for (const r of rows) {
        jours.add(r.jour);
        somme[r.categorie] = (somme[r.categorie] ?? 0) + valeur(r, metric);
    }
    const n = jours.size || 1;
    const moy: Record<string, number> = {};
    for (const c of CATEGORIES) moy[c] = somme[c] / n;
    return moy;
}

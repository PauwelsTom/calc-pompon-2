import { db } from "./db";
import { CATALOGUE, DOMINANT } from "./catalogue";

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;

function dateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const j = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${j}`;
}

// Choix d'un article pondéré : l'article dominant a un poids 3, les autres 1
// (=> ~60% des ventes pour le dominant, le reste partagé).
function choisirPondere(noms: string[], dominant: string): string {
    const poids = noms.map(n => (n === dominant ? 3 : 1));
    const total = poids.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < noms.length; i++) {
        r -= poids[i];
        if (r <= 0) return noms[i];
    }
    return noms[noms.length - 1];
}

/**
 * Régénère des données de test sur les 7 derniers jours (aujourd'hui inclus).
 * Pour chaque jour et chaque catégorie : ~100 unités vendues (peu disparate),
 * réparties en lignes de 1 à 3 articles à des heures d'ouverture (11h-22h).
 */
export function genererDonneesFake(): void {
    db.exec("DELETE FROM sales");
    db.exec("DELETE FROM jours");
    const insert = db.prepare(
        "INSERT INTO sales (jour, ts, categorie, article, prix, quantite, paiement) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const insertJour = db.prepare("INSERT INTO jours (jour, clients) VALUES (?, ?)");

    db.exec("BEGIN");
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const jour = dateStr(d);
        let itemsJour = 0;

        for (const [cat, arts] of Object.entries(CATALOGUE)) {
            const noms = Object.keys(arts);
            const dominant = DOMINANT[cat];
            let restant = randInt(85, 115); // ~100 par catégorie

            while (restant > 0) {
                const nom = choisirPondere(noms, dominant);
                const q = Math.min(restant, randInt(1, 3));
                restant -= q;
                itemsJour += q;

                const ts = new Date(
                    d.getFullYear(), d.getMonth(), d.getDate(),
                    randInt(11, 22), randInt(0, 59), randInt(0, 59)
                );
                const paiement = Math.random() < 0.5 ? "esp" : "cb";
                insert.run(jour, ts.getTime(), cat, nom, arts[nom], q, paiement);
            }
        }

        // Nombre de clients = articles vendus / panier moyen (~3 articles par client)
        const clients = Math.max(1, Math.round(itemsJour / randFloat(2.8, 3.8)));
        insertJour.run(jour, clients);
    }
    db.exec("COMMIT");
}

// Résumé pour vérification (quantité + CA par jour et catégorie)
export function resumeParJourCategorie(): unknown[] {
    return db.prepare(
        `SELECT jour, categorie,
                SUM(quantite)            AS quantite,
                ROUND(SUM(prix*quantite),2) AS ca
         FROM sales
         GROUP BY jour, categorie
         ORDER BY jour DESC, categorie`
    ).all();
}

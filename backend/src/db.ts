import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ICI = dirname(fileURLToPath(import.meta.url));
const CHEMIN_DB = join(ICI, "..", "data.db");

export const db = new DatabaseSync(CHEMIN_DB);

// Une ligne = une ligne d'article vendue (un "panier" est éclaté en plusieurs lignes).
// On garde le timestamp précis pour pouvoir agréger heure par heure, et la date
// métier (jour) pour regrouper une journée (6h -> 5h le lendemain).
db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        jour      TEXT    NOT NULL,   -- date métier "YYYY-MM-DD"
        ts        INTEGER NOT NULL,   -- timestamp epoch (ms)
        categorie TEXT    NOT NULL,
        article   TEXT    NOT NULL,
        prix      REAL    NOT NULL,
        quantite  INTEGER NOT NULL,
        paiement  TEXT    NOT NULL    -- 'esp' | 'cb'
    );
    CREATE INDEX IF NOT EXISTS idx_sales_jour ON sales(jour);

    -- Nombre de clients (= encaissements) par journée, pour le panier moyen
    CREATE TABLE IF NOT EXISTS jours (
        jour    TEXT    PRIMARY KEY,
        clients INTEGER NOT NULL
    );
`);

export interface SaleRow {
    jour: string;
    ts: number;
    categorie: string;
    article: string;
    prix: number;
    quantite: number;
    paiement: string;
}

// Catalogue côté serveur (miroir de frontend/src/TS/Articles.ts).
// Sert à connaître la catégorie et le prix de chaque article lors de
// l'ingestion d'une journée et de la génération des données de test.
export const CATALOGUE: Record<string, Record<string, number>> = {
    "glaces": { "Simple": 3.5, "Double": 5.5, "Triple": 7.5 },
    "crepes": { "Sucre": 3, "Nutella": 4, "Caramel": 4 },
    "boissons fraiches": { "Eau": 2, "Soda": 2.5, "Sac": 0.2 },
    "boissons chaudes": { "Café": 2, "Thé": 2.5, "Cappuccino": 3 },
};

export const CATEGORIES = Object.keys(CATALOGUE);

// Article qui domine les ventes de chaque catégorie (pour des données réalistes)
export const DOMINANT: Record<string, string> = {
    "glaces": "Simple",
    "crepes": "Sucre",
    "boissons fraiches": "Eau",
    "boissons chaudes": "Café",
};

// Index inverses : nom d'article -> catégorie / prix
export const categorieDe: Record<string, string> = {};
export const prixDe: Record<string, number> = {};
for (const [cat, arts] of Object.entries(CATALOGUE)) {
    for (const [nom, prix] of Object.entries(arts)) {
        categorieDe[nom] = cat;
        prixDe[nom] = prix;
    }
}

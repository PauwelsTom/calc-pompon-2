// Catalogue des articles, par catégorie : { catégorie: { nom: prix } }.
// Modifier cette liste suffit à mettre à jour toute l'application
// (boutons de la caisse, graphiques du récap, etc.).
export const articles: Record<string, Record<string, number>> = {
    "glaces": {
        "Simple": 3.50,
        "Double": 5.50,
        "Triple": 7.50,
    },

    "crepes": {
        "Sucre": 3.00,
        "Nutella": 4.00,
        "Caramel": 4.00,
    },

    "boissons fraiches": {
        "Eau": 2.00,
        "Soda": 2.50,
        "Sac": 0.20,
    },

    "boissons chaudes": {
        "Café": 2.00,
        "Thé": 2.50,
        "Cappuccino": 3.00,
    },
};

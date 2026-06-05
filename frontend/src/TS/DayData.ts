// Données de la journée, conservées localement (utilisables hors ligne).
// Elles ne sont envoyées au serveur qu'au moment du reset de fin de journée.

export type Paiement = "esp" | "cb";

// Un article tel qu'il a été encaissé (on fige le prix au moment de la vente)
export interface SaleItem {
    nom: string;
    prix: number;
    quantite: number;
}

// Une transaction = un encaissement (panier complet ou split)
export interface Transaction {
    id: string;
    timestamp: number;
    paiement: Paiement;
    items: SaleItem[];
    total: number;
}

export interface DayData {
    // Montants encaissés
    espece: number;
    cb: number;
    // Quantité totale vendue par article sur la journée (pour les graphiques)
    ventes: Record<string, number>;
    // Historique détaillé des encaissements (envoyé au serveur au reset)
    historique: Transaction[];
}

export const emptyDay = (): DayData => ({
    espece: 0,
    cb: 0,
    ventes: {},
    historique: [],
});

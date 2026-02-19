export class Article {
    nom: string;
    prix: number;
    quantite: number;

    constructor(nom: string, prix: number, quantite: number = 0) {
        this.nom = nom;
        this.prix = prix;
        this.quantite = quantite;
    }

    ajouter(qte: number = 1): void {
        this.quantite += qte;
    }

    retirer(qte: number = 1): void {
        this.quantite = Math.max(0, this.quantite - qte);
    }

    getTotal(): number {
        return this.prix * this.quantite;
    }
}

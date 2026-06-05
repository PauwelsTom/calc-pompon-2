export class Article {
    nom: string;
    prix: number;
    type: string;
    quantite: number;

    constructor(nom: string, prix: number, type: string, quantite: number = 0) {
        this.nom = nom;
        this.prix = prix;
        this.type = type
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

// Une sélection associe un nom d'article à une quantité (utilisé par le mode Split)
export type Selection = Record<string, number>;

export class ArticleList {
    list: Array<Article>;

    constructor(list: Array<Article>) {
        this.list = list;
    }

    // Renvoie la liste des types uniques (dans l'ordre d'apparition)
    type_list(): string[] {
        const types = this.list.map(article => article.type);
        return Array.from(new Set(types));
    }

    // Renvoie les articles d'un type donné (limité pour l'affichage en ligne)
    sub_list(type: string, max: number = 4): ArticleList {
        const list = this.list.filter(article => article.type === type).slice(0, max);
        return new ArticleList(list);
    }

    // Regroupe TOUS les articles par type (utilisé par la page récap)
    groupes(): { type: string; articles: Article[] }[] {
        return this.type_list().map(type => ({
            type,
            articles: this.list.filter(article => article.type === type),
        }));
    }

    // Retrouve un article par son nom
    find(nom: string): Article | undefined {
        return this.list.find(a => a.nom === nom);
    }

    // Total du panier
    total(): number {
        return this.list.reduce((sum, article) => sum + article.getTotal(), 0);
    }

    // Total d'une sélection (mode Split)
    totalSelection(selection: Selection): number {
        return Object.entries(selection).reduce((sum, [nom, qte]) => {
            const article = this.find(nom);
            return sum + (article ? article.prix * qte : 0);
        }, 0);
    }

    // Reset toutes les quantités
    reset(): ArticleList {
        this.list.forEach(article => article.quantite = 0);
        return new ArticleList(this.list)
    }

    ajouter(nom: string): ArticleList {
        const article = this.find(nom);
        if (!article) return this;

        article.ajouter(1);
        return new ArticleList(this.list);
    }

    retirer(nom: string): ArticleList {
        const article = this.find(nom);
        if (!article) return this;

        article.retirer(1);
        return new ArticleList(this.list);
    }

    // Retire les quantités d'une sélection du panier (mode Split)
    retirerSelection(selection: Selection): ArticleList {
        this.list.forEach(article => {
            const qte = selection[article.nom] ?? 0;
            if (qte > 0) article.retirer(qte);
        });
        return new ArticleList(this.list);
    }
}

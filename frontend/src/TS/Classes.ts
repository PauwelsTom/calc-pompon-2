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

export class ArticleList {
    list: Array<Article>;

    constructor(list: Array<Article>) {
        this.list = list;
    }

    // Renvoie la liste des types uniques
    type_list(): string[] {
        const types = this.list.map(article => article.type);
        return Array.from(new Set(types));
    }

    // Renvoie les articles d'un type donné
    sub_list(type: string, max: number = 4): ArticleList {
        const list = this.list.filter(article => article.type === type).slice(0, max);
        return new ArticleList(list);
    }

    // (bonus utile pour une caisse)
    total(): number {
        return this.list.reduce((sum, article) => sum + article.getTotal(), 0);
    }

    // (bonus) reset toutes les quantités
    reset(): ArticleList {
        this.list.forEach(article => article.quantite = 0);
        return new ArticleList(this.list)
    }

    ajouter(nom: string): ArticleList {
        const article = this.list.find(a => a.nom === nom);
        if (!article) return this;

        article.ajouter(1);
        return new ArticleList(this.list);
    }

    retirer(nom: string): ArticleList {
        const article = this.list.find(a => a.nom === nom);
        if (!article) return this;

        article.retirer(1);
        return new ArticleList(this.list);
    }   
}
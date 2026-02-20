import { Article, ArticleList } from "./Classes";

export class Request {
    static host = "127.0.0.1";
    static port = "6666";
    static url = this.host + ":" + this.port;

    static get_products = () => {
        console.warn("TODO: Requete get_products");
        const list = [
            new Article("Simple", 2.5, "Glace"),
            new Article("Double", 4, "Glace"),
            new Article("Triple", 5.5, "Glace"),
            new Article("Sucre", 4, "Crepe"),
            new Article("Nutella", 5, "Crepe"),
            new Article("Caramel", 5, "Crepe"),
            new Article("Eau", 2, "Boisson"),
            new Article("Soda", 2.5, "Boisson"),
            new Article("Café", 1.5, "Boisson"),
            new Article("Sac", 0.2, "Autre"),
            new Article("Chantilly", 1, "Autre"),
        ]
        return new ArticleList(list);
    }
};
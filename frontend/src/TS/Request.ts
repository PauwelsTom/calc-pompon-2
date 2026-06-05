import { Article, ArticleList } from "./Classes";
import type { DayData } from "./DayData";
import { articles as catalogue } from "./Articles";

// ---- Types des réponses de l'API stats ----
export interface ComparaisonData {
    date: string;
    metric: "ca" | "count";
    categorie: string;
    ref: string;
    refLabel: string;
    total: { jour: number; reference: number; unite: "ca" | "ventes" };
    clients: { jour: number; reference: number };
    horaire: { heures: string[]; jour: number[]; reference: number[] };
    categories: { categorie: string; valeur: number; reference: number }[];
}

export interface GlobalData {
    nbJours: number;
    caTotal: number;
    ventesTotal: number;
    clientsTotal: number;
    caMoyenJour: number;
    clientsMoyenJour: number;
    panierMoyen: number;
    repartitionPaiement: { espece: number; cb: number };
    parCategorie: { categorie: string; caMoyenJour: number; ventesMoyenJour: number }[];
    meilleursArticles: { article: string; categorie: string; quantite: number }[];
}

export class Request {
    // API servie sur la même origine que le front (en dev : proxy Vite vers :4000 ;
    // en prod : Express sert le build + l'API). On utilise donc des chemins relatifs.
    static API = "";

    // Catalogue des produits (hors ligne, pas de réseau).
    static get_products = (): ArticleList => {
        const list: Article[] = [];
        for (const [type, produits] of Object.entries(catalogue)) {
            for (const [nom, prix] of Object.entries(produits)) {
                list.push(new Article(nom, prix, type));
            }
        }
        return new ArticleList(list);
    };

    // Envoie la journée au serveur lors du reset (ingestion en DB).
    static send_day_data = async (data: DayData): Promise<boolean> => {
        try {
            const res = await fetch(`${Request.API}/jour`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.ok;
        } catch (e) {
            console.warn("Serveur injoignable — envoi simulé (mode dev).", e);
            return true;
        }
    };

    // ---- API statistiques ----
    static getDates = async (): Promise<string[]> => {
        const res = await fetch(`${Request.API}/api/dates`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
    };

    static getComparaison = async (p: { date: string; metric: string; categorie: string; ref: string }): Promise<ComparaisonData> => {
        const q = new URLSearchParams(p as Record<string, string>);
        const res = await fetch(`${Request.API}/api/comparaison?${q.toString()}`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
    };

    static getGlobal = async (): Promise<GlobalData> => {
        const res = await fetch(`${Request.API}/api/global`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
    };
}

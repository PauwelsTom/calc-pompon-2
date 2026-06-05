import { useCallback, useState } from "react";
import type { DayData, Paiement, SaleItem, Transaction } from "./DayData";
import { emptyDay } from "./DayData";
import { Request } from "./Request";

const STORAGE_KEY = "caisse.jour.v1";

function chargerJour(): DayData {
    try {
        const brut = localStorage.getItem(STORAGE_KEY);
        if (brut) {
            // On fusionne avec emptyDay() pour tolérer un ancien format incomplet
            return { ...emptyDay(), ...(JSON.parse(brut) as Partial<DayData>) };
        }
    } catch (e) {
        console.error("Lecture des données locales impossible :", e);
    }
    return emptyDay();
}

function sauverJour(data: DayData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Sauvegarde des données locales impossible :", e);
    }
}

function genererId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export interface DayStore {
    data: DayData;
    /** Enregistre un encaissement (espèces ou CB) localement. */
    recordSale: (items: SaleItem[], total: number, paiement: Paiement) => void;
    /** Envoie la journée au serveur puis remet les compteurs à zéro (si l'envoi réussit). */
    resetDay: () => Promise<boolean>;
}

/**
 * Source de vérité des données de la journée.
 * Tout est persistant dans le localStorage : la caisse et le récap
 * fonctionnent entièrement hors ligne. Seul resetDay() contacte le serveur.
 */
export function useDayData(): DayStore {
    const [data, setData] = useState<DayData>(chargerJour);

    const recordSale = useCallback((items: SaleItem[], total: number, paiement: Paiement) => {
        setData(prev => {
            const ventes: Record<string, number> = { ...prev.ventes };
            for (const item of items) {
                ventes[item.nom] = (ventes[item.nom] ?? 0) + item.quantite;
            }

            const transaction: Transaction = {
                id: genererId(),
                timestamp: Date.now(),
                paiement,
                items,
                total,
            };

            const suivant: DayData = {
                espece: prev.espece + (paiement === "esp" ? total : 0),
                cb: prev.cb + (paiement === "cb" ? total : 0),
                ventes,
                historique: [...prev.historique, transaction],
            };

            sauverJour(suivant);
            return suivant;
        });
    }, []);

    const resetDay = useCallback(async (): Promise<boolean> => {
        // On lit la version persistée (source de vérité)
        const snapshot = chargerJour();
        const envoye = await Request.send_day_data(snapshot);
        if (envoye) {
            const frais = emptyDay();
            sauverJour(frais);
            setData(frais);
        }
        return envoye;
    }, []);

    return { data, recordSale, resetDay };
}

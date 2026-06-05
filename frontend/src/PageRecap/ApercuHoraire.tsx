import type React from "react"
import "./ApercuHoraire.css"
import type { Transaction } from "../TS/DayData"
import type { Metrique } from "./Carrousel"

interface ApercuHoraireProps {
    historique: Transaction[]
    // nom d'article -> catégorie (pour filtrer par catégorie)
    categorieParNom: Record<string, string>
    // catégorie sélectionnée, ou null pour "Toutes catégories"
    categorie: string | null
    metrique: Metrique
}

// La journée va de 6h du matin jusqu'à 5h le lendemain.
// On place chaque heure sur un axe linéaire : 6h -> 0, 7h -> 1, ... 5h -> 23.
const indexHeure = (ts: number): number => {
    const h = new Date(ts).getHours()
    return h >= 6 ? h - 6 : h + 18
}
const labelHeure = (index: number): string => `${(index + 6) % 24}h`

const ApercuHoraire: React.FC<ApercuHoraireProps> = ({ historique, categorieParNom, categorie, metrique }) => {

    // Valeur (quantité ou CA) par heure, filtrée par catégorie
    const valeurs = new Array<number>(24).fill(0)
    // Plage affichée : de la première à la dernière vente (toutes catégories confondues)
    let minIdx = Infinity
    let maxIdx = -Infinity

    for (const tx of historique) {
        if (tx.items.length === 0) continue
        const idx = indexHeure(tx.timestamp)
        if (idx < minIdx) minIdx = idx
        if (idx > maxIdx) maxIdx = idx
        for (const item of tx.items) {
            if (categorie !== null && categorieParNom[item.nom] !== categorie) continue
            valeurs[idx] += metrique === "qte" ? item.quantite : item.quantite * item.prix
        }
    }

    const vide = maxIdx < minIdx

    const barres = vide
        ? []
        : Array.from({ length: maxIdx - minIdx + 1 }, (_, k) => {
            const idx = minIdx + k
            return { heure: labelHeure(idx), valeur: valeurs[idx] }
        })

    const max = Math.max(1, ...barres.map(b => b.valeur))

    const formater = (v: number): string =>
        metrique === "qte" ? String(v) : Math.round(v) + "€"

    return (
        <div className={"ApercuHoraire" + (metrique === "ca" ? " ApercuHoraireCA" : "")}>
            <h3 className="ApercuTitre">Par heure</h3>
            {vide ? (
                <div className="ApercuVide">Aucune vente</div>
            ) : (
                <div className="ApercuBars">
                    {barres.map(b => (
                        <div className="ApercuCol" key={b.heure}>
                            <span className="ApercuVal">{b.valeur > 0 ? formater(b.valeur) : ""}</span>
                            <div className="ApercuBarZone">
                                <div className="ApercuBarFill" style={{ height: `${(b.valeur / max) * 100}%` }}/>
                            </div>
                            <span className="ApercuHeure">{b.heure}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ApercuHoraire;

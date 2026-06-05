import type React from "react"
import "./BarChart.css"
import type { Article } from "../TS/Classes"
import type { Metrique } from "./Carrousel"

interface BarChartProps {
    titre: string
    articles: Article[]
    // Quantités vendues sur la journée, par nom d'article
    ventes: Record<string, number>
    // Métrique à représenter : quantité vendue ou chiffre d'affaires
    metrique: Metrique
    // Trie les barres par valeur décroissante (ex: Top 5)
    trier?: boolean
    // Ne garde que les N premières barres
    limite?: number
    // Version resserrée (utile quand il y a beaucoup de barres, ex: Top 5)
    compact?: boolean
    // Affiche la catégorie (en gras) avant le nom — utile quand on mélange
    // plusieurs catégories dans un même graphique (ex: Top 5)
    afficherCategorie?: boolean
}

const BarChart: React.FC<BarChartProps> = ({ titre, articles, ventes, metrique, trier = false, limite, compact = false, afficherCategorie = false }) => {

    const donnees = articles.map(a => {
        const qte = ventes[a.nom] ?? 0
        const valeur = metrique === "qte" ? qte : qte * a.prix
        const label = metrique === "qte" ? String(qte) : valeur.toFixed(2) + "€"
        return { nom: a.nom, type: a.type, valeur, label }
    })

    const affichees = (trier ? [...donnees].sort((x, y) => y.valeur - x.valeur) : donnees)
        .slice(0, limite ?? donnees.length)

    // Échelle : la plus grande barre = 100% (min 1 pour éviter la division par 0)
    const max = Math.max(1, ...affichees.map(d => d.valeur))

    return (
        <div className={"BarChart" + (compact ? " BarChartCompact" : "") + (metrique === "ca" ? " BarChartCA" : "")}>
            <h3 className="BarChartTitre">{titre}</h3>
            <div className="BarChartBars">
                {affichees.map(d => (
                    <div className="BarRow" key={d.nom}>
                        <span className="BarQte">{d.label}</span>
                        <div className="BarTrack">
                            <div className="BarFill" style={{ width: `${(d.valeur / max) * 100}%` }}/>
                        </div>
                        <span className="BarNom">
                            {afficherCategorie && <><span className="BarCategorie">{d.type}</span>{" - "}</>}
                            {d.nom}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BarChart;

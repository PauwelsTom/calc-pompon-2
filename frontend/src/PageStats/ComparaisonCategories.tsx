import type React from "react"
import type { ComparaisonData } from "../TS/Request"

const ECHELLE = 0.82

// Comparaison par catégorie : 2 barres horizontales (jour + référence) par catégorie.
const ComparaisonCategories: React.FC<{ data: ComparaisonData }> = ({ data }) => {
    const cats = data.categories
    const max = Math.max(1, ...cats.flatMap(c => [c.valeur, c.reference]))
    const fmt = (v: number) => (data.metric === "ca" ? v.toFixed(0) + "€" : String(v))

    const cls = "CompSlide CompChart" + (data.metric === "ca" ? " CompCA" : "")

    return (
        <div className={cls}>
            <div className="CompLegende">
                <span><i className="lg lgJour" /> Jour</span>
                <span><i className="lg lgRef" /> {data.refLabel}</span>
            </div>

            <div className="CompCatsH">
                {cats.map(c => (
                    <div className="CompCatGroupe" key={c.categorie}>
                        <span className="CompCatNomH">{c.categorie}</span>
                        <div className="CompCatBarres">
                            <div className="CompRowTrack CompCatTrack">
                                <div className="CompBarH" style={{ width: `${(c.valeur / max) * 100 * ECHELLE}%` }} />
                                <span className="CompRowVal" style={{ left: `${(c.valeur / max) * 100 * ECHELLE}%` }}>{fmt(c.valeur)}</span>
                            </div>
                            <div className="CompRowTrack CompCatTrack">
                                <div className="CompBarH CompBarRef" style={{ width: `${(c.reference / max) * 100 * ECHELLE}%` }} />
                                <span className="CompRowVal" style={{ left: `${(c.reference / max) * 100 * ECHELLE}%` }}>{fmt(c.reference)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ComparaisonCategories;

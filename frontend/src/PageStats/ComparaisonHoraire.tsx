import type React from "react"
import type { ComparaisonData } from "../TS/Request"

// Les barres/courbe occupent au plus 82% de la largeur : le reste sert aux valeurs.
const ECHELLE = 0.82

// Lisse une suite de points en courbe (spline de Catmull-Rom -> Bézier cubiques).
function cheminLisse(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return ""
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[i + 2] ?? p2
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return d
}

// Journée actuelle = barres horizontales ; référence = courbe lissée par-dessus.
const ComparaisonHoraire: React.FC<{ data: ComparaisonData }> = ({ data }) => {
    const { heures, jour, reference } = data.horaire
    const n = heures.length
    const max = Math.max(1, ...jour, ...reference)
    const fmt = (v: number) => (data.metric === "ca" ? v.toFixed(0) + "€" : String(v))

    // Points de la courbe (mêmes coordonnées que les barres : x = valeur, y = ligne)
    const d = cheminLisse(reference.map((v, i) => ({ x: (v / max) * 100 * ECHELLE, y: i + 0.5 })))

    const cls = "CompSlide CompChart" + (data.metric === "ca" ? " CompCA" : "")

    return (
        <div className={cls}>
            <div className="CompLegende">
                <span><i className="lg lgJour" /> Jour</span>
                <span><i className="lg lgRef" /> {data.refLabel}</span>
            </div>

            {n === 0 ? (
                <div className="StatsChargement">Aucune vente ce jour-là</div>
            ) : (
                <div className="CompHoraireH">
                    <div className="CompLabelsCol">
                        {heures.map((h, i) => <span className="CompRowLabel" key={i}>{h}</span>)}
                    </div>
                    <div className="CompPlot">
                        {jour.map((v, i) => (
                            <div className="CompBarRow" key={i}>
                                <div className="CompBarH" style={{ width: `${(v / max) * 100 * ECHELLE}%` }} />
                                <span className="CompRowVal" style={{ left: `${(v / max) * 100 * ECHELLE}%` }}>{fmt(v)}</span>
                            </div>
                        ))}
                        <svg className="CompCourbeH" viewBox={`0 0 100 ${n}`} preserveAspectRatio="none">
                            <path d={d} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ComparaisonHoraire;

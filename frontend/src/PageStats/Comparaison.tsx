import type React from "react"
import { useEffect, useState } from "react"
import { Request } from "../TS/Request"
import type { ComparaisonData } from "../TS/Request"
import ComparaisonHoraire from "./ComparaisonHoraire"
import ComparaisonCategories from "./ComparaisonCategories"

const CATEGORIES = ["glaces", "crepes", "boissons fraiches", "boissons chaudes"]
const REFS = [
    { id: "jour-precedent", label: "Journée précédente" },
    { id: "moyenne-7j", label: "Moyenne 7 jours" },
    { id: "moyenne-mois", label: "Moyenne du mois" },
    { id: "meme-jour-semaine", label: "Même jour s-1" },
]

const fmtTotal = (v: number, unite: "ca" | "ventes") =>
    unite === "ca" ? v.toFixed(2) + "€" : `${Math.round(v)} ventes`

interface Props {
    defaultDate: string
    actif: boolean
}

const Comparaison: React.FC<Props> = ({ defaultDate, actif }) => {
    const [date, setDate] = useState(defaultDate)
    const [dates, setDates] = useState<string[]>([])
    const [metric, setMetric] = useState<"ca" | "count">("ca")
    const [categorie, setCategorie] = useState("all")
    const [ref, setRef] = useState("jour-precedent")
    const [data, setData] = useState<ComparaisonData | null>(null)
    const [erreur, setErreur] = useState<string | null>(null)

    useEffect(() => { Request.getDates().then(setDates).catch(() => {}) }, [])

    useEffect(() => {
        if (!actif) return
        let annule = false
        setErreur(null)
        Request.getComparaison({ date, metric, categorie, ref })
            .then(d => { if (!annule) setData(d) })
            .catch(() => { if (!annule) setErreur("Serveur injoignable. Lance le backend : npm run dev (dossier backend/)") })
        return () => { annule = true }
    }, [date, metric, categorie, ref, actif])

    return (
        <div className="StatsContenu">
            <div className="StatsControls">
                <select value={date} onChange={e => setDate(e.target.value)}>
                    {dates.length === 0 && <option value={date}>{date}</option>}
                    {dates.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={metric} onChange={e => setMetric(e.target.value as "ca" | "count")}>
                    <option value="ca">Chiffre d'affaires</option>
                    <option value="count">Nombre de ventes</option>
                </select>
                <select value={categorie} onChange={e => setCategorie(e.target.value)}>
                    <option value="all">Toutes catégories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={ref} onChange={e => setRef(e.target.value)}>
                    {REFS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
            </div>

            {erreur ? (
                <div className="StatsErreur">{erreur}</div>
            ) : !data ? (
                <div className="StatsChargement">Chargement…</div>
            ) : (
                <>
                    <div className={"CompTotal CompChart" + (metric === "ca" ? " CompCA" : "")}>
                        <div className="CompTotalVals">
                            <span className="CompTotalJour">{fmtTotal(data.total.jour, data.total.unite)}</span>
                            <span className="CompTotalVs">vs</span>
                            <span className="CompTotalRef">{fmtTotal(data.total.reference, data.total.unite)}</span>
                        </div>
                        <div className="CompTotalVals CompTotalClients">
                            <span className="CompTotalJour">{Math.round(data.clients.jour)} clients</span>
                            <span className="CompTotalVs">vs</span>
                            <span className="CompTotalRef">{Math.round(data.clients.reference)} clients</span>
                        </div>
                    </div>
                    <div className="CompPiste">
                        <ComparaisonHoraire data={data} />
                        <ComparaisonCategories data={data} />
                    </div>
                </>
            )}
        </div>
    )
}

export default Comparaison;

import type React from "react"
import { useEffect, useState } from "react"
import { Request } from "../TS/Request"
import type { GlobalData } from "../TS/Request"

const Carte: React.FC<{ label: string; valeur: string }> = ({ label, valeur }) => (
    <div className="GlobalCarte">
        <span className="GlobalCarteVal">{valeur}</span>
        <span className="GlobalCarteLab">{label}</span>
    </div>
)

const Global: React.FC<{ actif: boolean }> = ({ actif }) => {
    const [g, setG] = useState<GlobalData | null>(null)
    const [erreur, setErreur] = useState(false)

    useEffect(() => {
        if (!actif) return
        let annule = false
        setErreur(false)
        Request.getGlobal()
            .then(d => { if (!annule) setG(d) })
            .catch(() => { if (!annule) setErreur(true) })
        return () => { annule = true }
    }, [actif])

    if (erreur) return <div className="StatsErreur">Serveur injoignable. Lance le backend : npm run dev (dossier backend/)</div>
    if (!g) return <div className="StatsChargement">Chargement…</div>

    return (
        <div className="GlobalDiv">
            <div className="GlobalCartes">
                <Carte label="CA total" valeur={g.caTotal.toFixed(2) + "€"} />
                <Carte label="CA moyen / jour" valeur={g.caMoyenJour.toFixed(2) + "€"} />
                <Carte label="Panier moyen" valeur={g.panierMoyen.toFixed(2) + "€"} />
                <Carte label="Clients (total)" valeur={String(g.clientsTotal)} />
                <Carte label="Clients / jour" valeur={g.clientsMoyenJour.toFixed(0)} />
                <Carte label="Ventes totales" valeur={String(g.ventesTotal)} />
                <Carte label="Espèces" valeur={g.repartitionPaiement.espece.toFixed(0) + "€"} />
                <Carte label="CB" valeur={g.repartitionPaiement.cb.toFixed(0) + "€"} />
                <Carte label="Jours" valeur={String(g.nbJours)} />
            </div>

            <h3 className="GlobalTitre">Moyenne / jour par catégorie</h3>
            <div className="GlobalListe">
                {g.parCategorie.map(c => (
                    <div className="GlobalLigne" key={c.categorie}>
                        <span className="GlobalCat">{c.categorie}</span>
                        <span>{c.caMoyenJour.toFixed(2)}€ · {c.ventesMoyenJour.toFixed(1)} ventes</span>
                    </div>
                ))}
            </div>

            <h3 className="GlobalTitre">Top articles</h3>
            <div className="GlobalListe">
                {g.meilleursArticles.map((a, i) => (
                    <div className="GlobalLigne" key={a.article}>
                        <span><b>{i + 1}.</b> {a.article} <span className="GlobalCat">({a.categorie})</span></span>
                        <span>{a.quantite}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Global;

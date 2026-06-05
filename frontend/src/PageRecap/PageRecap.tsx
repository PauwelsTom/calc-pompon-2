import type React from "react"
import "./PageRecap.css"
import { useMemo, useState } from "react"
import { Page } from "../TS/Enum"
import type { DayData } from "../TS/DayData"
import { Request } from "../TS/Request"
import BoutonFonction from "../PagePrincipale/BoutonFonction"
import Carrousel from "./Carrousel"

interface PageRecapProps {
    page: Page
    data: DayData
    goToMain: () => void
    onReset: () => void
    goToStats: () => void
}

const PageRecap: React.FC<PageRecapProps> = ({ page, data, goToMain, onReset, goToStats }) => {

    // Affiche le détail espèces / CB au clic sur le total
    const [detail, setDetail] = useState(false)

    // Catalogue statique (pour avoir tous les articles/catégories, même non vendus)
    const catalogue = useMemo(() => Request.get_products(), [])

    const total = data.espece + data.cb

    const get_class = () => {
        let c = "PageRecapDiv";
        // La récap reste en place quand on ouvre les stats (qui passent par-dessus) ;
        // elle ne redescend que pour revenir à la caisse.
        if (page === Page.PRINCIPALE) {
            c += " PageOutDown";
        }
        return c;
    }

    return (
        <div className={get_class()}>
            <button className="RecapRetour" onClick={goToMain}>
                Caisse
            </button>

            <div className="RecapTotal" onClick={() => setDetail(d => !d)}>
                {detail ? (
                    <div className="RecapDetail">
                        <span>Espèces&nbsp;: {data.espece.toFixed(2)}€</span>
                        <span>CB&nbsp;: {data.cb.toFixed(2)}€</span>
                    </div>
                ) : (
                    <span className="RecapMontant">{total.toFixed(2)}€</span>
                )}
            </div>

            <div className="RecapClients">{data.historique.length} clients</div>

            <Carrousel groupes={catalogue.groupes()} ventes={data.ventes} historique={data.historique} visible={page === Page.RECAP}/>

            <div className="RecapBoutons">
                <BoutonFonction label="Reset" onClick={onReset} danger/>
                <BoutonFonction label="Stats" onClick={goToStats}/>
            </div>
        </div>
    )
}

export default PageRecap;

import type React from "react"
import "./PageStats.css"
import { useState } from "react"
import { Page } from "../TS/Enum"
import Comparaison from "./Comparaison"
import Global from "./Global"

interface Props {
    page: Page
    goBack: () => void
    today: string
}

type Onglet = "comparaison" | "global"

const PageStats: React.FC<Props> = ({ page, goBack, today }) => {
    const [onglet, setOnglet] = useState<Onglet>("comparaison")
    const actif = page === Page.STATISTIQUES
    const cls = "PageStatsDiv" + (actif ? "" : " PageOutRight")

    return (
        <div className={cls}>
            <div className="StatsHeader">
                <button className="StatsRetour" onClick={goBack}>←</button>
                <div className="StatsTabs">
                    <button
                        className={"StatsTab" + (onglet === "comparaison" ? " StatsTabActif" : "")}
                        onClick={() => setOnglet("comparaison")}
                    >Comparaison</button>
                    <button
                        className={"StatsTab" + (onglet === "global" ? " StatsTabActif" : "")}
                        onClick={() => setOnglet("global")}
                    >Global</button>
                </div>
            </div>

            {onglet === "comparaison"
                ? <Comparaison defaultDate={today} actif={actif} />
                : <Global actif={actif} />}
        </div>
    )
}

export default PageStats;

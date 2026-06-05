import type React from "react"
import "./BoutonFonction.css"

interface BoutonFonctionProps {
    label: string
    onClick: () => void
    // Met le bouton en surbrillance (ex: mode Split actif, promo en cours)
    actif?: boolean
    // Style destructif (rouge) : ex. bouton Reset
    danger?: boolean
}

const BoutonFonction: React.FC<BoutonFonctionProps> = ({label, onClick, actif = false, danger = false}) => {
    return (
        <button
            className={
                "column-center BoutonFonctionDiv"
                + (actif ? " BoutonFonctionActif" : "")
                + (danger ? " BoutonFonctionDanger" : "")
            }
            onClick={onClick}
        >
            <span>{label}</span>
        </button>
    )
}

export default BoutonFonction;

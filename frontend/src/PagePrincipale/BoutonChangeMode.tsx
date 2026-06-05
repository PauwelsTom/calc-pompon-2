import type React from "react"
import "./BoutonChangeMode.css"
import { Mode } from "../TS/Enum"

interface ChangeModeProps {
    mode: Mode
    onClick: () => void
}

const BoutonChangeMode: React.FC<ChangeModeProps> = ({mode, onClick}) => {
    // "−" dans les modes de retrait (supprimer du panier / de la sélection), "+" sinon.
    const enRetrait = mode === Mode.SUPPRIMER || mode === Mode.SPLIT_RETIRER;
    return (
        <button className={"column-center ChangeModeDiv Bouton" + mode + "_vide"} onClick={onClick}>
            <span>{enRetrait ? "−" : "+"}</span>
        </button>
    )
}

export default BoutonChangeMode;

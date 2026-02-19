import type React from "react"
import "./BoutonChangeMode.css"
import { Mode } from "../TS/Enum"

interface ChangeModeProps {
    mode: Mode
    onClick: (mode: Mode) => void
}

const BoutonChangeMode: React.FC<ChangeModeProps> = ({mode, onClick}) => {
    return (
        <button className={"column-center ChangeModeDiv Bouton" + mode + "_vide"} onClick={() => onClick(mode)}>
            <span>{mode == Mode.AJOUTER ? "+" : "-"}</span>
        </button>
    )
}

export default BoutonChangeMode;
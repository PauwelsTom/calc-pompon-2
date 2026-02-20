import type React from "react"
import "./BoutonFonction.css"

interface ChangeModeProps {
    label: string
    onClick: () => void
}

const BoutonFonction: React.FC<ChangeModeProps> = ({label, onClick}) => {
    return (
        <button className={"column-center BoutonFonctionDiv"} onClick={onClick}>
            <span>{label}</span>
        </button>
    )
}

export default BoutonFonction;
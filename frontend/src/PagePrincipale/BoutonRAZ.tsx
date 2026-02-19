import "./BoutonRAZ.css"

interface ChangeModeProps {
    onClick: () => void
}

const BoutonRAZ: React.FC<ChangeModeProps> = ({onClick}) => {
    return (
        <button className="BoutonRAZ" onClick={onClick}>
            <span>RAZ</span>
        </button>
    )
}

export default BoutonRAZ;
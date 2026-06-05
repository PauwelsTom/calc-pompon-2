import "./colors.css"
import './App.css'
import { useState } from "react"
import PagePrincipale from './PagePrincipale/PagePrincipale'
import PageRecap from './PageRecap/PageRecap'
import PageStats from './PageStats/PageStats'
import { Page } from "./TS/Enum"
import { useDayData } from "./TS/useDayData"

const aujourdhui = (): string => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function App() {

    const [page, setPage] = useState<Page>(Page.PRINCIPALE)
    const jour = useDayData()

    const reset = async () => {
        const confirme = window.confirm(
            "Réinitialiser la journée ?\n\nLes données seront envoyées au serveur puis effacées localement. Cette action est irréversible."
        )
        if (!confirme) return

        const ok = await jour.resetDay()
        if (ok) setPage(Page.PRINCIPALE)
        else alert("Échec de l'envoi au serveur — les données sont conservées localement.")
    }

    return (
        <div className='AppDiv'>
            <PagePrincipale
                recordSale={jour.recordSale}
                goToRecap={() => setPage(Page.RECAP)}
            />
            <PageRecap
                page={page}
                data={jour.data}
                goToMain={() => setPage(Page.PRINCIPALE)}
                onReset={reset}
                goToStats={() => setPage(Page.STATISTIQUES)}
            />
            <PageStats
                page={page}
                goBack={() => setPage(Page.RECAP)}
                today={aujourdhui()}
            />
        </div>
    )
}

export default App

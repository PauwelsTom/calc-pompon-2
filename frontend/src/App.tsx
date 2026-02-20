import "./colors.css"
import './App.css'
import PagePrincipale from './PagePrincipale/PagePrincipale'
import { useState } from "react"
import { Page } from "./TS/Enum"

function App() {

    const [page, setPage] = useState(Page.PRINCIPALE);

    return (
        <div className='AppDiv'>
            <PagePrincipale page={page} changePage={() => setPage(Page.STATISTIQUES)}/>
        </div>
    )
}

export default App

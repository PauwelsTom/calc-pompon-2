import "./PagePrincipale.css"
import React from "react"
import { Mode } from '../TS/Enum'
import { useState } from 'react'
import BoutonChangeMode from "./BoutonChangeMode"
import { Article } from "../TS/Classes"
import LigneBouton from "./LigneBouton"
import BoutonRAZ from "./BoutonRAZ"

interface PageProps {}

const PagePrincipale: React.FC<PageProps> = () => {

    const [mode, setMode] = useState(Mode.AJOUTER)

    const [articles, setArticles] = useState([
        new Article("Simple", 2.5),
        new Article("Double", 4),
        new Article("Triple", 5.5),
    ]);

    const modifQuantite = (nomArticle: string, mode: Mode) => {
        switch(mode) {
            case Mode.AJOUTER:
                setArticles(prev => prev.map(a => a.nom === nomArticle ? new Article(a.nom, a.prix, a.quantite + 1) : a ) );
                return
            
            case Mode.SUPPRIMER:
                setArticles(prev => prev.map(a => a.nom === nomArticle ? new Article(a.nom, a.prix, Math.max(0, a.quantite - 1)) : a ) );
                return
            
            default:
                return
        }        
    }

    const raz = () => {
        setArticles(prev => prev.map(a => new Article(a.nom, a.prix, 0)));
    }

    const changeMode = (m: Mode): void => {
        if (m == Mode.AJOUTER) {
            setMode(Mode.SUPPRIMER);
        } else {
            setMode(Mode.AJOUTER)
        }
    }

    return (
        <div className="column-center PagePrincipaleDiv">
            <BoutonChangeMode mode={mode} onClick={changeMode}/>
            <BoutonRAZ onClick={raz}/>
            <LigneBouton articles={articles} mode={mode} onClick={modifQuantite}/>
        </div>
    )
}

export default PagePrincipale;
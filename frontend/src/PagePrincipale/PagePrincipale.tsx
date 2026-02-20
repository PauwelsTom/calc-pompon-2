import "./PagePrincipale.css"
import React from "react"
import { Mode, Page } from '../TS/Enum'
import { useState } from 'react'
import BoutonChangeMode from "./BoutonChangeMode"
import LigneBouton from "./LigneBouton"
import BoutonRAZ from "./BoutonRAZ"
import { Request } from "../TS/Request"
import BoutonFonction from "./BoutonFonction"

interface PageProps {
    page: Page
    changePage: () => void
}

const PagePrincipale: React.FC<PageProps> = ({page, changePage}) => {

    const [mode, setMode] = useState(Mode.AJOUTER)
    const [articles, setArticles] = useState(Request.get_products());

    const get_class = () => {
        let c = "column-center PagePrincipaleDiv ";
        if (page != Page.PRINCIPALE) {
            c += "PageOutDown"
        }
        return c
    }

    const modifQuantite = (nomArticle: string, mode: Mode) => {
        switch(mode) {
            case Mode.AJOUTER:
                setArticles(articles.ajouter(nomArticle));
                return;
            
            case Mode.SUPPRIMER:
                setArticles(articles.retirer(nomArticle));
                return;
            
            default:
                return;
        }        
    }

    const raz = () => {
        setArticles(articles.reset());
    }

    const changeMode = (m: Mode): void => {
        if (m == Mode.AJOUTER) {
            setMode(Mode.SUPPRIMER);
        } else {
            setMode(Mode.AJOUTER)
        }
    }

    const payer = (mode: string): void => {
        if (mode == "esp") {
            alert("TODO: Ajouter le total au total enregistré [ESPECES]");
        } else {
            alert("TODO: Ajouter le total au total enregistré [CB]");
        }
        raz()
    }

    return (
        <div className={get_class()}>
            <BoutonChangeMode mode={mode} onClick={changeMode}/>
            <BoutonRAZ onClick={raz}/>

            <span className="PrixTotal" onClick={changePage}>{articles.total().toFixed(2)}€</span>
            {
                articles.type_list().map((type) => (
                    <LigneBouton articles={articles.sub_list(type)} mode={mode} onClick={modifQuantite}/>
                ))
            }

            <div className="LigneBoutonDiv">
                <BoutonFonction label="Espèces" onClick={() => payer("esp")}/>
                <BoutonFonction label="CB" onClick={() => payer("cb")}/>
            </div>

            <div className="LigneBoutonDiv">
                <BoutonFonction label="Stats" onClick={() => alert("Not Implemented Yet")}/>
                <BoutonFonction label="Promo" onClick={() => alert("Not Implemented Yet")}/>
                <BoutonFonction label="Split" onClick={() => alert("Not Implemented Yet")}/>
            </div>
        </div>
    )
}

export default PagePrincipale;
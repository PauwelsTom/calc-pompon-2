import type React from "react"
import "./BoutonArticle.css"
import { Mode } from "../TS/Enum"
import type { Article } from "../TS/Classes"

interface ButtonProps {
    article: Article
    onClick: () => void
    mode: Mode
    // Quantité de cet article actuellement dans la sélection (mode Split)
    selectedQte: number
}

const BoutonArticle: React.FC<ButtonProps> = ({ article, onClick, mode, selectedQte }) => {

    // En mode Split (ajout ou retrait), on raisonne sur la sélection.
    const split = mode === Mode.SPLIT || mode === Mode.SPLIT_RETIRER;
    const cartQte = article.quantite;
    const actif = (split ? selectedQte : cartQte) > 0;

    // En split : affichage (sélectionné / panier), ex. (2/4). Sinon : quantité panier.
    const affichage = split
        ? (cartQte > 0 ? `(${selectedQte}/${cartQte})` : "0")
        : String(cartQte);

    const get_class = () => {
        let c = "column-center BoutonArticle Bouton" + mode;
        if (!actif) {
            c += "_vide";
        }
        return c
    }

    return (
        <button onClick={onClick} className={get_class()}>
            <span>{article.nom}</span>
            <span className="ArticlePrix">{article.prix.toFixed(2)}€</span>
            <span className={"ArticleQuantite" + (split ? " ArticleQuantiteSplit" : "")}>{affichage}</span>
        </button>
    )
}

export default BoutonArticle

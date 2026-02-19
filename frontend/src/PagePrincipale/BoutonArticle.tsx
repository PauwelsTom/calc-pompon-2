import "./BoutonArticle.css"
import { Mode } from "../TS/Enum"
import type { Article } from "../TS/Classes"

interface ButtonProps {
    article: Article
    onClick: () => void
    mode: Mode
}

const BoutonArticle: React.FC<ButtonProps> = ({ article, onClick, mode }) => {

    const get_class = () => {
        let c = "column-center BoutonArticle Bouton" + mode;
        if (article.quantite == 0) {
            c += "_vide";
        }
        return c
    }

    return (
        <button onClick={onClick} className={get_class()}>
            <span>{article.nom}</span>
            <span className="ArticlePrix">{article.prix}€</span>
            <span className="ArticleQuantite">{article.quantite}</span>
        </button>
    )
}

export default BoutonArticle

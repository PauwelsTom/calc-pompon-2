import type React from "react"
import type { ArticleList, Selection } from "../TS/Classes"
import type { Mode } from "../TS/Enum"
import "./LigneBouton.css"
import BoutonArticle from "./BoutonArticle"

interface LigneBoutonProps {
    articles: ArticleList
    mode: Mode
    selection: Selection
    onClick: (nomArticle: string, mode: Mode) => void
}

const LigneBouton: React.FC<LigneBoutonProps> = ({articles, mode, selection, onClick}) => {
    return (
        <div className="LigneBoutonDiv">
            {articles.list.map((article) => (
                <BoutonArticle
                    key={article.nom}
                    article={article}
                    mode={mode}
                    selectedQte={selection[article.nom] ?? 0}
                    onClick={() => onClick(article.nom, mode)}
                />
            ))}
        </div>
    )
}

export default LigneBouton;

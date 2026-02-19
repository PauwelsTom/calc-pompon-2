import type React from "react"
import type { Article } from "../TS/Classes"
import type { Mode } from "../TS/Enum"
import "./LigneBouton.css"
import BoutonArticle from "./BoutonArticle"

interface LigneBoutonProps {
    articles: Array<Article>
    mode: Mode
    onClick: (nomArticle: string, mode: Mode) => void
}

const LigneBouton: React.FC<LigneBoutonProps> = ({articles, mode, onClick}) => {
    return (
        <div className="LigneBoutonDiv">
            {articles.map((article) => (
                <BoutonArticle key={article.nom} article={article} mode={mode} onClick={() => onClick(article.nom, mode)}/>
            ))}
        </div>
    )
}

export default LigneBouton;
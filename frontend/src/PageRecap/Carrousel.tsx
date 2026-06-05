import type React from "react"
import "./Carrousel.css"
import { useEffect, useRef, useState } from "react"
import type { Article } from "../TS/Classes"
import type { Transaction } from "../TS/DayData"
import BarChart from "./BarChart"
import ApercuHoraire from "./ApercuHoraire"

// Métrique affichée par les graphiques : quantité vendue ou chiffre d'affaires
export type Metrique = "qte" | "ca"

interface CarrouselProps {
    groupes: { type: string; articles: Article[] }[]
    ventes: Record<string, number>
    historique: Transaction[]
    // true quand la page récap est affichée : on revient alors à la première slide
    visible: boolean
}

interface Slide {
    key: string
    titre: string
    articles: Article[]
    trier: boolean
    limite?: number
    compact?: boolean
    afficherCategorie?: boolean
}

const Carrousel: React.FC<CarrouselProps> = ({ groupes, ventes, historique, visible }) => {

    const pisteRef = useRef<HTMLDivElement>(null)
    const [actif, setActif] = useState(0)
    const [metrique, setMetrique] = useState<Metrique>("qte")
    // Catégorie sélectionnée pour l'aperçu horaire (null = toutes catégories)
    const [categorie, setCategorie] = useState<string | null>(null)

    // À chaque ouverture du récap, on revient sur la première slide (aperçu horaire)
    useEffect(() => {
        if (visible && pisteRef.current) {
            pisteRef.current.scrollTo({ left: 0 })
            setActif(0)
        }
    }, [visible])

    // Correspondance nom d'article -> catégorie (pour filtrer l'historique)
    const categorieParNom: Record<string, string> = {}
    groupes.forEach(g => g.articles.forEach(a => { categorieParNom[a.nom] = g.type }))

    // Slides "barres horizontales" : Top 5 toutes catégories, puis une par catégorie
    const tousArticles = groupes.flatMap(g => g.articles)
    const slides: Slide[] = [
        { key: "__top5__", titre: "Top 5", articles: tousArticles, trier: true, limite: 5, compact: true, afficherCategorie: true },
        ...groupes.map(g => ({ key: g.type, titre: g.type, articles: g.articles, trier: false })),
    ]

    // Met à jour le point actif selon la position de défilement
    const onScroll = () => {
        const piste = pisteRef.current
        if (!piste) return
        const index = Math.round(piste.scrollLeft / piste.clientWidth)
        if (index !== actif) setActif(index)
    }

    const allerA = (index: number) => {
        const piste = pisteRef.current
        if (!piste) return
        piste.scrollTo({ left: index * piste.clientWidth, behavior: "smooth" })
    }

    // Clic sur les graphiques : bascule quantité vendue <-> chiffre d'affaires
    const toggleMetrique = () => setMetrique(m => (m === "qte" ? "ca" : "qte"))

    const pointClass = (i: number) => "CarrouselPoint" + (i === actif ? " CarrouselPointActif" : "")

    return (
        <div className="Carrousel">
            {/* Sélecteur de catégorie (pilote l'aperçu horaire) */}
            <div className="CarrouselCategories">
                <button
                    className={"CarrouselCategorie" + (categorie === null ? " CarrouselCategorieActive" : "")}
                    onClick={() => setCategorie(null)}
                >
                    Toutes catégories
                </button>
                {groupes.map(g => (
                    <button
                        key={g.type}
                        className={"CarrouselCategorie" + (categorie === g.type ? " CarrouselCategorieActive" : "")}
                        onClick={() => setCategorie(g.type)}
                    >
                        {g.type}
                    </button>
                ))}
            </div>

            <div className="CarrouselMetrique">
                {metrique === "qte" ? "Quantité vendue" : "Chiffre d'affaires"}
            </div>

            <div className="CarrouselPiste" ref={pisteRef} onScroll={onScroll} onClick={toggleMetrique}>
                <ApercuHoraire
                    historique={historique}
                    categorieParNom={categorieParNom}
                    categorie={categorie}
                    metrique={metrique}
                />
                {slides.map(s => (
                    <BarChart
                        key={s.key}
                        titre={s.titre}
                        articles={s.articles}
                        ventes={ventes}
                        metrique={metrique}
                        trier={s.trier}
                        limite={s.limite}
                        compact={s.compact}
                        afficherCategorie={s.afficherCategorie}
                    />
                ))}
            </div>

            <div className="CarrouselPoints">
                <button
                    key="__horaire__"
                    className={pointClass(0)}
                    onClick={() => allerA(0)}
                    aria-label="Vue par heure"
                />
                {slides.map((s, i) => (
                    <button
                        key={s.key}
                        className={pointClass(i + 1)}
                        onClick={() => allerA(i + 1)}
                        aria-label={`Voir ${s.titre}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default Carrousel;

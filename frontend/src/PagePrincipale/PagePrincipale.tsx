import type React from "react"
import "./PagePrincipale.css"
import { Mode } from '../TS/Enum'
import { useState } from 'react'
import BoutonChangeMode from "./BoutonChangeMode"
import LigneBouton from "./LigneBouton"
import BoutonRAZ from "./BoutonRAZ"
import { Request } from "../TS/Request"
import BoutonFonction from "./BoutonFonction"
import type { Selection } from "../TS/Classes"
import type { Paiement, SaleItem } from "../TS/DayData"

interface PageProps {
    // Enregistre un encaissement dans les données de la journée (localStorage)
    recordSale: (items: SaleItem[], total: number, paiement: Paiement) => void
    // Navigue vers la page récap
    goToRecap: () => void
}

const PagePrincipale: React.FC<PageProps> = ({ recordSale, goToRecap }) => {

    const [mode, setMode] = useState<Mode>(Mode.AJOUTER)
    const [articles, setArticles] = useState(Request.get_products)

    // Mode Split : sous-ensemble du panier à encaisser séparément
    const [selection, setSelection] = useState<Selection>({})

    // Promo : prix imposé pour le panier complet, ou pour la sélection (mode Split)
    const [promoPanier, setPromoPanier] = useState<number | null>(null)
    const [promoSelection, setPromoSelection] = useState<number | null>(null)

    const splitActif = mode === Mode.SPLIT || mode === Mode.SPLIT_RETIRER
    const promoActive = promoPanier !== null || promoSelection !== null

    // ---- Affichage du total ----
    const totalAffiche = (): number => {
        if (splitActif) {
            return promoSelection ?? articles.totalSelection(selection)
        }
        return promoPanier ?? articles.total()
    }

    // ---- Clic sur un article ----
    const modifQuantite = (nomArticle: string, m: Mode): void => {
        switch (m) {
            case Mode.AJOUTER:
                setArticles(articles.ajouter(nomArticle))
                setPromoPanier(null) // une modif du panier annule la promo
                return

            case Mode.SUPPRIMER:
                setArticles(articles.retirer(nomArticle))
                setPromoPanier(null)
                return

            case Mode.SPLIT: {
                // On incrémente la sélection sans dépasser la quantité du panier
                const dansPanier = articles.find(nomArticle)?.quantite ?? 0
                setSelection(prev => {
                    const actuel = prev[nomArticle] ?? 0
                    return { ...prev, [nomArticle]: Math.min(dansPanier, actuel + 1) }
                })
                setPromoSelection(null)
                return
            }

            case Mode.SPLIT_RETIRER: {
                // On décrémente la sélection (sans descendre sous 0)
                setSelection(prev => {
                    const actuel = prev[nomArticle] ?? 0
                    return { ...prev, [nomArticle]: Math.max(0, actuel - 1) }
                })
                setPromoSelection(null)
                return
            }
        }
    }

    // ---- Bouton vider (en haut à gauche) ----
    const raz = (): void => {
        if (splitActif) {
            setSelection({})
            setPromoSelection(null)
        } else {
            setArticles(articles.reset())
            setPromoPanier(null)
        }
    }

    // ---- Bouton mode (en haut à droite) : bascule ajouter / retirer ----
    // Hors split : Ajouter <-> Supprimer (panier).
    // En split   : ajout sélection <-> retrait sélection (sans quitter le split).
    const changeMode = (): void => {
        switch (mode) {
            case Mode.AJOUTER: setMode(Mode.SUPPRIMER); return
            case Mode.SUPPRIMER: setMode(Mode.AJOUTER); return
            case Mode.SPLIT: setMode(Mode.SPLIT_RETIRER); return
            case Mode.SPLIT_RETIRER: setMode(Mode.SPLIT); return
        }
    }

    // ---- Bouton Split (en bas) : entre/sort du mode split ----
    const toggleSplit = (): void => {
        if (splitActif) {
            setMode(Mode.AJOUTER)
        } else {
            setMode(Mode.SPLIT)
        }
        setSelection({})
        setPromoSelection(null)
    }

    // ---- Bouton Promo : impose un prix ----
    const promo = (): void => {
        if (splitActif) {
            const base = articles.totalSelection(selection)
            const saisie = window.prompt(`Nouveau prix de la sélection (actuel : ${base.toFixed(2)}€)`, base.toFixed(2))
            if (saisie === null) return
            const valeur = parseFloat(saisie.replace(",", "."))
            if (!isNaN(valeur) && valeur >= 0) setPromoSelection(valeur)
        } else {
            const base = articles.total()
            const saisie = window.prompt(`Nouveau prix total (actuel : ${base.toFixed(2)}€)`, base.toFixed(2))
            if (saisie === null) return
            const valeur = parseFloat(saisie.replace(",", "."))
            if (!isNaN(valeur) && valeur >= 0) setPromoPanier(valeur)
        }
    }

    // ---- Encaissement (Espèces / CB) ----
    const payer = (paiement: Paiement): void => {
        if (splitActif) {
            const items: SaleItem[] = Object.entries(selection)
                .filter(([, qte]) => qte > 0)
                .map(([nom, qte]) => {
                    const article = articles.find(nom)!
                    return { nom, prix: article.prix, quantite: qte }
                })
            if (items.length === 0) return

            const total = promoSelection ?? articles.totalSelection(selection)
            recordSale(items, total, paiement)

            // On retire la sélection du panier
            const restant = articles.retirerSelection(selection)
            setArticles(restant)
            setSelection({})
            setPromoSelection(null)

            // Si le panier est vide, on ressort du mode split
            if (restant.list.every(a => a.quantite === 0)) {
                setMode(Mode.AJOUTER)
            }
        } else {
            const items: SaleItem[] = articles.list
                .filter(a => a.quantite > 0)
                .map(a => ({ nom: a.nom, prix: a.prix, quantite: a.quantite }))
            if (items.length === 0) return

            const total = promoPanier ?? articles.total()
            recordSale(items, total, paiement)

            setArticles(articles.reset())
            setPromoPanier(null)
        }
    }

    return (
        <div className="PagePrincipaleDiv">
            <BoutonChangeMode mode={mode} onClick={changeMode}/>
            <BoutonRAZ onClick={raz}/>

            <span className="PrixTotal">{totalAffiche().toFixed(2)}€</span>
            {
                articles.type_list().map((type) => (
                    <LigneBouton
                        key={type}
                        articles={articles.sub_list(type)}
                        mode={mode}
                        selection={selection}
                        onClick={modifQuantite}
                    />
                ))
            }

            <div className="LigneBoutonDiv">
                <BoutonFonction label="Espèces" onClick={() => payer("esp")}/>
                <BoutonFonction label="CB" onClick={() => payer("cb")}/>
            </div>

            <div className="LigneBoutonDiv">
                <BoutonFonction label="Récap" onClick={goToRecap}/>
                <BoutonFonction label="Promo" onClick={promo} actif={promoActive}/>
                <BoutonFonction label="Split" onClick={toggleSplit} actif={splitActif}/>
            </div>
        </div>
    )
}

export default PagePrincipale;

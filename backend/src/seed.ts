// Script de (re)génération des données de test : `npm run seed`
import { genererDonneesFake, resumeParJourCategorie } from "./fakeData";

genererDonneesFake();
console.log("Données de test régénérées (7 derniers jours).\n");
console.table(resumeParJourCategorie());

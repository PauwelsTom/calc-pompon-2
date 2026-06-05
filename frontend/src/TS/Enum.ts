// Les `enum` TS ne sont pas autorisés ici (`erasableSyntaxOnly` dans tsconfig),
// car ils génèrent du code à l'exécution. On utilise donc des objets `const`
// + un type union : l'usage reste identique (`Mode.AJOUTER`, `mode: Mode`).

export const Mode = {
  AJOUTER: "AJOUTER",
  SUPPRIMER: "SUPPRIMER",
  SPLIT: "SPLIT",                 // split : ajouter à la sélection (rose)
  SPLIT_RETIRER: "SPLIT_RETIRER", // split : retirer de la sélection (violet)
} as const;
export type Mode = (typeof Mode)[keyof typeof Mode];

export const Page = {
  PRINCIPALE: "Principale",
  RECAP: "Recap",
  STATISTIQUES: "Statistiques",
} as const;
export type Page = (typeof Page)[keyof typeof Page];

export type Locale = "fr" | "en";

const copy = {
  fr: {
    tagline: "Comprendre par l’exécution",
    editor: "Éditeur",
    guide: "Guide du langage",
    newProgram: "Nouveau",
    open: "Ouvrir",
    save: "Enregistrer",
    run: "Exécuter",
    ready: "Prêt",
    errors: "problème",
    output: "Sortie",
    problems: "Problèmes",
    emptyOutput: "La sortie de votre programme apparaîtra ici.",
    noProblems: "Aucun problème détecté.",
    keyboardRun: "Ctrl + Entrée pour exécuter",
    problemAt: "Ligne {line}, colonne {column}",
    suggestion: "Comment corriger",
    newTitle: "Créer un programme",
    newDescription: "Donnez-lui un nom. Algorithm Studio prépare le fichier et la structure de départ.",
    programName: "Nom du programme",
    programPlaceholder: "CalculMoyenne",
    template: "Point de départ",
    blank: "Programme vide",
    example: "Exemple simple",
    cancel: "Annuler",
    create: "Créer le programme",
    themeLight: "Activer le thème clair",
    themeDark: "Activer le thème sombre",
    language: "English",
    fileUnsaved: "Non enregistré",
  },
  en: {
    tagline: "Understand by running",
    editor: "Editor",
    guide: "Language guide",
    newProgram: "New",
    open: "Open",
    save: "Save",
    run: "Run",
    ready: "Ready",
    errors: "problem",
    output: "Output",
    problems: "Problems",
    emptyOutput: "Your program output will appear here.",
    noProblems: "No problems found.",
    keyboardRun: "Ctrl + Enter to run",
    problemAt: "Line {line}, column {column}",
    suggestion: "How to fix it",
    newTitle: "Create a program",
    newDescription: "Give it a name. Algorithm Studio prepares the file and starter structure.",
    programName: "Program name",
    programPlaceholder: "AverageCalculation",
    template: "Starting point",
    blank: "Empty program",
    example: "Simple example",
    cancel: "Cancel",
    create: "Create program",
    themeLight: "Use light theme",
    themeDark: "Use dark theme",
    language: "Français",
    fileUnsaved: "Unsaved",
  },
} as const;

export type Copy = (typeof copy)[Locale];

export function getCopy(locale: Locale): Copy {
  return copy[locale];
}

export function format(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    text,
  );
}

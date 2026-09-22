import {
  BookOpen,
  Braces,
  Calculator,
  Check,
  ChevronRight,
  Code2,
  Database,
  GitBranch,
  Keyboard,
  ListChecks,
  Search,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "./i18n";

type Topic = {
  id: string;
  title: string;
  summary: string;
  body: string;
  code?: string;
  table?: string[][];
};
type Chapter = {
  id: string;
  title: string;
  icon: typeof BookOpen;
  topics: Topic[];
};

const content: Record<Locale, Chapter[]> = {
  fr: [
    {
      id: "start",
      title: "Commencer",
      icon: BookOpen,
      topics: [
        {
          id: "program",
          title: "Structure d’un programme",
          summary: "Le squelette obligatoire et l’ordre des sections.",
          body: "Un programme porte un nom. Les constantes, variables et sous-programmes viennent avant le bloc principal délimité par Debut et Fin. Les mots-clés ne tiennent pas compte des majuscules et les formes accentuées usuelles sont acceptées.",
          code: `Algorithme Bonjour\nConstantes\n    VERSION = 1\nVariables\n    nom : Chaine\nDebut\n    nom <- "Ada"\n    Ecrire("Bonjour ", nom)\nFin`,
        },
        {
          id: "comments",
          title: "Commentaires et identifiants",
          summary: "Écrire un code lisible en Unicode.",
          body: "Un commentaire commence par // et se termine avec la ligne. Les identifiants peuvent contenir des lettres Unicode, des chiffres après le premier caractère et le soulignement _.",
        },
      ],
    },
    {
      id: "data",
      title: "Données",
      icon: Database,
      topics: [
        {
          id: "types",
          title: "Types et constantes",
          summary: "Les cinq types scalaires du langage.",
          body: "Une variable accepte uniquement les valeurs de son type. Un Reel accepte aussi un entier. Un Caractere contient exactement un caractère. Une constante est calculée une fois et ne peut plus être modifiée.",
          table: [
            ["Type", "Exemple", "Valeur initiale"],
            ["Entier", "42", "0"],
            ["Reel", "3.14", "0"],
            ["Chaine", '"texte"', '""'],
            ["Caractere", '"A"', '""'],
            ["Booleen", "Vrai / Faux", "Faux"],
          ],
          code: `Constantes\n    MAX = 100\nVariables\n    age : Entier\n    moyenne : Reel\n    admis : Booleen`,
        },
        {
          id: "arrays",
          title: "Tableaux et matrices",
          summary: "Des collections bornées à une ou plusieurs dimensions.",
          body: "Chaque dimension indique sa borne inférieure et supérieure. Les indices hors limites produisent une erreur précise. Les éléments non affectés utilisent la valeur initiale de leur type.",
          code: `Variables\n    notes : Tableau[1..30] de Reel\n    grille : Tableau[0..2, 0..2] de Entier\nDebut\n    notes[1] <- 14.5\n    grille[1, 2] <- 7\nFin`,
        },
      ],
    },
    {
      id: "expressions",
      title: "Expressions",
      icon: Calculator,
      topics: [
        {
          id: "operators",
          title: "Opérateurs et priorité",
          summary: "Calcul, comparaison et logique booléenne.",
        body: "Les parenthèses passent en premier, puis les opérateurs unaires, la multiplication, l’addition, les comparaisons, ET et enfin OU. Les fonctions standard sont Longueur, Majuscule, Minuscule, Abs, Racine, Arrondi, Min et Max.",
          table: [
            ["Famille", "Opérateurs"],
            ["Unaire", "+  -  NON"],
            ["Multiplication", "*  /  DIV  MOD"],
            ["Addition", "+  -"],
            ["Comparaison", "=  <>  !=  <  <=  >  >="],
            ["Logique", "ET  OU"],
          ],
          code: `admis <- moyenne >= 10 ET absences < 5\nreste <- total MOD 2\nquotient <- total DIV 2`,
        },
      ],
    },
    {
      id: "io",
      title: "Entrées et sorties",
      icon: Keyboard,
      topics: [
        {
          id: "read-write",
          title: "Lire et Ecrire",
          summary: "Dialoguer avec la personne qui exécute le programme.",
          body: "Lire suspend l’exécution jusqu’à la saisie d’une valeur du bon type. Plusieurs variables peuvent être lues dans le même appel. Ecrire rassemble ses arguments sur une ligne.",
          code: `Variables\n    nom : Chaine\n    age : Entier\nDebut\n    Lire(nom, age)\n    Ecrire(nom, " a ", age, " ans")\nFin`,
        },
      ],
    },
    {
      id: "control",
      title: "Contrôle",
      icon: GitBranch,
      topics: [
        {
          id: "conditions",
          title: "Conditions",
          summary: "Choisir une branche selon une expression booléenne.",
          body: "Sinon Si permet d’enchaîner plusieurs cas sans ajouter de niveaux d’imbrication. Sinon reste facultatif.",
          code: `Si note >= 16 Alors\n    Ecrire("Très bien")\nSinon Si note >= 10 Alors\n    Ecrire("Admis")\nSinon\n    Ecrire("Ajourné")\nFinSi`,
        },
        {
          id: "loops",
          title: "Boucles",
          summary:
            "Pour, TantQue et Repeter couvrent les trois formes classiques.",
          body: "Pour connaît ses bornes, TantQue teste avant le bloc et Repeter l’exécute au moins une fois. Pas peut être positif ou négatif.",
          code: `Pour i <- 10 A 0 Pas -2 Faire\n    Ecrire(i)\nFinPour\n\nTantQue actif Faire\n    actif <- Faux\nFinTantQue\n\nRepeter\n    compteur <- compteur + 1\nJusquA compteur = 10`,
        },
      ],
    },
    {
      id: "routines",
      title: "Sous-programmes",
      icon: Workflow,
      topics: [
        {
          id: "functions",
          title: "Fonctions",
          summary: "Calculer et retourner une valeur réutilisable.",
          body: "Les paramètres sont passés par valeur. Chaque appel possède ses propres variables locales, ce qui permet la récursion. Une fonction doit atteindre Retourner avec une valeur du type annoncé.",
          code: `Fonction Factorielle(n : Entier) : Entier\nDebut\n    Si n <= 1 Alors\n        Retourner 1\n    Sinon\n        Retourner n * Factorielle(n - 1)\n    FinSi\nFinFonction`,
        },
        {
          id: "procedures",
          title: "Procédures",
          summary: "Regrouper une action qui ne produit pas de valeur.",
          body: "Une procédure s’appelle comme une instruction. Elle peut recevoir plusieurs paramètres séparés par un point-virgule.",
          code: `Procedure AfficherLigne(texte : Chaine; fois : Entier)\nVariables\n    i : Entier\nDebut\n    Pour i <- 1 A fois Faire\n        Ecrire(texte)\n    FinPour\nFinProcedure`,
        },
      ],
    },
    {
      id: "errors",
      title: "Erreurs et limites",
      icon: ListChecks,
      topics: [
        {
          id: "diagnostics",
          title: "Comprendre un diagnostic",
          summary:
            "Chaque erreur indique une catégorie, une ligne et une correction possible.",
          body: "Les codes ALG-P concernent la syntaxe, ALG-S le sens du programme et les types, ALG-R les problèmes rencontrés pendant l’exécution. La limite de 100 000 instructions protège l’application des boucles infinies.",
        },
        {
          id: "scope",
          title: "Périmètre 1.0",
          summary:
            "Un langage procédural complet pour les cours d’introduction.",
          body: "La version 1.0 couvre les programmes scalaires, tableaux et matrices, saisie, contrôle, fonctions, procédures, portée locale et récursion. Les enregistrements, pointeurs, fichiers, structures dynamiques et dessin dépendent fortement du cursus et ne font pas partie du noyau portable.",
        },
      ],
    },
  ],
  en: [],
};

const english: Record<string, [string, string, string]> = {
  program: [
    "Program structure",
    "The required skeleton and section order.",
    "A program has a name. Constants, variables, and subprograms appear before the main block delimited by Debut and Fin. Keywords are case-insensitive and common accented forms are accepted.",
  ],
  comments: [
    "Comments and identifiers",
    "Write readable Unicode source code.",
    "A comment starts with // and ends with the line. Identifiers may contain Unicode letters, digits after the first character, and the underscore _.",
  ],
  types: [
    "Types and constants",
    "The language's five scalar types.",
    "A variable only accepts values of its declared type. A Reel also accepts an integer. A Caractere contains exactly one character. A constant is evaluated once and cannot be changed.",
  ],
  arrays: [
    "Arrays and matrices",
    "Bounded collections with one or more dimensions.",
    "Each dimension declares its lower and upper bound. Out-of-range indexes produce a precise error. Unassigned elements use their type's initial value.",
  ],
  operators: [
    "Operators and precedence",
    "Arithmetic, comparison, and Boolean logic.",
    "Parentheses come first, followed by unary operators, multiplication, addition, comparisons, ET, and finally OU. Standard functions are Longueur, Majuscule, Minuscule, Abs, Racine, Arrondi, Min, and Max.",
  ],
  "read-write": [
    "Lire and Ecrire",
    "Interact with the person running the program.",
    "Lire pauses execution until a correctly typed value is entered. Several variables may be read in one call. Ecrire joins its arguments on one output line.",
  ],
  conditions: [
    "Conditions",
    "Choose a branch using a Boolean expression.",
    "Sinon Si chains several cases without additional nesting. The Sinon branch is optional.",
  ],
  loops: [
    "Loops",
    "Pour, TantQue, and Repeter cover the three classic forms.",
    "Pour uses known bounds, TantQue tests before its body, and Repeter executes at least once. Pas may be positive or negative.",
  ],
  functions: [
    "Functions",
    "Compute and return a reusable value.",
    "Parameters are passed by value. Every call has its own local variables, enabling recursion. A function must reach Retourner with a value matching its declared type.",
  ],
  procedures: [
    "Procedures",
    "Group an action that does not produce a value.",
    "A procedure is called as a statement. It can receive several parameters separated by semicolons.",
  ],
  diagnostics: [
    "Understanding diagnostics",
    "Every error identifies a category, line, and likely correction.",
    "ALG-P codes describe syntax, ALG-S covers program meaning and types, and ALG-R identifies runtime failures. The 100,000-instruction limit protects the app from infinite loops.",
  ],
  scope: [
    "Version 1.0 scope",
    "A complete procedural language for introductory courses.",
    "Version 1.0 covers scalar programs, arrays and matrices, input, control flow, functions, procedures, local scope, and recursion. Records, pointers, files, dynamic structures, and drawing depend heavily on the curriculum and are outside the portable core.",
  ],
};
content.en = content.fr.map((chapter) => ({
  ...chapter,
  title:
    (
      {
        Commencer: "Getting started",
        Données: "Data",
        Expressions: "Expressions",
        "Entrées et sorties": "Input and output",
        Contrôle: "Control flow",
        "Sous-programmes": "Subprograms",
        "Erreurs et limites": "Errors and limits",
      } as Record<string, string>
    )[chapter.title] ?? chapter.title,
  topics: chapter.topics.map((topic) => {
    const translated = english[topic.id];
    return translated
      ? {
          ...topic,
          title: translated[0],
          summary: translated[1],
          body: translated[2],
        }
      : topic;
  }),
}));

export function LanguageGuide({
  locale,
  onOpenEditor,
}: {
  locale: Locale;
  onOpenEditor: () => void;
}): React.JSX.Element {
  const [query, setQuery] = useState("");
  const chapters = content[locale];
  const matches = useMemo(
    () =>
      chapters
        .flatMap((chapter) =>
          chapter.topics.map((topic) => ({ chapter, topic })),
        )
        .filter(({ topic }) =>
          `${topic.title} ${topic.summary} ${topic.body}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [chapters, query],
  );
  return (
    <section className="docs-shell">
      <aside className="docs-sidebar">
        <div className="docs-version">
          <Code2 size={18} />
          <span>
            <strong>Algorithm Studio</strong>
            <small>Language 1.0</small>
          </span>
        </div>
        <label className="docs-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              locale === "fr" ? "Rechercher dans le guide" : "Search the guide"
            }
          />
        </label>
        <nav aria-label={locale === "fr" ? "Documentation" : "Documentation"}>
          {chapters.map((chapter) => (
            <div className="docs-nav-group" key={chapter.id}>
              <strong>
                <chapter.icon size={15} />
                {chapter.title}
              </strong>
              {chapter.topics.map((topic) => (
                <a href={`#${topic.id}`} key={topic.id}>
                  {topic.title}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <article className="docs-content">
        <header className="docs-hero">
          <div className="docs-status">
            <Check size={14} />
            {locale === "fr"
              ? "Référence stable · version 1.0"
              : "Stable reference · version 1.0"}
          </div>
          <h1>
            {locale === "fr"
              ? "Le langage Algorithm"
              : "The Algorithm language"}
          </h1>
          <p>
            {locale === "fr"
              ? "La référence complète du dialecte exécuté par Algorithm Studio. Chaque syntaxe présentée ici fonctionne dans l’éditeur de bureau et sur le web."
              : "The complete reference for the dialect executed by Algorithm Studio. Every syntax shown here works in both the desktop and web editors."}
          </p>
          <div className="docs-hero-actions">
            <button onClick={onOpenEditor}>
              {locale === "fr" ? "Ouvrir l’éditeur" : "Open the editor"}
              <ChevronRight size={16} />
            </button>
            <span>74 tests · 5 types · 3 boucles</span>
          </div>
        </header>
        {query ? (
          <section className="docs-results">
            <h2>
              {matches.length} {locale === "fr" ? "résultat(s)" : "result(s)"}
            </h2>
            {matches.map(({ chapter, topic }) => (
              <a
                href={`#${topic.id}`}
                onClick={() => setQuery("")}
                key={topic.id}
              >
                <small>{chapter.title}</small>
                <strong>{topic.title}</strong>
                <span>{topic.summary}</span>
              </a>
            ))}
          </section>
        ) : (
          chapters.map((chapter) => (
            <section className="docs-chapter" id={chapter.id} key={chapter.id}>
              <header>
                <chapter.icon size={20} />
                <h2>{chapter.title}</h2>
              </header>
              {chapter.topics.map((topic) => (
                <section className="docs-topic" id={topic.id} key={topic.id}>
                  <h3>{topic.title}</h3>
                  <p className="topic-summary">{topic.summary}</p>
                  <p>{topic.body}</p>
                  {topic.table && (
                    <div className="docs-table-wrap">
                      <table>
                        <tbody>
                          {topic.table.map((row, index) => (
                            <tr key={row.join("")}>
                              {row.map((cell) =>
                                index === 0 ? (
                                  <th key={cell}>{cell}</th>
                                ) : (
                                  <td key={cell}>{cell}</td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {topic.code && (
                    <pre>
                      <code>{topic.code}</code>
                    </pre>
                  )}
                </section>
              ))}
            </section>
          ))
        )}
        <footer className="docs-footer">
          <Braces size={18} />
          <span>
            {locale === "fr"
              ? "Cette référence est testée avec l’interpréteur à chaque publication."
              : "This reference is tested against the interpreter on every release."}
          </span>
        </footer>
      </article>
    </section>
  );
}

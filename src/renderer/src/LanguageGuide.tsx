import { AlertTriangle, BookOpen, Braces, Calculator, ListChecks, MessageSquareText } from "lucide-react";
import type { Locale } from "./i18n";

type GuideSection = {
  id: string;
  title: string;
  intro: string;
  items: Array<{ title: string; body: string; code?: string }>;
};

const sections: Record<Locale, GuideSection[]> = {
  fr: [
    {
      id: "structure",
      title: "Structure d’un programme",
      intro: "Un programme commence par son nom, déclare ses variables, puis place ses instructions entre Debut et Fin.",
      items: [{
        title: "Programme minimal",
        body: "Les sections Variables et Constantes sont facultatives lorsqu’elles sont vides.",
        code: `Algorithme Bonjour\nVariables\n    nom : Chaine\nDebut\n    Ecrire("Bonjour")\nFin`,
      }],
    },
    {
      id: "values",
      title: "Variables et valeurs",
      intro: "Une variable doit être déclarée avant son utilisation. L’affectation utilise la flèche <-.",
      items: [
        { title: "Types disponibles", body: "Entier, Reel, Chaine, Caractere et Booleen. Les constantes se déclarent avant les variables.", code: `MAX = 100\nage : Entier\nadmis : Booleen` },
        { title: "Affectation", body: "La valeur située à droite est calculée avant d’être placée dans la variable.", code: `total <- prix * quantite` },
      ],
    },
    {
      id: "expressions",
      title: "Calculs et expressions",
      intro: "Les parenthèses permettent de rendre l’ordre des calculs explicite.",
      items: [{ title: "Opérateurs pris en charge", body: "Calculs + - * / DIV MOD, comparaisons, et logique ET, OU, NON.", code: `admis <- moyenne >= 10 ET absence < 5` }],
    },
    {
      id: "output",
      title: "Afficher un résultat",
      intro: "Ecrire accepte plusieurs valeurs séparées par des virgules et les affiche sur une même ligne.",
      items: [{ title: "Ecrire", body: "Le texte doit être placé entre guillemets doubles.", code: `Ecrire("Résultat : ", resultat)` }],
    },
    {
      id: "limits",
      title: "Limites actuelles",
      intro: "Algorithm Studio évolue encore. Le guide distingue volontairement ce qui fonctionne de ce qui arrive ensuite.",
      items: [
        { title: "Disponible", body: "Constantes, cinq types scalaires, expressions, conditions, boucles Pour/TantQue/Repeter, commentaires et Ecrire." },
        { title: "Pas encore disponible", body: "Lire interactif, tableaux, matrices, enregistrements, fichiers, procédures, fonctions, récursion et dessin." },
      ],
    },
  ],
  en: [
    {
      id: "structure",
      title: "Program structure",
      intro: "A program starts with its name, declares its variables, then places instructions between Debut and Fin.",
      items: [{
        title: "Minimal program",
        body: "Variables and Constantes are optional when they are empty.",
        code: `Algorithme Bonjour\nVariables\n    nom : Chaine\nDebut\n    Ecrire("Bonjour")\nFin`,
      }],
    },
    {
      id: "values",
      title: "Variables and values",
      intro: "A variable must be declared before it is used. Assignment uses the <- arrow.",
      items: [
        { title: "Available types", body: "Entier, Reel, Chaine, Caractere, and Booleen. Constants are declared before variables.", code: `MAX = 100\nage : Entier\nadmis : Booleen` },
        { title: "Assignment", body: "The value on the right is calculated before it is stored in the variable.", code: `total <- prix * quantite` },
      ],
    },
    {
      id: "expressions",
      title: "Calculations and expressions",
      intro: "Parentheses make the intended order of a calculation explicit.",
      items: [{ title: "Supported operators", body: "Arithmetic + - * / DIV MOD, comparisons, and ET, OU, NON logic.", code: `admis <- moyenne >= 10 ET absence < 5` }],
    },
    {
      id: "output",
      title: "Display a result",
      intro: "Ecrire accepts several comma-separated values and prints them on one line.",
      items: [{ title: "Ecrire", body: "Text must be placed inside double quotes.", code: `Ecrire("Result: ", resultat)` }],
    },
    {
      id: "limits",
      title: "Current limits",
      intro: "Algorithm Studio is still growing. This guide clearly separates working features from planned ones.",
      items: [
        { title: "Available", body: "Constants, five scalar types, expressions, decisions, Pour/TantQue/Repeter loops, comments, and Ecrire." },
        { title: "Not available yet", body: "Interactive Lire, arrays, matrices, records, files, procedures, functions, recursion, and drawing." },
      ],
    },
  ],
};

const sectionIcons = [BookOpen, Braces, Calculator, MessageSquareText, AlertTriangle];

export function LanguageGuide({ locale, onOpenEditor }: { locale: Locale; onOpenEditor: () => void }): React.JSX.Element {
  const content = sections[locale];
  const heading = locale === "fr" ? "Le langage, sans deviner" : "The language, without guessing";
  const introduction = locale === "fr"
    ? "Une référence courte pour écrire les programmes acceptés aujourd’hui. Les mots-clés restent en français dans les deux langues de l’interface."
    : "A concise reference for programs accepted today. Language keywords stay in French in both interface languages.";

  return (
    <section className="guide-layout">
      <nav className="guide-nav" aria-label={locale === "fr" ? "Chapitres" : "Chapters"}>
        <strong>{locale === "fr" ? "Dans ce guide" : "In this guide"}</strong>
        {content.map((section, index) => {
          const Icon = sectionIcons[index];
          return <a href={`#${section.id}`} key={section.id}><Icon size={16} />{section.title}</a>;
        })}
      </nav>
      <article className="guide-content">
        <header className="guide-hero">
          <BookOpen size={24} />
          <h1>{heading}</h1>
          <p>{introduction}</p>
          <button onClick={onOpenEditor}>{locale === "fr" ? "Essayer dans l’éditeur" : "Try it in the editor"}</button>
        </header>
        {content.map((section) => (
          <section className="guide-section" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <p>{section.intro}</p>
            <div className="guide-items">
              {section.items.map((item) => (
                <div className="guide-item" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {item.code && <pre><code>{item.code}</code></pre>}
                </div>
              ))}
            </div>
          </section>
        ))}
        <footer className="guide-note"><ListChecks size={18} />{locale === "fr" ? "Cette documentation correspond à la version actuelle de l’interpréteur." : "This documentation matches the current interpreter version."}</footer>
      </article>
    </section>
  );
}

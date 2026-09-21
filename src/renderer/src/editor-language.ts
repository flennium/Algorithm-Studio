import type { Monaco } from "@monaco-editor/react";
import type { editor, Position } from "monaco-editor";

export function registerAlgorithmLanguage(monaco: Monaco): void {
  if (monaco.languages.getLanguages().some((language: { id: string }) => language.id === "algorithm")) return;

  monaco.languages.register({ id: "algorithm" });
  monaco.languages.setLanguageConfiguration("algorithm", {
    comments: { lineComment: "//" },
    brackets: [
      ["(", ")"],
      ["[", "]"],
    ],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
    ],
  });
  monaco.languages.setMonarchTokensProvider("algorithm", {
    ignoreCase: true,
    keywords: [
      "Algorithme",
      "Variables",
      "Constantes",
      "Debut",
      "Début",
      "Fin",
      "Ecrire",
      "Écrire",
      "Lire",
      "Si",
      "Alors",
      "Sinon",
      "FinSi",
      "Pour",
      "Faire",
      "FinPour",
      "TantQue",
      "FinTantQue",
    ],
    typeKeywords: ["Entier", "Reel", "Réel", "Chaine", "Chaîne", "Booleen"],
    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/[a-zA-ZÀ-ÿ_][\wÀ-ÿ]*/, { cases: { "@keywords": "keyword", "@typeKeywords": "type", "@default": "identifier" } }],
        [/\d+(\.\d+)?/, "number"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
        [/<-/, "operator"],
        [/[+\-*/=<>]/, "operator"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
    },
  });
  monaco.languages.registerCompletionItemProvider("algorithm", {
    provideCompletionItems: (model: editor.ITextModel, position: Position) => {
      const range = {
        ...model.getWordUntilPosition(position),
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
      };
      const words = ["Algorithme", "Variables", "Debut", "Fin", "Ecrire", "Entier", "Reel", "Chaine"];
      return {
        suggestions: words.map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: label,
          range,
        })),
      };
    },
  });
  monaco.editor.defineTheme("algorithm-day", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "176B87", fontStyle: "bold" },
      { token: "type", foreground: "24734C" },
      { token: "number", foreground: "9A5B13" },
      { token: "string", foreground: "3A6F78" },
      { token: "comment", foreground: "70818A", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#FBFCFD",
      "editor.foreground": "#18212B",
      "editorLineNumber.foreground": "#8A9AA3",
      "editorLineNumber.activeForeground": "#455761",
      "editor.lineHighlightBackground": "#EEF5F7",
      "editorCursor.foreground": "#247BA0",
      "editor.selectionBackground": "#247BA033",
    },
  });
  monaco.editor.defineTheme("algorithm-night", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "79C0FF", fontStyle: "bold" },
      { token: "type", foreground: "A5D6A7" },
      { token: "number", foreground: "F2CC8F" },
      { token: "string", foreground: "A8DADC" },
      { token: "comment", foreground: "76909E", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#101820",
      "editor.foreground": "#E9F0F3",
      "editorLineNumber.foreground": "#5E7481",
      "editorLineNumber.activeForeground": "#C7D7DE",
      "editor.lineHighlightBackground": "#162530",
      "editorCursor.foreground": "#55B5D9",
      "editor.selectionBackground": "#247BA055",
    },
  });
}

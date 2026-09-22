import { describe, expect, it } from "vitest";
import { run } from "./index";

describe("Algorithm Studio 1.0", () => {
  it("reads typed input and resumes deterministically", () => {
    const source = `Algorithme Saisie
Variables
  age : Entier
  nom : Chaine
Debut
  Lire(age, nom)
  Ecrire(nom, " : ", age)
Fin`;
    expect(run(source).inputRequest).toEqual({ name: "age", type: "Entier" });
    expect(run(source, "fr", [21]).inputRequest).toEqual({ name: "nom", type: "Chaine" });
    expect(run(source, "fr", [21, "Lina"]).output).toEqual(["Lina : 21"]);
  });

  it("supports bounded arrays and matrices", () => {
    const result = run(`Algorithme Tableaux
Variables
  notes : Tableau[1..3] de Reel
  matrice : Tableau[0..1, 0..1] de Entier
Debut
  notes[1] <- 12.5
  notes[2] <- 15
  matrice[1, 0] <- 7
  Ecrire(notes[1] + notes[2], ":", matrice[1, 0])
Fin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["27.5:7"]);
  });

  it("reports out-of-bounds array access", () => {
    const result = run(`Algorithme Limite
Variables
  valeurs : Tableau[1..2] de Entier
Debut
  valeurs[3] <- 1
Fin`);
    expect(result.diagnostics[0]?.code).toBe("ALG-R104");
  });

  it("supports functions, local variables, calls and return values", () => {
    const result = run(`Algorithme Fonctions
Fonction Double(n : Entier) : Entier
Variables
  resultat : Entier
Debut
  resultat <- n * 2
  Retourner resultat
FinFonction
Debut
  Ecrire(Double(6))
Fin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["12"]);
  });

  it("supports procedures", () => {
    const result = run(`Algorithme Procedures
Procedure Saluer(nom : Chaine)
Debut
  Ecrire("Bonjour ", nom)
FinProcedure
Debut
  Saluer("Aya")
Fin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["Bonjour Aya"]);
  });

  it("supports recursive functions with isolated local scope", () => {
    const result = run(`Algorithme Recursion
Fonction Factorielle(n : Entier) : Entier
Debut
  Si n <= 1 Alors
    Retourner 1
  Sinon
    Retourner n * Factorielle(n - 1)
  FinSi
FinFonction
Debut
  Ecrire(Factorielle(5))
Fin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["120"]);
  });

  it("supports Sinon Si branches", () => {
    const result = run(`Algorithme Choix
Variables
  note : Entier
Debut
  note <- 12
  Si note >= 16 Alors
    Ecrire("tres bien")
  Sinon Si note >= 10 Alors
    Ecrire("admis")
  Sinon
    Ecrire("ajourne")
  FinSi
Fin`);
    expect(result.output).toEqual(["admis"]);
  });

  it("provides standard numeric and text functions", () => {
    const result = run(`Algorithme Standard\nDebut\nEcrire(Longueur("été"), ":", Majuscule("algo"), ":", Abs(-4), ":", Racine(9), ":", Arrondi(2.6), ":", Min(8, 3), ":", Max(8, 3))\nFin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["3:ALGO:4:3:3:3:8"]);
  });

  it("initializes every scalar and array type with its documented default", () => {
    const result = run(`Algorithme ValeursInitiales
Variables
  entier : Entier
  reel : Reel
  texte : Chaine
  caractere : Caractere
  booleen : Booleen
  valeurs : Tableau[-1..0] de Entier
Debut
  Ecrire(entier, ":", reel, ":", texte, ":", caractere, ":", booleen, ":", valeurs[-1])
Fin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["0:0:::Faux:0"]);
  });

  it("reads directly into an array element", () => {
    const source = `Algorithme LectureTableau
Variables
  valeurs : Tableau[1..2] de Entier
Debut
  Lire(valeurs[2])
  Ecrire(valeurs[2])
Fin`;
    expect(run(source).inputRequest).toEqual({ name: "valeurs", type: "Entier" });
    expect(run(source, "fr", [9]).output).toEqual(["9"]);
  });

  it.each([
    ["valeurs[1.5] <- 2", "ALG-S107"],
    ["Ecrire(valeurs[1, 2])", "ALG-S107"],
    ["Ecrire(valeurs)", "ALG-S108"],
    ["Ecrire(nombre[1])", "ALG-S109"],
    ['valeurs[1] <- "texte"', "ALG-S106"],
  ])("diagnoses invalid array use: %s", (statement, code) => {
    const result = run(`Algorithme TableauInvalide
Variables
  valeurs : Tableau[1..2] de Entier
  nombre : Entier
Debut
  ${statement}
Fin`);
    expect(result.diagnostics[0]?.code).toBe(code);
  });

  it("keeps parameters and local variables isolated while allowing global access", () => {
    const result = run(`Algorithme Portee
Variables
  base : Entier
Fonction Somme(base : Entier; ajout : Entier) : Entier
Variables
  local : Entier
Debut
  local <- base + ajout
  Retourner local
FinFonction
Procedure AfficherGlobal()
Debut
  Ecrire(base)
FinProcedure
Debut
  base <- 10
  Ecrire(Somme(2, 3))
  AfficherGlobal()
Fin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["5", "10"]);
  });

  it.each([
    ["Ecrire(Double())", "ALG-S111"],
    ['Ecrire(Double("deux"))', "ALG-S112"],
  ])("validates routine arguments: %s", (statement, code) => {
    const result = run(`Algorithme AppelInvalide
Fonction Double(n : Entier) : Entier
Debut
  Retourner n * 2
FinFonction
Debut
  ${statement}
Fin`);
    expect(result.diagnostics[0]?.code).toBe(code);
  });

  it("requires every function execution path to return a compatible value", () => {
    const missing = run(`Algorithme SansRetour
Fonction Valeur() : Entier
Debut
  Ecrire("appel")
FinFonction
Debut
  Ecrire(Valeur())
Fin`);
    expect(missing.diagnostics.some(({ code }) => code === "ALG-S113")).toBe(true);

    const incompatible = run(`Algorithme MauvaisRetour
Fonction Valeur() : Entier
Debut
  Retourner "texte"
FinFonction
Debut
  Ecrire(Valeur())
Fin`);
    expect(incompatible.diagnostics.some(({ code }) => code === "ALG-S113")).toBe(true);
  });

  it.each([
    ["Procedure Action()\nDebut\n  Retourner 1\nFinProcedure\nDebut\n  Action()\nFin", "ALG-S114"],
    ["Procedure Action()\nDebut\n  Ecrire(1)\nFinProcedure\nDebut\n  Ecrire(Action())\nFin", "ALG-S115"],
    ["Debut\n  Retourner 1\nFin", "ALG-R105"],
  ])("enforces return rules", (body, code) => {
    const result = run(`Algorithme RetourInvalide\n${body}`);
    expect(result.diagnostics.some((diagnostic) => diagnostic.code === code)).toBe(true);
  });

  it.each([
    ['Ecrire(Racine(-1))', "ALG-S116"],
    ['Ecrire(Longueur(1))', "ALG-S116"],
    ["Lire(inconnue)", "ALG-S100"],
  ])("reports invalid standard operations: %s", (statement, code) => {
    const result = run(`Algorithme ErreurStandard\nDebut\n${statement}\nFin`);
    expect(result.diagnostics.some((diagnostic) => diagnostic.code === code)).toBe(true);
  });

  it("validates values supplied to typed input", () => {
    const source = `Algorithme TypeLecture
Variables
  age : Entier
Debut
  Lire(age)
Fin`;
    expect(run(source, "fr", ["vingt"]).diagnostics[0]?.code).toBe("ALG-S106");
  });
});

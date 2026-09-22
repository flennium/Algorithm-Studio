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
});

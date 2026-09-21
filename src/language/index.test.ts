import { describe, expect, it } from "vitest";
import { run } from "./index";

const addition = `Algorithme Addition
Variables
    a, b, resultat : Entier
Debut
    a <- 12
    b <- 8
    resultat <- a + b
    Ecrire("Resultat : ", resultat)
Fin`;

describe("Algorithm interpreter", () => {
  it("runs the first acceptance program", () => {
    const result = run(addition);

    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["Resultat : 20"]);
    expect(result.variables).toMatchObject({ a: 12, b: 8, resultat: 20 });
  });

  it("reports an undeclared variable with its source position", () => {
    const result = run(`Algorithme Erreur
Debut
    valeur <- 4
Fin`);

    expect(result.diagnostics[0]).toMatchObject({ code: "ALG-S100" });
    expect(result.diagnostics[0].span.start.line).toBe(3);
  });

  it("returns diagnostics in the selected interface language", () => {
    const result = run(`Algorithme Error\nDebut\n    value <- 4\nFin`, "en");

    expect(result.diagnostics[0]).toMatchObject({
      code: "ALG-S100",
      message: "The variable `value` is not declared.",
      suggestion: "Declare it in the `Variables` section.",
    });
  });

  it("respects arithmetic precedence", () => {
    const result = run(`Algorithme Calcul
Variables
    resultat : Entier
Debut
    resultat <- 2 + 3 * 4
    Ecrire(resultat)
Fin`);

    expect(result.output).toEqual(["14"]);
  });

  it("supports Boolean conditions and both branches", () => {
    const result = run(`Algorithme Majorite\nVariables\n age : Entier\nDebut\n age <- 17\n Si age >= 18 Alors\n  Ecrire("majeur")\n Sinon\n  Ecrire("mineur")\n FinSi\nFin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["mineur"]);
  });

  it("supports Pour, TantQue, Repeter, DIV and MOD", () => {
    const result = run(`Algorithme Boucles\nVariables\n i, total : Entier\nDebut\n total <- 0\n Pour i <- 1 A 3 Faire\n  total <- total + i\n FinPour\n TantQue total < 8 Faire\n  total <- total + 1\n FinTantQue\n Repeter\n  total <- total + 1\n JusquA total = 9\n Ecrire(total DIV 2, ":", total MOD 2)\nFin`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["4:1"]);
  });

  it("supports constants and protects them from assignment", () => {
    const result = run(`Algorithme Constante\nConstantes\n MAX = 10\nDebut\n MAX <- 12\nFin`);
    expect(result.diagnostics[0]?.code).toBe("ALG-S104");
  });
});

import { describe, expect, it } from "vitest";
import { run } from "./index";

describe("program grammar and diagnostics", () => {
  it.each([
    ["Programme Test\nDebut\nFin", "ALG-P100"],
    ["Algorithme Test\nEcrire(1)\nFin", "ALG-P101"],
    ["Algorithme Test\nDebut\nEcrire(1)", "ALG-P102"],
    ["Algorithme Test\nVariables\nx Nombre\nDebut\nFin", "ALG-P104"],
    ["Algorithme Test\nDebut\nAfficher(1)\nFin", "ALG-S110"],
    ["Algorithme Test\nDebut\nEcrire(1 +)\nFin", "ALG-P106"],
    ["Algorithme Test\nConstantes\nINVALIDE\nDebut\nFin", "ALG-P110"],
    ["Algorithme Test\nVariables\nt : Tableau[3..1] de Entier\nDebut\nFin", "ALG-P104"],
    ["Algorithme Test\nFonction F Entier\nDebut\nFinFonction\nDebut\nFin", "ALG-P120"],
    ["Algorithme Test\nFonction F(x Entier) : Entier\nDebut\nRetourner x\nFinFonction\nDebut\nFin", "ALG-P121"],
  ])("reports %s as %s", (source, code) => expect(run(source).diagnostics[0]?.code).toBe(code));

  it("accepts accents, keyword casing, blank lines and comments", () => {
    const result = run(`ALGORITHME Démonstration
VARIABLES
    résultat : Réel // commentaire

DÉBUT
    résultat <- 2.5
    ÉCRIRE("ok: ", résultat)
FIN`);
    expect(result.diagnostics).toEqual([]);
    expect(result.output).toEqual(["ok: 2.5"]);
  });

  it("does not treat comment markers inside text as comments", () => {
    expect(run(`Algorithme Url\nDebut\nEcrire("https://example.test")\nFin`).output).toEqual(["https://example.test"]);
  });

  it.each([
    ["Si Vrai Alors\nEcrire(1)\nFin", "Si"],
    ["TantQue Vrai Faire\nEcrire(1)\nFin", "TantQue"],
    ["Pour i <- 1 A 2 Faire\nEcrire(i)\nFin", "Pour"],
  ])("rejects an unclosed %s block", (body) => {
    expect(run(`Algorithme Bloc\nVariables\ni : Entier\nDebut\n${body}`).diagnostics).not.toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { run } from "./index";

const program = (body: string, declarations = "x, y, i : Entier") => `Algorithme Test\nVariables\n${declarations}\nDebut\n${body}\nFin`;

describe("runtime values and operators", () => {
  it.each([
    ["2 + 3 * 4", "14"], ["(2 + 3) * 4", "20"], ["-2 + +5", "3"],
    ["7 / 2", "3.5"], ["7 DIV 2", "3"], ["7 MOD 2", "1"],
    ['"Algo" + "rithme"', "Algorithme"], ["NON Faux", "Vrai"],
    ["1 < 2 ET 3 >= 3", "Vrai"], ["Faux OU Vrai", "Vrai"],
    ["1 = 1", "Vrai"], ["1 <> 2", "Vrai"], ["1 != 2", "Vrai"],
  ])("evaluates %s", (source, expected) => expect(run(program(`Ecrire(${source})`)).output).toEqual([expected]));

  it("uses identifiers without regard to case", () => {
    const result = run(program("X <- 4\nEcrire(x)"));
    expect(result.output).toEqual(["4"]);
    expect(result.variables.x).toBe(4);
  });

  it("prints multiple values on one line and supports an empty line", () => {
    expect(run(program('Ecrire("x=", 2, ",", Vrai)\nEcrire()')).output).toEqual(["x=2,Vrai", ""]);
  });

  it("initializes each scalar type with its neutral value", () => {
    const result = run(program("Ecrire(x, y, i)", "x : Chaine\ny : Booleen\ni : Entier"));
    expect(result.output).toEqual(["Faux0"]);
  });

  it.each([
    ["x : Entier", 'x <- "1"'], ["x : Entier", "x <- 1.5"],
    ["x : Reel", "x <- Vrai"], ["x : Chaine", "x <- 1"],
    ["x : Caractere", 'x <- "ab"'], ["x : Booleen", "x <- 1"],
  ])("rejects incompatible assignment to %s", (declaration, body) => {
    expect(run(program(body, declaration)).diagnostics[0]?.code).toBe("ALG-S106");
  });
});

describe("runtime control flow", () => {
  it("runs true and false decision branches, including nesting", () => {
    const result = run(program(`x <- 2
Si x > 0 Alors
  Si x = 2 Alors
    Ecrire("nested")
  FinSi
Sinon
  Ecrire("wrong")
FinSi`));
    expect(result.output).toEqual(["nested"]);
  });

  it("runs ascending, descending and empty Pour loops", () => {
    const result = run(program(`Pour i <- 1 A 3 Faire
 Ecrire(i)
FinPour
Pour i <- 3 A 1 Pas -1 Faire
 Ecrire(i)
FinPour
Pour i <- 3 A 1 Faire
 Ecrire("never")
FinPour`));
    expect(result.output).toEqual(["1", "2", "3", "3", "2", "1"]);
  });

  it("distinguishes pre-test and post-test loops", () => {
    const result = run(program(`x <- 0
TantQue x > 0 Faire
 Ecrire("never")
FinTantQue
Repeter
 x <- x + 1
JusquA x = 1
Ecrire(x)`));
    expect(result.output).toEqual(["1"]);
  });
});

describe("runtime failures and safety", () => {
  it.each([["1 / 0"], ["1 DIV 0"], ["1 MOD 0"]])("reports division by zero for %s", (source) => {
    expect(run(program(`Ecrire(${source})`)).diagnostics[0]?.code).toBe("ALG-R101");
  });
  it("rejects numeric operators on text", () => expect(run(program('x <- "a" - 1')).diagnostics[0]?.code).toBe("ALG-S102"));
  it("rejects an unknown value", () => expect(run(program("Ecrire(inconnue)")).diagnostics[0]?.code).toBe("ALG-S101"));
  it("rejects assignment to an undeclared name", () => expect(run(program("inconnue <- 1")).diagnostics[0]?.code).toBe("ALG-S100"));
  it("rejects assignment to constants", () => expect(run(`Algorithme C\nConstantes\nN = 1\nDebut\nN <- 2\nFin`).diagnostics[0]?.code).toBe("ALG-S104"));
  it("rejects a zero loop step", () => expect(run(program("Pour i <- 1 A 2 Pas 0 Faire\nFinPour")).diagnostics[0]?.code).toBe("ALG-S105"));
  it("stops an infinite loop", () => expect(run(program("TantQue Vrai Faire\nx <- x + 1\nFinTantQue")).diagnostics[0]?.code).toBe("ALG-R103"));
});

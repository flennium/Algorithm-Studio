import { argumentsOf, expression } from "./expression";
import { spanFor, tr, type Diagnostic, type LanguageLocale, type Program, type ScalarType, type Statement } from "./types";
type Line = { n: number; text: string };
const norm = (s: string): string => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const identifier = "[\\p{L}_][\\p{L}\\p{N}_]*";

function stripComment(source: string): string {
  let quoted = false;
  for (let index = 0; index < source.length - 1; index++) {
    if (source[index] === '"') quoted = !quoted;
    if (!quoted && source[index] === "/" && source[index + 1] === "/") return source.slice(0, index);
  }
  return source;
}

export function parse(source: string, locale: LanguageLocale): { program?: Program; diagnostics: Diagnostic[] } {
  const lines = source.split(/\r?\n/).map((text, n) => ({ n: n + 1, text: stripComment(text).trim() })).filter((x) => x.text);
  const diagnostics: Diagnostic[] = []; let i = 0;
  const error = (line: Line | undefined, code: string, fr: string, en: string) => diagnostics.push({ severity: "error" as const, code, message: tr(locale, fr, en), span: spanFor(line?.n ?? 1) });
  const header = lines[i++]?.text.match(new RegExp(`^Algorithme\\s+(${identifier})$`, "iu"));
  if (!header) { error(lines[0], "ALG-P100", "`Algorithme` et un nom sont attendus.", "`Algorithme` and a name are required."); return { diagnostics }; }
  const program: Program = { name: header[1], declarations: [], constants: [], statements: [] };
  if (norm(lines[i]?.text ?? "") === "CONSTANTES") {
    i++;
    while (i < lines.length && !["VARIABLES", "DEBUT"].includes(norm(lines[i].text))) {
      const line = lines[i++], match = line.text.match(new RegExp(`^(${identifier})\\s*(?:=|<-)\\s*(.+)$`, "u"));
      try { if (!match) throw Error(); program.constants.push({ name: match[1], value: expression(match[2]), line: line.n }); }
      catch { error(line, "ALG-P110", "Constante invalide.", "Invalid constant."); }
    }
  }
  if (norm(lines[i]?.text ?? "") === "VARIABLES") {
    i++;
    while (i < lines.length && norm(lines[i].text) !== "DEBUT") {
      const line = lines[i++], match = line.text.match(/^(.+?)\s*:\s*(Entier|R[ée]el|Cha[iî]ne|Caract[èe]re|Bool[ée]en)$/iu);
      if (!match) error(line, "ALG-P104", "Déclaration invalide.", "Invalid declaration.");
      else {
        const types: Record<string, ScalarType> = { ENTIER: "Entier", REEL: "Reel", CHAINE: "Chaine", CARACTERE: "Caractere", BOOLEEN: "Booleen" };
        program.declarations.push(...match[1].split(",").map((name) => ({ name: name.trim(), type: types[norm(match[2])] })));
      }
    }
  }
  if (norm(lines[i]?.text ?? "") !== "DEBUT") { error(lines[i], "ALG-P101", "`Debut` attendu.", "Expected `Debut`."); return { diagnostics }; }
  i++;
  const block = (stops: string[]): Statement[] => {
    const body: Statement[] = [];
    while (i < lines.length && !stops.some((stop) => norm(lines[i].text).startsWith(stop))) {
      const line = lines[i++];
      try {
        let match: RegExpMatchArray | null;
        if ((match = line.text.match(/^[ÉE]crire\((.*)\)$/iu))) body.push({ kind: "write", values: argumentsOf(match[1]), line: line.n });
        else if ((match = line.text.match(/^Si\s+(.+)\s+Alors$/iu))) {
          const yes = block(["SINON", "FINSI"]); let no: Statement[] = [];
          if (norm(lines[i]?.text ?? "") === "SINON") { i++; no = block(["FINSI"]); }
          if (norm(lines[i]?.text ?? "") !== "FINSI") throw Error(); i++;
          body.push({ kind: "if", condition: expression(match[1]), yes, no, line: line.n });
        } else if ((match = line.text.match(/^TantQue\s+(.+?)\s+Faire$/iu))) {
          const nested = block(["FINTANTQUE"]); if (norm(lines[i]?.text ?? "") !== "FINTANTQUE") throw Error(); i++;
          body.push({ kind: "while", condition: expression(match[1]), body: nested, line: line.n });
        } else if (norm(line.text) === "REPETER") {
          const nested = block(["JUSQUA"]), end = lines[i++], until = end?.text.match(/^Jusqu[àa]\s+(.+)$/iu);
          if (!until) throw Error(); body.push({ kind: "repeat", condition: expression(until[1]), body: nested, line: line.n });
        } else if ((match = line.text.match(new RegExp(`^Pour\\s+(${identifier})\\s*<-\\s*(.+?)\\s+[ÀA]\\s+(.+?)(?:\\s+Pas\\s+(.+?))?\\s+Faire$`, "iu")))) {
          const nested = block(["FINPOUR"]); if (norm(lines[i]?.text ?? "") !== "FINPOUR") throw Error(); i++;
          body.push({ kind: "for", name: match[1], start: expression(match[2]), end: expression(match[3]), step: expression(match[4] ?? "1"), body: nested, line: line.n });
        } else if ((match = line.text.match(new RegExp(`^(${identifier})\\s*<-\\s*(.+)$`, "u")))) body.push({ kind: "assign", name: match[1], value: expression(match[2]), line: line.n });
        else error(line, "ALG-P105", "Instruction inconnue.", "Unknown instruction.");
      } catch { error(line, "ALG-P106", "Expression ou bloc invalide.", "Invalid expression or block."); }
    }
    return body;
  };
  program.statements = block(["FIN"]);
  if (norm(lines[i]?.text ?? "") !== "FIN") error(lines[i], "ALG-P102", "`Fin` attendu.", "Expected `Fin`.");
  return diagnostics.length ? { diagnostics } : { program, diagnostics };
}

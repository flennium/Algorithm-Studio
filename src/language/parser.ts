import { argumentsOf, expression, targetOf } from "./expression";
import {
  spanFor,
  tr,
  type Declaration,
  type Diagnostic,
  type LanguageLocale,
  type Program,
  type Routine,
  type ScalarType,
  type Statement,
} from "./types";
type Line = { n: number; text: string };
const norm = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
const id = "[\\p{L}_][\\p{L}\\p{N}_]*";
const types: Record<string, ScalarType> = {
  ENTIER: "Entier",
  REEL: "Reel",
  CHAINE: "Chaine",
  CARACTERE: "Caractere",
  BOOLEEN: "Booleen",
};
function stripComment(source: string): string {
  let quoted = false;
  for (let i = 0; i < source.length - 1; i++) {
    if (source[i] === '"' && source[i - 1] !== "\\") quoted = !quoted;
    if (!quoted && source[i] === "/" && source[i + 1] === "/")
      return source.slice(0, i);
  }
  return source;
}

export function parse(
  source: string,
  locale: LanguageLocale,
): { program?: Program; diagnostics: Diagnostic[] } {
  const lines = source
    .split(/\r?\n/)
    .map((text, n) => ({ n: n + 1, text: stripComment(text).trim() }))
    .filter((x) => x.text);
  const diagnostics: Diagnostic[] = [];
  let i = 0;
  const error = (
    line: Line | undefined,
    code: string,
    fr: string,
    en: string,
  ) =>
    diagnostics.push({
      severity: "error" as const,
      code,
      message: tr(locale, fr, en),
      span: spanFor(line?.n ?? 1),
    });
  const header = lines[i++]?.text.match(
    new RegExp(`^Algorithme\\s+(${id})$`, "iu"),
  );
  if (!header) {
    error(
      lines[0],
      "ALG-P100",
      "`Algorithme` et un nom sont attendus.",
      "`Algorithme` and a name are required.",
    );
    return { diagnostics };
  }
  const program: Program = {
    name: header[1],
    declarations: [],
    constants: [],
    routines: [],
    statements: [],
  };

  const parseDeclaration = (line: Line): Declaration[] => {
    const array = line.text.match(
      new RegExp(
        `^(.+?)\\s*:\\s*Tableau\\s*\\[(.+)\\]\\s+de\\s+(Entier|R[ée]el|Cha[iî]ne|Caract[èe]re|Bool[ée]en)$`,
        "iu",
      ),
    );
    const scalar = line.text.match(
      /^(.+?)\s*:\s*(Entier|R[ée]el|Cha[iî]ne|Caract[èe]re|Bool[ée]en)$/iu,
    );
    const match = array ?? scalar;
    if (!match) throw Error();
    const type = types[norm(array ? match[3] : match[2])];
    const dimensions = array
      ? match[2].split(",").map((part) => {
          const bounds = part.trim().match(/^(-?\d+)\.\.(-?\d+)$/);
          if (!bounds || Number(bounds[1]) > Number(bounds[2])) throw Error();
          return { lower: Number(bounds[1]), upper: Number(bounds[2]) };
        })
      : undefined;
    return match[1].split(",").map((name) => {
      const value = name.trim();
      if (!new RegExp(`^${id}$`, "u").test(value)) throw Error();
      return { name: value, type, dimensions };
    });
  };
  const declarations = (target: Declaration[], stops: string[]) => {
    if (norm(lines[i]?.text ?? "") !== "VARIABLES") return;
    i++;
    while (
      i < lines.length &&
      !stops.some((stop) => norm(lines[i].text).startsWith(stop))
    ) {
      const line = lines[i++];
      try {
        target.push(...parseDeclaration(line));
      } catch {
        error(
          line,
          "ALG-P104",
          "Déclaration invalide.",
          "Invalid declaration.",
        );
      }
    }
  };

  if (norm(lines[i]?.text ?? "") === "CONSTANTES") {
    i++;
    while (
      i < lines.length &&
      !["VARIABLES", "FONCTION", "PROCEDURE", "DEBUT"].some((s) =>
        norm(lines[i].text).startsWith(s),
      )
    ) {
      const line = lines[i++],
        match = line.text.match(
          new RegExp(`^(${id})\\s*(?:=|<-)\\s*(.+)$`, "u"),
        );
      try {
        if (!match) throw Error();
        program.constants.push({
          name: match[1],
          value: expression(match[2]),
          line: line.n,
        });
      } catch {
        error(line, "ALG-P110", "Constante invalide.", "Invalid constant.");
      }
    }
  }
  declarations(program.declarations, ["FONCTION", "PROCEDURE", "DEBUT"]);

  const block = (stops: string[]): Statement[] => {
    const body: Statement[] = [];
    while (
      i < lines.length &&
      !stops.some((stop) => norm(lines[i].text).startsWith(stop))
    ) {
      const line = lines[i++];
      try {
        let m: RegExpMatchArray | null;
        if ((m = line.text.match(/^[ÉE]crire\s*\((.*)\)$/iu)))
          body.push({ kind: "write", values: argumentsOf(m[1]), line: line.n });
        else if ((m = line.text.match(/^Lire\s*\((.*)\)$/iu)))
          body.push({
            kind: "read",
            targets: m[1].split(",").map((x) => targetOf(x.trim())),
            line: line.n,
          });
        else if ((m = line.text.match(/^Retourner(?:\s+(.+))?$/iu)))
          body.push({
            kind: "return",
            value: m[1] ? expression(m[1]) : undefined,
            line: line.n,
          });
        else if ((m = line.text.match(/^Si\s+(.+)\s+Alors$/iu))) {
          const branches = [
            {
              condition: expression(m[1]),
              body: block(["SINON SI", "SINON", "FINSI"]),
            },
          ];
          while ((m = lines[i]?.text.match(/^Sinon\s+Si\s+(.+)\s+Alors$/iu))) {
            i++;
            branches.push({
              condition: expression(m[1]),
              body: block(["SINON SI", "SINON", "FINSI"]),
            });
          }
          let otherwise: Statement[] = [];
          if (norm(lines[i]?.text ?? "") === "SINON") {
            i++;
            otherwise = block(["FINSI"]);
          }
          if (norm(lines[i]?.text ?? "") !== "FINSI") throw Error();
          i++;
          body.push({ kind: "if", branches, otherwise, line: line.n });
        } else if ((m = line.text.match(/^TantQue\s+(.+?)\s+Faire$/iu))) {
          const nested = block(["FINTANTQUE"]);
          if (norm(lines[i]?.text ?? "") !== "FINTANTQUE") throw Error();
          i++;
          body.push({
            kind: "while",
            condition: expression(m[1]),
            body: nested,
            line: line.n,
          });
        } else if (norm(line.text) === "REPETER") {
          const nested = block(["JUSQUA"]),
            end = lines[i++],
            until = end?.text.match(/^Jusqu[àa]\s+(.+)$/iu);
          if (!until) throw Error();
          body.push({
            kind: "repeat",
            condition: expression(until[1]),
            body: nested,
            line: line.n,
          });
        } else if (
          (m = line.text.match(
            new RegExp(
              `^Pour\\s+(${id})\\s*<-\\s*(.+?)\\s+[ÀA]\\s+(.+?)(?:\\s+Pas\\s+(.+?))?\\s+Faire$`,
              "iu",
            ),
          ))
        ) {
          const nested = block(["FINPOUR"]);
          if (norm(lines[i]?.text ?? "") !== "FINPOUR") throw Error();
          i++;
          body.push({
            kind: "for",
            name: m[1],
            start: expression(m[2]),
            end: expression(m[3]),
            step: expression(m[4] ?? "1"),
            body: nested,
            line: line.n,
          });
        } else if ((m = line.text.match(/^(.+?)\s*<-\s*(.+)$/u)))
          body.push({
            kind: "assign",
            target: targetOf(m[1].trim()),
            value: expression(m[2]),
            line: line.n,
          });
        else {
          const call = expression(line.text);
          if (call.kind !== "call") throw Error();
          body.push({ kind: "call", call, line: line.n });
        }
      } catch {
        error(
          line,
          "ALG-P106",
          "Instruction, expression ou bloc invalide.",
          "Invalid instruction, expression, or block.",
        );
      }
    }
    return body;
  };

  while (
    ["FONCTION", "PROCEDURE"].some((s) =>
      norm(lines[i]?.text ?? "").startsWith(s),
    )
  ) {
    const line = lines[i++],
      functionMatch = line.text.match(
        new RegExp(
          `^Fonction\\s+(${id})\\s*\\((.*)\\)\\s*:\\s*(Entier|R[ée]el|Cha[iî]ne|Caract[èe]re|Bool[ée]en)$`,
          "iu",
        ),
      ),
      procedureMatch = line.text.match(
        new RegExp(`^Procedure\\s+(${id})\\s*\\((.*)\\)$`, "iu"),
      ),
      match = functionMatch ?? procedureMatch;
    if (!match) {
      error(
        line,
        "ALG-P120",
        "En-tête de sous-programme invalide.",
        "Invalid subprogram header.",
      );
      break;
    }
    const routine: Routine = {
      kind: functionMatch ? "function" : "procedure",
      name: match[1],
      params: [],
      returnType: functionMatch ? types[norm(match[3])] : undefined,
      declarations: [],
      statements: [],
      line: line.n,
    };
    try {
      if (match[2].trim())
        for (const parameter of match[2].split(";"))
          routine.params.push(
            ...parseDeclaration({ n: line.n, text: parameter.trim() }),
          );
    } catch {
      error(line, "ALG-P121", "Paramètres invalides.", "Invalid parameters.");
    }
    declarations(routine.declarations, ["DEBUT"]);
    if (norm(lines[i]?.text ?? "") !== "DEBUT") {
      error(lines[i], "ALG-P101", "`Debut` attendu.", "Expected `Debut`.");
      break;
    }
    i++;
    const end = routine.kind === "function" ? "FINFONCTION" : "FINPROCEDURE";
    routine.statements = block([end]);
    if (norm(lines[i]?.text ?? "") !== end) {
      error(
        lines[i],
        "ALG-P122",
        `\`${end}\` attendu.`,
        `Expected \`${end}\`.`,
      );
      break;
    }
    i++;
    program.routines.push(routine);
  }
  if (norm(lines[i]?.text ?? "") !== "DEBUT") {
    error(lines[i], "ALG-P101", "`Debut` attendu.", "Expected `Debut`.");
    return { diagnostics };
  }
  i++;
  program.statements = block(["FIN"]);
  if (norm(lines[i]?.text ?? "") !== "FIN")
    error(lines[i], "ALG-P102", "`Fin` attendu.", "Expected `Fin`.");
  return diagnostics.length ? { diagnostics } : { program, diagnostics };
}

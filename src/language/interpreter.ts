import { spanFor, tr, type Expr, type LanguageLocale, type Program, type RunResult, type ScalarType, type Statement, type Value } from "./types";
const key = (s: string): string => s.toUpperCase();
export function execute(program: Program, locale: LanguageLocale): RunResult {
  const output: string[] = [], diagnostics: RunResult["diagnostics"] = [], values = new Map<string, Value>(), names = new Map<string, string>(), variableTypes = new Map<string, ScalarType>(), constants = new Set<string>(); let steps = 0;
  const report = (line: number, code: string, fr: string, en: string, suggestion?: [string, string]) => diagnostics.push({ severity: "error" as const, code, message: tr(locale, fr, en), suggestion: suggestion ? tr(locale, ...suggestion) : undefined, span: spanFor(line) });
  const evaluate = (e: Expr, line: number): Value | undefined => {
    if (e.kind === "literal") return e.value;
    if (e.kind === "name") { const value = values.get(key(e.name)); if (value === undefined) report(line, "ALG-S101", `La variable \`${e.name}\` n'est pas déclarée.`, `The variable \`${e.name}\` is not declared.`); return value; }
    const right = evaluate(e.right, line); if (right === undefined) return;
    if (e.kind === "unary") { if (e.op === "NON") return !Boolean(right); if (typeof right !== "number") { report(line, "ALG-S102", "Un nombre est attendu.", "A number is required."); return; } return e.op === "-" ? -right : right; }
    const left = evaluate(e.left, line); if (left === undefined) return;
    if (e.op === "ET") return Boolean(left) && Boolean(right); if (e.op === "OU") return Boolean(left) || Boolean(right); if (e.op === "=") return left === right; if (["!=", "<>"].includes(e.op)) return left !== right;
    if (e.op === "+" && (typeof left === "string" || typeof right === "string")) return String(left) + String(right);
    if (["<", "<=", ">", ">="].includes(e.op)) return e.op === "<" ? left < right : e.op === "<=" ? left <= right : e.op === ">" ? left > right : left >= right;
    if (typeof left !== "number" || typeof right !== "number") { report(line, "ALG-S102", "Deux nombres sont attendus.", "Two numbers are required."); return; }
    if (["/", "DIV", "MOD"].includes(e.op) && right === 0) { report(line, "ALG-R101", "Division par zéro impossible.", "Division by zero is not allowed."); return; }
    return ({ "+": left + right, "-": left - right, "*": left * right, "/": left / right, DIV: Math.trunc(left / right), MOD: left % right } as Record<string, number>)[e.op];
  };
  const accepts = (type: ScalarType, value: Value): boolean => type === "Entier" ? typeof value === "number" && Number.isInteger(value) : type === "Reel" ? typeof value === "number" : type === "Booleen" ? typeof value === "boolean" : type === "Caractere" ? typeof value === "string" && [...value].length === 1 : typeof value === "string";
  for (const declaration of program.declarations) {
    const normalized = key(declaration.name); names.set(normalized, declaration.name); variableTypes.set(normalized, declaration.type);
    values.set(normalized, declaration.type === "Booleen" ? false : ["Chaine", "Caractere"].includes(declaration.type) ? "" : 0);
  }
  for (const item of program.constants) { const value = evaluate(item.value, item.line); if (value !== undefined) { names.set(key(item.name), item.name); values.set(key(item.name), value); constants.add(key(item.name)); } }
  const block = (statements: Statement[]): boolean => {
    for (const s of statements) {
      if (++steps > 100000) { report(s.line, "ALG-R103", "Trop d'itérations : exécution arrêtée.", "Too many iterations: execution stopped."); return false; }
      if (s.kind === "assign") { const k = key(s.name); if (!values.has(k)) { report(s.line, "ALG-S100", `La variable \`${s.name}\` n'est pas déclarée.`, `The variable \`${s.name}\` is not declared.`, ["Déclarez-la dans la section `Variables`.", "Declare it in the `Variables` section."]); return false; } if (constants.has(k)) { report(s.line, "ALG-S104", "Une constante ne peut pas être modifiée.", "A constant cannot be changed."); return false; } const value = evaluate(s.value, s.line); if (value === undefined) return false; const expected = variableTypes.get(k); if (expected && !accepts(expected, value)) { report(s.line, "ALG-S106", `Valeur incompatible avec le type ${expected}.`, `Value is incompatible with type ${expected}.`); return false; } values.set(k, value); }
      else if (s.kind === "write") { const line = s.values.map((e) => evaluate(e, s.line)); if (line.some((v) => v === undefined)) return false; output.push(line.map((v) => typeof v === "boolean" ? (v ? "Vrai" : "Faux") : String(v)).join("")); }
      else if (s.kind === "if") { if (!block(evaluate(s.condition, s.line) ? s.yes : s.no)) return false; }
      else if (s.kind === "while") { while (evaluate(s.condition, s.line)) if (!block(s.body)) return false; }
      else if (s.kind === "repeat") { do { if (!block(s.body)) return false; } while (!evaluate(s.condition, s.line)); }
      else { const start = evaluate(s.start, s.line), end = evaluate(s.end, s.line), step = evaluate(s.step, s.line), k = key(s.name); if (typeof start !== "number" || typeof end !== "number" || typeof step !== "number" || !step) { report(s.line, "ALG-S105", "Bornes ou pas de boucle invalides.", "Invalid loop bounds or step."); return false; } if (!values.has(k)) { report(s.line, "ALG-S100", `La variable \`${s.name}\` n'est pas déclarée.`, `The variable \`${s.name}\` is not declared.`); return false; } for (let n = start; step > 0 ? n <= end : n >= end; n += step) { values.set(k, n); if (!block(s.body)) return false; } }
      if (diagnostics.length) return false;
    }
    return true;
  };
  block(program.statements); const variables: Record<string, Value> = {}; for (const [k, value] of values) if (!constants.has(k)) variables[names.get(k) ?? k] = value; return { output, diagnostics, variables };
}

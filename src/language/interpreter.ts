import {
  spanFor,
  tr,
  type Declaration,
  type Expr,
  type LanguageLocale,
  type Program,
  type RunResult,
  type ScalarType,
  type Statement,
  type Target,
  type Value,
} from "./types";
type ArrayValue = {
  kind: "array";
  type: ScalarType;
  dimensions: Array<{ lower: number; upper: number }>;
  values: Map<string, Value>;
};
type RuntimeValue = Value | ArrayValue;
type Cell = {
  name: string;
  type?: ScalarType;
  constant?: boolean;
  value: RuntimeValue;
};
class Returned {
  constructor(readonly value?: Value) {}
}
const key = (s: string): string => s.toUpperCase();
const isArray = (value: RuntimeValue): value is ArrayValue =>
  typeof value === "object";
const neutral = (type: ScalarType): Value =>
  type === "Booleen"
    ? false
    : type === "Chaine" || type === "Caractere"
      ? ""
      : 0;
const accepts = (type: ScalarType, value: Value): boolean =>
  type === "Entier"
    ? typeof value === "number" && Number.isInteger(value) && Number.isFinite(value)
    : type === "Reel"
      ? typeof value === "number" && Number.isFinite(value)
      : type === "Booleen"
        ? typeof value === "boolean"
        : type === "Caractere"
          ? typeof value === "string" && [...value].length === 1
          : typeof value === "string";

export function execute(
  program: Program,
  locale: LanguageLocale,
  inputs: Value[] = [],
): RunResult {
  const output: string[] = [],
    diagnostics: RunResult["diagnostics"] = [],
    routines = new Map(program.routines.map((r) => [key(r.name), r]));
  let steps = 0,
    inputIndex = 0,
    request: RunResult["inputRequest"];
  const report = (
    line: number,
    code: string,
    fr: string,
    en: string,
    suggestion?: [string, string],
  ) =>
    diagnostics.push({
      severity: "error",
      code,
      message: tr(locale, fr, en),
      suggestion: suggestion ? tr(locale, ...suggestion) : undefined,
      span: spanFor(line),
    });
  const makeCell = (declaration: Declaration): Cell => ({
    name: declaration.name,
    type: declaration.type,
    value: declaration.dimensions
      ? {
          kind: "array",
          type: declaration.type,
          dimensions: declaration.dimensions,
          values: new Map(),
        }
      : neutral(declaration.type),
  });
  const global = new Map<string, Cell>();
  for (const declaration of program.declarations)
    global.set(key(declaration.name), makeCell(declaration));
  const find = (scope: Map<string, Cell>, name: string): Cell | undefined =>
    scope.get(key(name)) ?? global.get(key(name));
  const indexes = (
    array: ArrayValue,
    values: Value[],
    line: number,
  ): string | undefined => {
    if (
      values.length !== array.dimensions.length ||
      values.some((v) => typeof v !== "number" || !Number.isInteger(v))
    ) {
      report(
        line,
        "ALG-S107",
        "Indices de tableau invalides.",
        "Invalid array indexes.",
      );
      return;
    }
    for (let i = 0; i < values.length; i++)
      if (
        (values[i] as number) < array.dimensions[i].lower ||
        (values[i] as number) > array.dimensions[i].upper
      ) {
        report(
          line,
          "ALG-R104",
          "Indice hors des limites du tableau.",
          "Array index is out of bounds.",
        );
        return;
      }
    return values.join(":");
  };
  const evaluate = (
    e: Expr,
    scope: Map<string, Cell>,
    line: number,
  ): Value | undefined => {
    if (e.kind === "literal") return e.value;
    if (e.kind === "name") {
      const cell = find(scope, e.name);
      if (!cell) {
        report(
          line,
          "ALG-S101",
          `La variable \`${e.name}\` n'est pas déclarée.`,
          `The variable \`${e.name}\` is not declared.`,
        );
        return;
      }
      if (isArray(cell.value)) {
        report(
          line,
          "ALG-S108",
          "Un élément du tableau est attendu.",
          "An array element is required.",
        );
        return;
      }
      return cell.value;
    }
    if (e.kind === "index") {
      if (e.target.kind !== "name") {
        report(
          line,
          "ALG-S107",
          "Cible de tableau invalide.",
          "Invalid array target.",
        );
        return;
      }
      const cell = find(scope, e.target.name);
      if (!cell || !isArray(cell.value)) {
        report(
          line,
          "ALG-S109",
          `\`${e.target.name}\` n'est pas un tableau.`,
          `\`${e.target.name}\` is not an array.`,
        );
        return;
      }
      const index = indexes(
        cell.value,
        e.indexes.map((x) => evaluate(x, scope, line) as Value),
        line,
      );
      return index === undefined
        ? undefined
        : (cell.value.values.get(index) ?? neutral(cell.value.type));
    }
    if (e.kind === "call") return call(e.name, e.args, scope, line, true);
    const right = evaluate(e.right, scope, line);
    if (right === undefined) return;
    if (e.kind === "unary") {
      if (e.op === "NON") return !Boolean(right);
      if (typeof right !== "number") {
        report(
          line,
          "ALG-S102",
          "Un nombre est attendu.",
          "A number is required.",
        );
        return;
      }
      return e.op === "-" ? -right : right;
    }
    const left = evaluate(e.left, scope, line);
    if (left === undefined) return;
    if (e.op === "ET") return Boolean(left) && Boolean(right);
    if (e.op === "OU") return Boolean(left) || Boolean(right);
    if (e.op === "=") return left === right;
    if (["!=", "<>"].includes(e.op)) return left !== right;
    if (e.op === "+" && (typeof left === "string" || typeof right === "string"))
      return String(left) + String(right);
    if (["<", "<=", ">", ">="].includes(e.op))
      return e.op === "<"
        ? left < right
        : e.op === "<="
          ? left <= right
          : e.op === ">"
            ? left > right
            : left >= right;
    if (typeof left !== "number" || typeof right !== "number") {
      report(
        line,
        "ALG-S102",
        "Deux nombres sont attendus.",
        "Two numbers are required.",
      );
      return;
    }
    if (["/", "DIV", "MOD"].includes(e.op) && right === 0) {
      report(
        line,
        "ALG-R101",
        "Division par zéro impossible.",
        "Division by zero is not allowed.",
      );
      return;
    }
    return (
      {
        "+": left + right,
        "-": left - right,
        "*": left * right,
        "/": left / right,
        DIV: Math.trunc(left / right),
        MOD: left % right,
      } as Record<string, number>
    )[e.op];
  };
  const assign = (
    target: Target,
    value: Value,
    scope: Map<string, Cell>,
    line: number,
  ): boolean => {
    const cell = find(scope, target.name);
    if (!cell) {
      report(
        line,
        "ALG-S100",
        `La variable \`${target.name}\` n'est pas déclarée.`,
        `The variable \`${target.name}\` is not declared.`,
        ["Déclarez-la dans la section `Variables`.", "Declare it in the `Variables` section."],
      );
      return false;
    }
    if (cell.constant) {
      report(
        line,
        "ALG-S104",
        "Une constante ne peut pas être modifiée.",
        "A constant cannot be changed.",
      );
      return false;
    }
    if (target.indexes.length) {
      if (!isArray(cell.value)) {
        report(
          line,
          "ALG-S109",
          `\`${target.name}\` n'est pas un tableau.`,
          `\`${target.name}\` is not an array.`,
        );
        return false;
      }
      if (!accepts(cell.value.type, value)) {
        report(
          line,
          "ALG-S106",
          `Valeur incompatible avec le type ${cell.value.type}.`,
          `Value is incompatible with type ${cell.value.type}.`,
        );
        return false;
      }
      const index = indexes(
        cell.value,
        target.indexes.map((x) => evaluate(x, scope, line) as Value),
        line,
      );
      if (index === undefined) return false;
      cell.value.values.set(index, value);
      return true;
    }
    if (isArray(cell.value) || !cell.type || !accepts(cell.type, value)) {
      report(
        line,
        "ALG-S106",
        `Valeur incompatible avec le type ${cell.type ?? "Tableau"}.`,
        `Value is incompatible with type ${cell.type ?? "Tableau"}.`,
      );
      return false;
    }
    cell.value = value;
    return true;
  };
  const call = (
    name: string,
    args: Expr[],
    caller: Map<string, Cell>,
    line: number,
    expectsValue: boolean,
  ): Value | undefined => {
    const builtin = key(name);
    if (["LONGUEUR", "MAJUSCULE", "MINUSCULE", "ABS", "RACINE", "ARRONDI", "MIN", "MAX"].includes(builtin)) {
      const values = args.map((argument) => evaluate(argument, caller, line));
      if (values.some((value) => value === undefined)) return;
      if (builtin === "LONGUEUR" && typeof values[0] === "string" && values.length === 1) return [...values[0]].length;
      if (builtin === "MAJUSCULE" && typeof values[0] === "string" && values.length === 1) return values[0].toLocaleUpperCase("fr");
      if (builtin === "MINUSCULE" && typeof values[0] === "string" && values.length === 1) return values[0].toLocaleLowerCase("fr");
      if (builtin === "ABS" && typeof values[0] === "number" && values.length === 1) return Math.abs(values[0]);
      if (builtin === "RACINE" && typeof values[0] === "number" && values[0] >= 0 && values.length === 1) return Math.sqrt(values[0]);
      if (builtin === "ARRONDI" && typeof values[0] === "number" && values.length === 1) return Math.round(values[0]);
      if ((builtin === "MIN" || builtin === "MAX") && values.length >= 2 && values.every((value) => typeof value === "number")) return builtin === "MIN" ? Math.min(...values as number[]) : Math.max(...values as number[]);
      report(line, "ALG-S116", `Arguments invalides pour \`${name}\`.`, `Invalid arguments for \`${name}\`.`);
      return;
    }
    const routine = routines.get(key(name));
    if (!routine) {
      report(
        line,
        "ALG-S110",
        `Sous-programme \`${name}\` inconnu.`,
        `Unknown subprogram \`${name}\`.`,
      );
      return;
    }
    if (args.length !== routine.params.length) {
      report(
        line,
        "ALG-S111",
        `\`${name}\` attend ${routine.params.length} argument(s).`,
        `\`${name}\` expects ${routine.params.length} argument(s).`,
      );
      return;
    }
    const scope = new Map<string, Cell>();
    for (let i = 0; i < args.length; i++) {
      const value = evaluate(args[i], caller, line);
      const parameter = routine.params[i];
      if (value === undefined || !accepts(parameter.type, value)) {
        report(
          line,
          "ALG-S112",
          `Argument incompatible pour \`${parameter.name}\`.`,
          `Incompatible argument for \`${parameter.name}\`.`,
        );
        return;
      }
      scope.set(key(parameter.name), {
        name: parameter.name,
        type: parameter.type,
        value,
      });
    }
    for (const declaration of routine.declarations)
      scope.set(key(declaration.name), makeCell(declaration));
    try {
      runBlock(routine.statements, scope);
    } catch (result) {
      if (result instanceof Returned) {
        if (routine.kind === "procedure" && result.value !== undefined)
          report(
            line,
            "ALG-S114",
            "Une procédure ne retourne pas de valeur.",
            "A procedure does not return a value.",
          );
        else if (
          routine.kind === "function" &&
          result.value !== undefined &&
          routine.returnType &&
          accepts(routine.returnType, result.value)
        )
          return result.value;
        else if (routine.kind === "function")
          report(
            line,
            "ALG-S113",
            "Valeur de retour absente ou incompatible.",
            "Missing or incompatible return value.",
          );
        return;
      }
      throw result;
    }
    if (routine.kind === "function")
      report(
        line,
        "ALG-S113",
        "La fonction doit retourner une valeur.",
        "The function must return a value.",
      );
    else if (expectsValue)
      report(
        line,
        "ALG-S115",
        "Une procédure ne peut pas être utilisée comme valeur.",
        "A procedure cannot be used as a value.",
      );
    return;
  };
  const runBlock = (
    statements: Statement[],
    scope: Map<string, Cell>,
  ): void => {
    for (const s of statements) {
      if (++steps > 100000) {
        report(
          s.line,
          "ALG-R103",
          "Trop d'itérations : exécution arrêtée.",
          "Too many iterations: execution stopped.",
        );
        return;
      }
      if (s.kind === "assign") {
        const value = evaluate(s.value, scope, s.line);
        if (value === undefined || !assign(s.target, value, scope, s.line))
          return;
      } else if (s.kind === "write") {
        const values = s.values.map((e) => evaluate(e, scope, s.line));
        if (values.some((v) => v === undefined)) return;
        output.push(
          values
            .map((v) =>
              typeof v === "boolean" ? (v ? "Vrai" : "Faux") : String(v),
            )
            .join(""),
        );
      } else if (s.kind === "read") {
        for (const target of s.targets) {
          const cell = find(scope, target.name);
          const type =
            cell && (isArray(cell.value) ? cell.value.type : cell.type);
          if (!cell || !type) {
            report(
              s.line,
              "ALG-S100",
              `La variable \`${target.name}\` n'est pas déclarée.`,
              `The variable \`${target.name}\` is not declared.`,
            );
            return;
          }
          if (inputIndex >= inputs.length) {
            request = { name: target.name, type };
            return;
          }
          if (!assign(target, inputs[inputIndex++], scope, s.line)) return;
        }
      } else if (s.kind === "call") {
        call(s.call.name, s.call.args, scope, s.line, false);
      } else if (s.kind === "return") {
        throw new Returned(
          s.value ? evaluate(s.value, scope, s.line) : undefined,
        );
      } else if (s.kind === "if") {
        let matched = false;
        for (const branch of s.branches)
          if (evaluate(branch.condition, scope, s.line)) {
            runBlock(branch.body, scope);
            matched = true;
            break;
          }
        if (!matched) runBlock(s.otherwise, scope);
      } else if (s.kind === "while") {
        while (
          evaluate(s.condition, scope, s.line) &&
          !diagnostics.length &&
          !request
        )
          runBlock(s.body, scope);
      } else if (s.kind === "repeat") {
        do runBlock(s.body, scope);
        while (
          !evaluate(s.condition, scope, s.line) &&
          !diagnostics.length &&
          !request
        );
      } else {
        const start = evaluate(s.start, scope, s.line),
          end = evaluate(s.end, scope, s.line),
          step = evaluate(s.step, scope, s.line);
        if (
          typeof start !== "number" ||
          typeof end !== "number" ||
          typeof step !== "number" ||
          !step
        ) {
          report(
            s.line,
            "ALG-S105",
            "Bornes ou pas de boucle invalides.",
            "Invalid loop bounds or step.",
          );
          return;
        }
        for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
          if (!assign({ name: s.name, indexes: [] }, n, scope, s.line)) return;
          runBlock(s.body, scope);
          if (diagnostics.length || request) return;
        }
      }
      if (diagnostics.length || request) return;
    }
  };
  for (const item of program.constants) {
    const value = evaluate(item.value, global, item.line);
    if (value !== undefined)
      global.set(key(item.name), { name: item.name, value, constant: true });
  }
  try {
    runBlock(program.statements, global);
  } catch {
    report(
      1,
      "ALG-R105",
      "`Retourner` ne peut être utilisé ici.",
      "`Retourner` cannot be used here.",
    );
  }
  const variables: Record<string, Value> = {};
  for (const cell of global.values())
    if (!cell.constant && !isArray(cell.value))
      variables[cell.name] = cell.value;
  return { output, diagnostics, variables, inputRequest: request };
}

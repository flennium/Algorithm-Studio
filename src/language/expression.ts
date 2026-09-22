import type { Expr, Target } from "./types";
type Token = { type: string; text: string };
const priority: Record<string, number> = {
  OU: 1,
  ET: 2,
  "=": 3,
  "!=": 3,
  "<>": 3,
  "<": 3,
  "<=": 3,
  ">": 3,
  ">=": 3,
  "+": 4,
  "-": 4,
  "*": 5,
  "/": 5,
  DIV: 5,
  MOD: 5,
};
function tokens(input: string): Token[] {
  const out: Token[] = [],
    re =
      /\s*(?:(\d+(?:\.\d+)?)|"((?:[^"\\]|\\.)*)"|([\p{L}_][\p{L}\p{N}_]*)|(<=|>=|!=|<>|[+\-*\/=<>(),\[\]]))/guy;
  let at = 0,
    match: RegExpExecArray | null;
  while ((match = re.exec(input))) {
    if (match.index !== at) throw Error();
    at = re.lastIndex;
    out.push({
      type: match[1]
        ? "number"
        : match[2] !== undefined
          ? "string"
          : match[3]
            ? "word"
            : match[4],
      text:
        match[1] ??
        match[2]?.replace(/\\n/g, "\n").replace(/\\"/g, '"') ??
        match[3] ??
        match[4],
    });
  }
  if (input.slice(at).trim()) throw Error();
  return [...out, { type: "eof", text: "" }];
}
export function expression(input: string): Expr {
  const list = tokens(input);
  let i = 0;
  const parseList = (end: string): Expr[] => {
    const result: Expr[] = [];
    if (list[i].type !== end) {
      result.push(parse());
      while (list[i].type === ",") {
        i++;
        result.push(parse());
      }
    }
    if (list[i++].type !== end) throw Error();
    return result;
  };
  const parse = (min = 0): Expr => {
    const token = list[i++],
      upper = token.text.toUpperCase();
    let left: Expr;
    if (token.type === "number")
      left = { kind: "literal", value: Number(token.text) };
    else if (token.type === "string")
      left = { kind: "literal", value: token.text };
    else if (token.type === "word" && ["VRAI", "FAUX"].includes(upper))
      left = { kind: "literal", value: upper === "VRAI" };
    else if (token.type === "word" && upper === "NON")
      left = { kind: "unary", op: "NON", right: parse(5) };
    else if (token.type === "word") left = { kind: "name", name: token.text };
    else if (["+", "-"].includes(token.type))
      left = { kind: "unary", op: token.type, right: parse(5) };
    else if (token.type === "(") {
      left = parse();
      if (list[i++].type !== ")") throw Error();
    } else throw Error();
    while (true) {
      if (list[i].type === "(" && left.kind === "name") {
        i++;
        left = { kind: "call", name: left.name, args: parseList(")") };
        continue;
      }
      if (list[i].type === "[") {
        i++;
        left = { kind: "index", target: left, indexes: parseList("]") };
        continue;
      }
      const op = list[i].text.toUpperCase();
      if ((priority[op] ?? 0) <= min) break;
      i++;
      left = { kind: "binary", op, left, right: parse(priority[op]) };
    }
    return left;
  };
  const result = parse();
  if (list[i].type !== "eof") throw Error();
  return result;
}
export function argumentsOf(input: string): Expr[] {
  if (!input.trim()) return [];
  const parsed = expression(`F(${input})`);
  return parsed.kind === "call" ? parsed.args : [];
}
export function targetOf(input: string): Target {
  const parsed = expression(input);
  if (parsed.kind === "name") return { name: parsed.name, indexes: [] };
  if (parsed.kind === "index" && parsed.target.kind === "name")
    return { name: parsed.target.name, indexes: parsed.indexes };
  throw Error();
}

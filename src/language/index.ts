export type SourcePosition = { offset: number; line: number; column: number };
export type SourceSpan = { start: SourcePosition; end: SourcePosition };

export type Diagnostic = {
  severity: "error" | "warning";
  code: string;
  message: string;
  span: SourceSpan;
  suggestion?: string;
};

export type RunResult = {
  output: string[];
  diagnostics: Diagnostic[];
  variables: Record<string, number | string>;
};

export type LanguageLocale = "fr" | "en";

function translated(locale: LanguageLocale, french: string, english: string): string {
  return locale === "en" ? english : french;
}

type TokenKind =
  | "algorithm"
  | "variables"
  | "begin"
  | "end"
  | "write"
  | "integerType"
  | "realType"
  | "stringType"
  | "identifier"
  | "number"
  | "string"
  | "assign"
  | "colon"
  | "comma"
  | "leftParen"
  | "rightParen"
  | "plus"
  | "minus"
  | "star"
  | "slash"
  | "newline"
  | "eof";

type Token = { kind: TokenKind; text: string; span: SourceSpan };

type Expression =
  | { kind: "number"; value: number; span: SourceSpan }
  | { kind: "string"; value: string; span: SourceSpan }
  | { kind: "name"; name: string; span: SourceSpan }
  | {
      kind: "binary";
      operator: "+" | "-" | "*" | "/";
      left: Expression;
      right: Expression;
      span: SourceSpan;
    };

type Statement =
  | { kind: "assignment"; name: string; value: Expression; span: SourceSpan }
  | { kind: "write"; values: Expression[]; span: SourceSpan };

type Program = {
  name: string;
  declarations: string[];
  statements: Statement[];
};

const keywords: Record<string, TokenKind> = {
  algorithme: "algorithm",
  variables: "variables",
  debut: "begin",
  début: "begin",
  fin: "end",
  ecrire: "write",
  écrire: "write",
  entier: "integerType",
  reel: "realType",
  réel: "realType",
  chaine: "stringType",
  chaîne: "stringType",
};

function position(offset: number, line: number, column: number): SourcePosition {
  return { offset, line, column };
}

function lex(source: string, locale: LanguageLocale): { tokens: Token[]; diagnostics: Diagnostic[] } {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let offset = 0;
  let line = 1;
  let column = 1;

  const currentPosition = (): SourcePosition => position(offset, line, column);
  const advance = (): string => {
    const character = source[offset++] ?? "";
    if (character === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    return character;
  };
  const add = (kind: TokenKind, text: string, start: SourcePosition): void => {
    tokens.push({ kind, text, span: { start, end: currentPosition() } });
  };

  while (offset < source.length) {
    const start = currentPosition();
    const character = source[offset];

    if (character === " " || character === "\t" || character === "\r") {
      advance();
      continue;
    }
    if (character === "\n") {
      add("newline", advance(), start);
      continue;
    }
    if (character === "/" && source[offset + 1] === "/") {
      while (offset < source.length && source[offset] !== "\n") advance();
      continue;
    }
    if (/[\p{L}_]/u.test(character)) {
      let text = "";
      while (offset < source.length && /[\p{L}\p{N}_]/u.test(source[offset])) {
        text += advance();
      }
      add(keywords[text.toLocaleLowerCase("fr")] ?? "identifier", text, start);
      continue;
    }
    if (/\d/.test(character)) {
      let text = "";
      while (offset < source.length && /\d/.test(source[offset])) text += advance();
      if (source[offset] === "." && /\d/.test(source[offset + 1] ?? "")) {
        text += advance();
        while (offset < source.length && /\d/.test(source[offset])) text += advance();
      }
      add("number", text, start);
      continue;
    }
    if (character === '"') {
      advance();
      let text = "";
      while (offset < source.length && source[offset] !== '"' && source[offset] !== "\n") {
        text += advance();
      }
      if (source[offset] === '"') {
        advance();
        add("string", text, start);
      } else {
        diagnostics.push({
          severity: "error",
          code: "ALG-L101",
          message: translated(locale, "La chaîne de caractères n'est pas terminée.", "The text string is not closed."),
          suggestion: translated(locale, "Ajoutez un guillemet double à la fin du texte.", "Add a double quote at the end of the text."),
          span: { start, end: currentPosition() },
        });
      }
      continue;
    }

    const pair = source.slice(offset, offset + 2);
    if (pair === "<-") {
      advance();
      advance();
      add("assign", pair, start);
      continue;
    }

    const punctuation: Record<string, TokenKind> = {
      ":": "colon",
      ",": "comma",
      "(": "leftParen",
      ")": "rightParen",
      "+": "plus",
      "-": "minus",
      "*": "star",
      "/": "slash",
    };
    const kind = punctuation[character];
    if (kind) {
      advance();
      add(kind, character, start);
      continue;
    }

    advance();
    diagnostics.push({
      severity: "error",
      code: "ALG-L100",
      message: translated(locale, `Caractère inattendu : ${character}`, `Unexpected character: ${character}`),
      suggestion: translated(locale, "Supprimez ce caractère ou remplacez-le par un symbole reconnu.", "Remove this character or replace it with a recognized symbol."),
      span: { start, end: currentPosition() },
    });
  }

  const end = currentPosition();
  tokens.push({ kind: "eof", text: "", span: { start: end, end } });
  return { tokens, diagnostics };
}

class Parser {
  private index = 0;
  readonly diagnostics: Diagnostic[] = [];

  constructor(private readonly tokens: Token[], private readonly locale: LanguageLocale) {}

  parse(): Program | null {
    this.skipNewlines();
    if (!this.expect("algorithm", this.t("`Algorithme` attendu au début du programme.", "Expected `Algorithme` at the start of the program."))) return null;
    const name = this.expect("identifier", this.t("Nom du programme attendu après `Algorithme`.", "Expected a program name after `Algorithme`."));
    this.skipNewlines();

    const declarations: string[] = [];
    if (this.match("variables")) {
      this.skipNewlines();
      while (!this.at("begin") && !this.at("eof")) {
        const names: Token[] = [];
        const first = this.expect("identifier", this.t("Nom de variable attendu.", "Expected a variable name."));
        if (!first) {
          this.recoverLine();
          continue;
        }
        names.push(first);
        while (this.match("comma")) {
          const next = this.expect("identifier", this.t("Nom de variable attendu après la virgule.", "Expected a variable name after the comma."));
          if (next) names.push(next);
        }
        this.expect("colon", this.t("`:` attendu après le nom de la variable.", "Expected `:` after the variable name."));
        if (
          !this.match("integerType") &&
          !this.match("realType") &&
          !this.match("stringType")
        ) {
          this.report(this.current(), "ALG-P104", this.t("Type de variable attendu.", "Expected a variable type."));
        }
        declarations.push(...names.map((token) => token.text));
        this.recoverLine();
        this.skipNewlines();
      }
    }

    this.expect("begin", this.t("`Debut` attendu avant les instructions.", "Expected `Debut` before the instructions."));
    this.skipNewlines();
    const statements: Statement[] = [];
    while (!this.at("end") && !this.at("eof")) {
      const statement = this.statement();
      if (statement) statements.push(statement);
      this.recoverLine();
      this.skipNewlines();
    }
    this.expect("end", this.t("`Fin` attendu à la fin du programme.", "Expected `Fin` at the end of the program."));

    return name ? { name: name.text, declarations, statements } : null;
  }

  private statement(): Statement | null {
    const start = this.current();
    if (this.match("write")) {
      this.expect("leftParen", this.t("`(` attendu après `Ecrire`.", "Expected `(` after `Ecrire`."));
      const values: Expression[] = [];
      if (!this.at("rightParen")) {
        const first = this.expression();
        if (first) values.push(first);
        while (this.match("comma")) {
          const next = this.expression();
          if (next) values.push(next);
        }
      }
      const close = this.expect("rightParen", this.t("`)` attendu après les valeurs à écrire.", "Expected `)` after the values to print."));
      return {
        kind: "write",
        values,
        span: { start: start.span.start, end: (close ?? this.previous()).span.end },
      };
    }

    if (this.at("identifier")) {
      const name = this.advance();
      this.expect("assign", this.t("`<-` attendu après le nom de la variable.", "Expected `<-` after the variable name."));
      const value = this.expression();
      if (!value) return null;
      return {
        kind: "assignment",
        name: name.text,
        value,
        span: { start: name.span.start, end: value.span.end },
      };
    }

    this.report(start, "ALG-P105", this.t("Instruction attendue.", "Expected an instruction."));
    return null;
  }

  private expression(minimumPrecedence = 0): Expression | null {
    let left = this.primary();
    if (!left) return null;
    const precedences: Partial<Record<TokenKind, number>> = {
      plus: 1,
      minus: 1,
      star: 2,
      slash: 2,
    };

    while (true) {
      const precedence = precedences[this.current().kind] ?? 0;
      if (precedence <= minimumPrecedence) break;
      const operator = this.advance();
      const right = this.expression(precedence);
      if (!right) break;
      left = {
        kind: "binary",
        operator: operator.text as "+" | "-" | "*" | "/",
        left,
        right,
        span: { start: left.span.start, end: right.span.end },
      };
    }
    return left;
  }

  private primary(): Expression | null {
    const token = this.current();
    if (this.match("number")) {
      return { kind: "number", value: Number(token.text), span: token.span };
    }
    if (this.match("string")) {
      return { kind: "string", value: token.text, span: token.span };
    }
    if (this.match("identifier")) {
      return { kind: "name", name: token.text, span: token.span };
    }
    if (this.match("leftParen")) {
      const value = this.expression();
      this.expect("rightParen", this.t("`)` attendu après l'expression.", "Expected `)` after the expression."));
      return value;
    }
    this.report(token, "ALG-P106", this.t("Expression attendue.", "Expected an expression."));
    return null;
  }

  private report(token: Token, code: string, message: string): void {
    this.diagnostics.push({ severity: "error", code, message, span: token.span });
  }
  private t(french: string, english: string): string {
    return translated(this.locale, french, english);
  }
  private expect(kind: TokenKind, message: string): Token | null {
    if (this.at(kind)) return this.advance();
    this.report(this.current(), "ALG-P100", message);
    return null;
  }
  private match(kind: TokenKind): boolean {
    if (!this.at(kind)) return false;
    this.advance();
    return true;
  }
  private at(kind: TokenKind): boolean {
    return this.current().kind === kind;
  }
  private current(): Token {
    return this.tokens[this.index];
  }
  private previous(): Token {
    return this.tokens[Math.max(0, this.index - 1)];
  }
  private advance(): Token {
    const token = this.current();
    if (token.kind !== "eof") this.index += 1;
    return token;
  }
  private skipNewlines(): void {
    while (this.match("newline")) {}
  }
  private recoverLine(): void {
    while (!this.at("newline") && !this.at("eof") && !this.at("end")) this.advance();
  }
}

function execute(program: Program, locale: LanguageLocale): RunResult {
  const output: string[] = [];
  const diagnostics: Diagnostic[] = [];
  const variables: Record<string, number | string> = {};
  const declared = new Map(program.declarations.map((name) => [name.toLocaleLowerCase("fr"), name]));
  for (const name of program.declarations) variables[name] = 0;

  const evaluate = (expression: Expression): number | string | undefined => {
    if (expression.kind === "number" || expression.kind === "string") return expression.value;
    if (expression.kind === "name") {
      const declaredName = declared.get(expression.name.toLocaleLowerCase("fr"));
      if (!declaredName) {
        diagnostics.push({
          severity: "error",
          code: "ALG-S101",
          message: translated(locale, `La variable \`${expression.name}\` n'est pas déclarée.`, `The variable \`${expression.name}\` is not declared.`),
          suggestion: translated(locale, "Déclarez-la dans la section `Variables`.", "Declare it in the `Variables` section."),
          span: expression.span,
        });
        return undefined;
      }
      return variables[declaredName];
    }
    const left = evaluate(expression.left);
    const right = evaluate(expression.right);
    if (left === undefined || right === undefined) return undefined;
    if (expression.operator === "+" && (typeof left === "string" || typeof right === "string")) {
      return String(left) + String(right);
    }
    if (typeof left !== "number" || typeof right !== "number") {
      diagnostics.push({
        severity: "error",
        code: "ALG-S102",
        message: translated(locale, "Cette opération nécessite deux nombres.", "This operation requires two numbers."),
        span: expression.span,
      });
      return undefined;
    }
    if (expression.operator === "/" && right === 0) {
      diagnostics.push({
        severity: "error",
        code: "ALG-R101",
        message: translated(locale, "Division par zéro impossible.", "Division by zero is not allowed."),
        span: expression.right.span,
      });
      return undefined;
    }
    return { "+": left + right, "-": left - right, "*": left * right, "/": left / right }[
      expression.operator
    ];
  };

  for (const statement of program.statements) {
    if (diagnostics.length > 0) break;
    if (statement.kind === "assignment") {
      const declaredName = declared.get(statement.name.toLocaleLowerCase("fr"));
      if (!declaredName) {
        diagnostics.push({
          severity: "error",
          code: "ALG-S100",
          message: translated(locale, `La variable \`${statement.name}\` n'est pas déclarée.`, `The variable \`${statement.name}\` is not declared.`),
          suggestion: translated(locale, "Déclarez-la dans la section `Variables`.", "Declare it in the `Variables` section."),
          span: statement.span,
        });
        continue;
      }
      const value = evaluate(statement.value);
      if (value !== undefined) variables[declaredName] = value;
    } else {
      const values = statement.values.map(evaluate);
      if (values.every((value) => value !== undefined)) output.push(values.join(""));
    }
  }

  return { output, diagnostics, variables };
}

export function run(source: string, locale: LanguageLocale = "fr"): RunResult {
  const lexical = lex(source, locale);
  if (lexical.diagnostics.length > 0) {
    return { output: [], diagnostics: lexical.diagnostics, variables: {} };
  }
  const parser = new Parser(lexical.tokens, locale);
  const program = parser.parse();
  if (!program || parser.diagnostics.length > 0) {
    return { output: [], diagnostics: parser.diagnostics, variables: {} };
  }
  return execute(program, locale);
}

export type LanguageLocale = "fr" | "en";
export type Value = number | string | boolean;
export type ScalarType = "Entier" | "Reel" | "Chaine" | "Caractere" | "Booleen";
export type SourcePosition = { offset: number; line: number; column: number };
export type SourceSpan = { start: SourcePosition; end: SourcePosition };
export type Diagnostic = {
  severity: "error" | "warning";
  code: string;
  message: string;
  span: SourceSpan;
  suggestion?: string;
};
export type InputRequest = { name: string; type: ScalarType };
export type RunResult = {
  output: string[];
  diagnostics: Diagnostic[];
  variables: Record<string, Value>;
  inputRequest?: InputRequest;
};
export type Expr =
  | { kind: "literal"; value: Value }
  | { kind: "name"; name: string }
  | { kind: "unary"; op: string; right: Expr }
  | { kind: "binary"; op: string; left: Expr; right: Expr }
  | { kind: "index"; target: Expr; indexes: Expr[] }
  | { kind: "call"; name: string; args: Expr[] };
export type Target = { name: string; indexes: Expr[] };
export type Statement =
  | { kind: "assign"; target: Target; value: Expr; line: number }
  | { kind: "write"; values: Expr[]; line: number }
  | { kind: "read"; targets: Target[]; line: number }
  | { kind: "call"; call: Extract<Expr, { kind: "call" }>; line: number }
  | { kind: "return"; value?: Expr; line: number }
  | {
      kind: "if";
      branches: Array<{ condition: Expr; body: Statement[] }>;
      otherwise: Statement[];
      line: number;
    }
  | { kind: "while"; condition: Expr; body: Statement[]; line: number }
  | { kind: "repeat"; condition: Expr; body: Statement[]; line: number }
  | {
      kind: "for";
      name: string;
      start: Expr;
      end: Expr;
      step: Expr;
      body: Statement[];
      line: number;
    };
export type Declaration = {
  name: string;
  type: ScalarType;
  dimensions?: Array<{ lower: number; upper: number }>;
};
export type Routine = {
  kind: "function" | "procedure";
  name: string;
  params: Declaration[];
  returnType?: ScalarType;
  declarations: Declaration[];
  statements: Statement[];
  line: number;
};
export type Program = {
  name: string;
  declarations: Declaration[];
  constants: Array<{ name: string; value: Expr; line: number }>;
  routines: Routine[];
  statements: Statement[];
};
export const spanFor = (line: number): SourceSpan => ({
  start: { offset: 0, line, column: 1 },
  end: { offset: 0, line, column: 2 },
});
export const tr = (locale: LanguageLocale, fr: string, en: string): string =>
  locale === "en" ? en : fr;

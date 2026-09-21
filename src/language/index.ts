import { execute } from "./interpreter";
import { parse } from "./parser";
import type { LanguageLocale, RunResult } from "./types";
export type { Diagnostic, LanguageLocale, RunResult, SourcePosition, SourceSpan, Value } from "./types";
export function run(source: string, locale: LanguageLocale = "fr"): RunResult { const result = parse(source, locale); return result.program ? execute(result.program, locale) : { output: [], diagnostics: result.diagnostics, variables: {} }; }

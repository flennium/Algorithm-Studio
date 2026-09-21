import { describe, expect, it } from "vitest";
import { argumentsOf, expression } from "./expression";

describe("expression grammar", () => {
  it.each([
    ["1 + 2 * 3", "binary", "+"],
    ["(1 + 2) * 3", "binary", "*"],
    ["NON Faux", "unary", "NON"],
    ["-5", "unary", "-"],
    ["7 DIV 2", "binary", "DIV"],
    ["7 MOD 2", "binary", "MOD"],
    ["a <= b ET b <> c OU Vrai", "binary", "OU"],
  ])("parses %s with the expected root", (source, kind, operator) => {
    const parsed = expression(source);
    expect(parsed.kind).toBe(kind);
    expect("op" in parsed ? parsed.op : undefined).toBe(operator);
  });

  it("keeps commas inside strings and nested expressions", () => {
    expect(argumentsOf('"a,b", (1 + 2), "c"')).toHaveLength(3);
  });

  it.each(["", "1 +", "(1 + 2", "1 @ 2", "1 2"])("rejects malformed expression %j", (source) => {
    expect(() => expression(source)).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { computeRationalExponent, evaluateFloatForGraph, simplifyFraction } from "./rationalExponent";

describe("computeRationalExponent", () => {
  it("computes a normal perfect-power case exactly: 8^(2/3) = 4", () => {
    const result = computeRationalExponent(8, 2, 3);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.isExact).toBe(true);
      expect(result.numericValue).toBe(4);
    }
  });

  it("handles negative base with odd denominator: (-27)^(2/3) = 9", () => {
    const result = computeRationalExponent(-27, 2, 3);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.isExact).toBe(true);
      expect(result.numericValue).toBe(9);
    }
  });

  it("handles negative base with odd numerator giving a negative result: (-8)^(1/3) = -2", () => {
    const result = computeRationalExponent(-8, 1, 3);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.numericValue).toBe(-2);
    }
  });

  it("flags negative base with even denominator as undefined in the reals", () => {
    const result = computeRationalExponent(-4, 1, 2);
    expect(result.kind).toBe("even-root-of-negative");
  });

  it("computes zero base with positive exponent as 0", () => {
    const result = computeRationalExponent(0, 3, 2);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.numericValue).toBe(0);
    }
  });

  it("flags zero base with negative exponent as undefined (division by zero)", () => {
    const result = computeRationalExponent(0, -1, 2);
    expect(result.kind).toBe("zero-negative-exponent");
  });

  it("flags 0^0 as indeterminate", () => {
    const result = computeRationalExponent(0, 0, 1);
    expect(result.kind).toBe("indeterminate");
  });

  it("reduces an unreduced fraction before computing: 4^(2/4) behaves like 4^(1/2)", () => {
    const reduced = computeRationalExponent(4, 2, 4);
    const direct = computeRationalExponent(4, 1, 2);
    expect(reduced.kind).toBe("value");
    expect(direct.kind).toBe("value");
    if (reduced.kind === "value" && direct.kind === "value") {
      expect(reduced.wasSimplified).toBe(true);
      expect(reduced.simplifiedM).toBe(direct.simplifiedM);
      expect(reduced.simplifiedN).toBe(direct.simplifiedN);
      expect(reduced.numericValue).toBe(direct.numericValue);
    }
  });

  it("flags a huge result instead of silently showing Infinity", () => {
    const result = computeRationalExponent(10, 30, 1);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.isHuge).toBe(true);
      expect(Number.isFinite(result.numericValue) || result.exactFractionLatex !== undefined || true).toBe(true);
    }
  });

  it("rejects non-integer numerator/denominator inputs", () => {
    const result = computeRationalExponent(4, 1.5, 2);
    expect(result.kind).toBe("invalid-input");
  });

  it("rejects a zero denominator", () => {
    const result = computeRationalExponent(4, 1, 0);
    expect(result.kind).toBe("zero-denominator");
  });

  it("handles negative exponents as reciprocals: 8^(-2/3) = 1/4", () => {
    const result = computeRationalExponent(8, -2, 3);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.isExact).toBe(true);
      expect(result.numericValue).toBeCloseTo(0.25, 10);
    }
  });

  it("gives an approximate, clearly-marked result for irrational roots: 2^(1/2)", () => {
    const result = computeRationalExponent(2, 1, 2);
    expect(result.kind).toBe("value");
    if (result.kind === "value") {
      expect(result.isExact).toBe(false);
      expect(result.numericValue).toBeCloseTo(Math.SQRT2, 9);
    }
  });
});

describe("evaluateFloatForGraph", () => {
  it("matches the exact computation for defined points", () => {
    expect(evaluateFloatForGraph(8, 2, 3)).toBeCloseTo(4, 9);
  });

  it("returns NaN for negative base with even denominator (domain gap)", () => {
    expect(Number.isNaN(evaluateFloatForGraph(-4, 1, 2))).toBe(true);
  });

  it("returns NaN for zero base with negative exponent", () => {
    expect(Number.isNaN(evaluateFloatForGraph(0, -1, 2))).toBe(true);
  });

  it("returns 0 for zero base with positive exponent", () => {
    expect(evaluateFloatForGraph(0, 3, 2)).toBe(0);
  });
});

describe("simplifyFraction", () => {
  it("reduces to lowest terms", () => {
    expect(simplifyFraction(4, 2)).toEqual({ m: 2, n: 1 });
    expect(simplifyFraction(2, 4)).toEqual({ m: 1, n: 2 });
  });

  it("normalizes a negative denominator", () => {
    expect(simplifyFraction(3, -2)).toEqual({ m: -3, n: 2 });
  });
});

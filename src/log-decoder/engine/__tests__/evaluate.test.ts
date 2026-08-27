import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { Div, Frac, Int, Ln, Log, Var } from '../ast';
import { evaluateExpr } from '../evaluate';

describe('evaluateExpr: identity cases', () => {
  it('log_b(1) = 0', () => {
    const r = evaluateExpr(Log(Int(7), Int(1)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(0);
  });

  it('log_b(b) = 1', () => {
    const r = evaluateExpr(Log(Int(5), Int(5)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(1);
  });

  it('ln(1) = 0', () => {
    const r = evaluateExpr(Ln(Int(1)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(0);
  });
});

describe('evaluateExpr: exact integer results', () => {
  it('log_2(8) = 3 exactly', () => {
    const r = evaluateExpr(Log(Int(2), Int(8)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(3);
  });

  it('log(0.001) = -3 exactly (base 10)', () => {
    const r = evaluateExpr(Log(Int(10), Frac(1n, 1000n)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(-3);
  });

  it('log_2(1024) = 10 exactly', () => {
    const r = evaluateExpr(Log(Int(2), Int(1024)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(10);
  });
});

describe('evaluateExpr: change of base consistency', () => {
  it('log_2(50) equals ln(50)/ln(2)', () => {
    const viaLog = evaluateExpr(Log(Int(2), Int(50)));
    const viaLn = evaluateExpr(Div(Ln(Int(50)), Ln(Int(2))));
    expect(viaLog.ok && viaLn.ok).toBe(true);
    if (viaLog.ok && viaLn.ok) {
      expect(viaLog.value.toDecimalPlaces(8).toNumber()).toBeCloseTo(viaLn.value.toDecimalPlaces(8).toNumber(), 6);
    }
  });
});

describe('evaluateExpr: non-integer base', () => {
  it('log base 0.5 of 8 = -3', () => {
    const r = evaluateExpr(Log(Frac(1n, 2n), Int(8)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(-3);
  });
});

describe('evaluateExpr: fractional and negative arguments', () => {
  it('log_3(1/9) = -2', () => {
    const r = evaluateExpr(Log(Int(3), Frac(1n, 9n)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBe(-2);
  });

  it('log of negative argument errors', () => {
    const r = evaluateExpr(Log(Int(10), Int(-5)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('invalid-argument');
  });

  it('log of zero argument errors', () => {
    const r = evaluateExpr(Log(Int(10), Int(0)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('invalid-argument');
  });
});

describe('evaluateExpr: invalid base', () => {
  it('base = 1 errors', () => {
    const r = evaluateExpr(Log(Int(1), Int(5)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('invalid-base');
  });

  it('base = 0 errors', () => {
    const r = evaluateExpr(Log(Int(0), Int(5)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('invalid-base');
  });

  it('base negative errors', () => {
    const r = evaluateExpr(Log(Int(-2), Int(5)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('invalid-base');
  });
});

describe('evaluateExpr: variables', () => {
  it('substitutes bound variable', () => {
    const r = evaluateExpr(Var('x'), { x: new Decimal(4) });
    expect(r.ok).toBe(true);
  });

  it('errors on unbound variable', () => {
    const r = evaluateExpr(Var('x'));
    expect(r.ok).toBe(false);
  });
});

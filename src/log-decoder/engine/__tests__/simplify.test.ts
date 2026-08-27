import { describe, expect, it } from 'vitest';
import { Int, Log, Mul, Var } from '../ast';
import { evaluateExpr } from '../evaluate';
import { simplifyExpr } from '../simplify';

describe('simplifyExpr', () => {
  it('simplifies log_2(8) to 3 with at least one step', () => {
    const d = simplifyExpr(Log(Int(2), Int(8)));
    expect(d.steps.length).toBeGreaterThan(0);
    expect(d.simplifiedResult).toBeDefined();
    const v = evaluateExpr(d.simplifiedResult!);
    expect(v.ok && v.value.toNumber()).toBe(3);
  });

  it('applies product rule to log(x*y)', () => {
    const d = simplifyExpr(Log(Int(10), Mul(Var('x'), Var('y'))));
    expect(d.steps.some((s) => s.property === 'product-rule')).toBe(true);
  });

  it('collects domain conditions for log(x)', () => {
    const d = simplifyExpr(Log(Int(10), Var('x')));
    expect(d.domain.length).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from 'vitest';
import { evaluateExpr } from '../evaluate';
import { parseEquation, parseExpression } from '../parser';

describe('parseExpression', () => {
  it('parses log_2(8)', () => {
    const r = parseExpression('log_2(8)');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const v = evaluateExpr(r.value);
      expect(v.ok && v.value.toNumber()).toBe(3);
    }
  });

  it('parses log2(8) (no underscore)', () => {
    const r = parseExpression('log2(8)');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const v = evaluateExpr(r.value);
      expect(v.ok && v.value.toNumber()).toBe(3);
    }
  });

  it('parses log_2 8 (space, no parens)', () => {
    const r = parseExpression('log_2 8');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const v = evaluateExpr(r.value);
      expect(v.ok && v.value.toNumber()).toBe(3);
    }
  });

  it('parses log(x) as base 10', () => {
    const r = parseExpression('log(1000)');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const v = evaluateExpr(r.value);
      expect(v.ok && v.value.toNumber()).toBe(3);
    }
  });

  it('parses ln(x)', () => {
    const r = parseExpression('ln(1)');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const v = evaluateExpr(r.value);
      expect(v.ok && v.value.toNumber()).toBe(0);
    }
  });

  it('rejects empty input', () => {
    const r = parseExpression('');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('empty-input');
  });

  it('rejects unparseable syntax', () => {
    const r = parseExpression('log_2(');
    expect(r.ok).toBe(false);
  });
});

describe('parseEquation', () => {
  it('parses a logarithmic equation', () => {
    const r = parseEquation('log_2(x) + log_2(x-2) = 3');
    expect(r.ok).toBe(true);
  });

  it('parses an exponential equation', () => {
    const r = parseEquation('2^x=50');
    expect(r.ok).toBe(true);
  });

  it('rejects missing =', () => {
    const r = parseEquation('2^x');
    expect(r.ok).toBe(false);
  });
});

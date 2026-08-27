import { describe, expect, it } from 'vitest';
import { parseEquation } from '../parser';
import { solveEquation } from '../solveEquation';

describe('solveEquation: logarithmic equations with extraneous roots', () => {
  it('solves log_2(x) + log_2(x-2) = 3, rejecting x=-2', () => {
    const eq = parseEquation('log_2(x) + log_2(x-2) = 3');
    expect(eq.ok).toBe(true);
    if (!eq.ok) return;
    const r = solveEquation(eq.value);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const roots = r.value.candidateRoots!;
    expect(roots.length).toBe(2);
    const valid = roots.filter((x) => x.isValid);
    const rejected = roots.filter((x) => !x.isValid);
    expect(valid.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(valid[0].decimal).toBeCloseTo(4, 6);
    expect(rejected[0].decimal).toBeCloseTo(-2, 6);
    expect(rejected[0].rejectionReasonTh).toBeTruthy();
  });
});

describe('solveEquation: exponential equations', () => {
  it('solves 2^x=50', () => {
    const eq = parseEquation('2^x=50');
    expect(eq.ok).toBe(true);
    if (!eq.ok) return;
    const r = solveEquation(eq.value);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.candidateRoots![0].decimal).toBeCloseTo(5.6438561897747395, 6);
  });

  it('solves 3^(x+1)=81 exactly to x=3', () => {
    const eq = parseEquation('3^(x+1)=81');
    expect(eq.ok).toBe(true);
    if (!eq.ok) return;
    const r = solveEquation(eq.value);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.candidateRoots![0].decimal).toBeCloseTo(3, 8);
  });

  it('solves 5^(2x)=7^x to x=0', () => {
    const eq = parseEquation('5^(2*x)=7^x');
    expect(eq.ok).toBe(true);
    if (!eq.ok) return;
    const r = solveEquation(eq.value);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.candidateRoots![0].decimal).toBeCloseTo(0, 8);
  });
});

describe('solveEquation: no-solution', () => {
  it('returns a typed error, never throws, for unsupported forms', () => {
    const eq = parseEquation('x + 1 = 2');
    expect(eq.ok).toBe(true);
    if (!eq.ok) return;
    const r = solveEquation(eq.value);
    // ไม่มี log และไม่มี pow ที่ตัวแปรอยู่บนเลขชี้กำลัง -> unsupported (typed error, ไม่ throw)
    expect(r.ok).toBe(false);
  });
});

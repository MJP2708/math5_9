// log_b(x*y) = log_b(x) + log_b(y)
import { Add, Log, Ln } from '../ast';
import type { Rule } from './types';

export const productRuleRule: Rule = (e) => {
  if (e.kind === 'log' && e.arg.kind === 'mul' && e.arg.factors.length >= 2) {
    const [first, ...restFactors] = e.arg.factors;
    const rest = restFactors.length === 1 ? restFactors[0] : { kind: 'mul' as const, factors: restFactors };
    return {
      after: Add(Log(e.base, first), Log(e.base, rest)),
      property: 'product-rule',
      explanationTh: 'แยก log ของผลคูณ ให้เป็นผลบวกของ log แต่ละตัวประกอบ',
    };
  }
  if (e.kind === 'ln' && e.arg.kind === 'mul' && e.arg.factors.length >= 2) {
    const [first, ...restFactors] = e.arg.factors;
    const rest = restFactors.length === 1 ? restFactors[0] : { kind: 'mul' as const, factors: restFactors };
    return {
      after: Add(Ln(first), Ln(rest)),
      property: 'product-rule',
      explanationTh: 'แยก ln ของผลคูณ ให้เป็นผลบวกของ ln แต่ละตัวประกอบ',
    };
  }
  return null;
};

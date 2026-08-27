// log_b(x/y) = log_b(x) - log_b(y)
import { Add, Log, Ln, Neg } from '../ast';
import type { Rule } from './types';

export const quotientRuleRule: Rule = (e) => {
  if (e.kind === 'log' && e.arg.kind === 'div') {
    return {
      after: Add(Log(e.base, e.arg.num), Neg(Log(e.base, e.arg.den))),
      property: 'quotient-rule',
      explanationTh: 'แยก log ของผลหาร ให้เป็น log ตัวตั้งลบ log ตัวหาร',
    };
  }
  if (e.kind === 'ln' && e.arg.kind === 'div') {
    return {
      after: Add(Ln(e.arg.num), Neg(Ln(e.arg.den))),
      property: 'quotient-rule',
      explanationTh: 'แยก ln ของผลหาร ให้เป็น ln ตัวตั้งลบ ln ตัวหาร',
    };
  }
  return null;
};

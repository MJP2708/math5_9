// log_b(b^k) = k
import { exprValueEqual } from './equals';
import type { Rule } from './types';

export const inverseLogExpRule: Rule = (e) => {
  if (e.kind === 'log' && e.arg.kind === 'pow' && exprValueEqual(e.base, e.arg.base)) {
    return {
      after: e.arg.exp,
      property: 'inverse-log-exp',
      explanationTh: 'log_b(b^k) ลดรูปเหลือ k เพราะ log และเลขยกกำลังฐานเดียวกันหักล้างกัน',
    };
  }
  if (e.kind === 'ln' && e.arg.kind === 'pow' && e.arg.base.kind === 'var' && e.arg.base.name === 'e') {
    return { after: e.arg.exp, property: 'inverse-log-exp', explanationTh: 'ln(e^k) ลดรูปเหลือ k' };
  }
  return null;
};

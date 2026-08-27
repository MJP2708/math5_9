// b^(log_b x) = x
import { exprValueEqual } from './equals';
import type { Rule } from './types';

export const inverseExpLogRule: Rule = (e) => {
  if (e.kind === 'pow' && e.exp.kind === 'log' && exprValueEqual(e.base, e.exp.base)) {
    return {
      after: e.exp.arg,
      property: 'inverse-exp-log',
      explanationTh: 'b^(log_b x) ลดรูปเหลือ x เพราะเลขยกกำลังและ log ฐานเดียวกันหักล้างกัน',
    };
  }
  return null;
};

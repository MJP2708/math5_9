// log_b(1) = 0
import { Int } from '../ast';
import { exprValueEqual } from './equals';
import type { Rule } from './types';

export const logOfOneRule: Rule = (e) => {
  if (e.kind === 'log' && exprValueEqual(e.arg, Int(1))) {
    return { after: Int(0), property: 'log-of-one', explanationTh: 'log ของ 1 ที่ฐานใดๆ มีค่าเท่ากับ 0' };
  }
  if (e.kind === 'ln' && exprValueEqual(e.arg, Int(1))) {
    return { after: Int(0), property: 'log-of-one', explanationTh: 'ln ของ 1 มีค่าเท่ากับ 0' };
  }
  return null;
};

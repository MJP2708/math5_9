// log_b(b) = 1
import { Int } from '../ast';
import { exprValueEqual } from './equals';
import type { Rule } from './types';

export const logBaseSelfRule: Rule = (e) => {
  if (e.kind === 'log' && exprValueEqual(e.base, e.arg)) {
    return { after: Int(1), property: 'log-base-self', explanationTh: 'log ที่ฐานเท่ากับอาร์กิวเมนต์ มีค่าเท่ากับ 1 เสมอ' };
  }
  return null;
};

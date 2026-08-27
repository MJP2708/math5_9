// log_b(x^k) = k * log_b(x)
import { Log, Ln, Mul } from '../ast';
import type { Rule } from './types';

export const powerRuleRule: Rule = (e) => {
  if (e.kind === 'log' && e.arg.kind === 'pow') {
    return {
      after: Mul(e.arg.exp, Log(e.base, e.arg.base)),
      property: 'power-rule',
      explanationTh: 'ดึงเลขชี้กำลังของอาร์กิวเมนต์ออกมาคูณหน้า log',
    };
  }
  if (e.kind === 'ln' && e.arg.kind === 'pow') {
    return {
      after: Mul(e.arg.exp, Ln(e.arg.base)),
      property: 'power-rule',
      explanationTh: 'ดึงเลขชี้กำลังของอาร์กิวเมนต์ออกมาคูณหน้า ln',
    };
  }
  return null;
};

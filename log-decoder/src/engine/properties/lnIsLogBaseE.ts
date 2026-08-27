// ln(x) = log_e(x) — ใช้อธิบายความหมายของ ln เมื่อผู้ใช้ถามหรือเมื่อต้องแปลงไปมา
import { Log, Var } from '../ast';
import type { Rule } from './types';

export const lnIsLogBaseERule: Rule = (e) => {
  if (e.kind === 'ln') {
    return {
      after: Log(Var('e'), e.arg),
      property: 'ln-is-log-base-e',
      explanationTh: 'ln คือ log ฐาน e (ค่าคงที่ออยเลอร์ ประมาณ 2.71828)',
    };
  }
  return null;
};

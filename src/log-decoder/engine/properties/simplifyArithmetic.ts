// พับ (fold) นิพจน์ที่เป็นค่าคงที่ล้วนๆ ให้เหลือค่าเดียวแบบ exact (ไม่ปัดเศษ)
// ครอบคลุมทั้งเลขคณิตธรรมดา และ log/ln ที่ผลลัพธ์เป็นจำนวนตรรกยะพอดี (เช่น log_2 8 = 3)
import { exactRationalLog, exprToRational, ratToExpr } from '../rational';
import type { Rule } from './types';

export const simplifyArithmeticRule: Rule = (e) => {
  if (e.kind === 'log') {
    const baseR = exprToRational(e.base);
    const argR = exprToRational(e.arg);
    if (baseR && argR && baseR.num > 0n && !(baseR.num === baseR.den)) {
      const k = exactRationalLog(baseR, argR);
      if (k !== null) {
        return {
          after: ratToExpr({ num: k, den: 1n }),
          property: 'simplify-arithmetic',
          explanationTh: 'คำนวณค่า log ของจำนวนคงที่นี้ได้ค่าตรงตัว (exact)',
        };
      }
    }
    return null;
  }
  if (e.kind === 'ln') {
    const argR = exprToRational(e.arg);
    if (argR && argR.num === 1n && argR.den === 1n) {
      return { after: ratToExpr({ num: 0n, den: 1n }), property: 'simplify-arithmetic', explanationTh: 'ln(1) = 0' };
    }
    return null;
  }
  if (e.kind === 'int' || e.kind === 'frac' || e.kind === 'var') return null;
  const r = exprToRational(e);
  if (r) {
    return {
      after: ratToExpr(r),
      property: 'simplify-arithmetic',
      explanationTh: 'คำนวณค่านิพจน์ตัวเลขนี้ให้เหลือค่าเดียว',
    };
  }
  return null;
};

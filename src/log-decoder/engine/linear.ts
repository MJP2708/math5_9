// สกัดสัมประสิทธิ์ของนิพจน์เชิงเส้นในตัวแปร x (รูป a*x + b) แบบ exact (สัญลักษณ์ ไม่ใช่ตัวเลขสุ่มตรวจ)
// และช่วยคูณพหุนาม (สำหรับสมการที่ผสม product rule แล้วได้พหุนามดีกรี 2)
import type { Expr } from './ast';
import {
  type Rational,
  mkRational,
  ratAdd,
  ratDiv,
  ratIsInteger,
  ratMul,
  ratSub,
} from './rational';

export interface Linear {
  a: Rational; // สัมประสิทธิ์หน้า x
  b: Rational; // ค่าคงที่
}

const ZERO = mkRational(0n, 1n);
const ONE = mkRational(1n, 1n);

const mulLinear = (p: Linear, q: Linear): Linear | null => {
  // (p.a x + p.b)(q.a x + q.b) = p.a*q.a x^2 + (p.a*q.b+p.b*q.a) x + p.b*q.b
  const x2 = ratMul(p.a, q.a);
  if (x2.num !== 0n) return null; // จะเกินดีกรี 1 ไม่รองรับในฟังก์ชันนี้ (ใช้ multiplyLinearFactors แทนสำหรับพหุนาม)
  return { a: ratAdd(ratMul(p.a, q.b), ratMul(p.b, q.a)), b: ratMul(p.b, q.b) };
};

export const linearCoeffs = (expr: Expr, varName = 'x'): Linear | null => {
  switch (expr.kind) {
    case 'int':
      return { a: ZERO, b: mkRational(expr.value, 1n) };
    case 'frac':
      return { a: ZERO, b: mkRational(expr.num, expr.den) };
    case 'var':
      return expr.name === varName ? { a: ONE, b: ZERO } : null;
    case 'neg': {
      const l = linearCoeffs(expr.arg, varName);
      return l ? { a: mkRational(-l.a.num, l.a.den), b: mkRational(-l.b.num, l.b.den) } : null;
    }
    case 'add': {
      let acc: Linear | null = { a: ZERO, b: ZERO };
      for (const t of expr.terms) {
        const l = linearCoeffs(t, varName);
        if (!l || !acc) return null;
        acc = { a: ratAdd(acc.a, l.a), b: ratAdd(acc.b, l.b) };
      }
      return acc;
    }
    case 'mul': {
      let acc: Linear | null = { a: ZERO, b: ONE };
      for (const f of expr.factors) {
        const l = linearCoeffs(f, varName);
        if (!l || !acc) return null;
        acc = mulLinear(acc, l);
        if (!acc) return null;
      }
      return acc;
    }
    case 'div': {
      const n = linearCoeffs(expr.num, varName);
      const d = linearCoeffs(expr.den, varName);
      if (!n || !d || d.a.num !== 0n) return null; // ตัวหารต้องเป็นค่าคงที่
      return { a: ratDiv(n.a, d.b), b: ratDiv(n.b, d.b) };
    }
    case 'pow': {
      if (expr.exp.kind === 'int' && expr.exp.value === 0n) return { a: ZERO, b: ONE };
      if (expr.exp.kind === 'int' && expr.exp.value === 1n) return linearCoeffs(expr.base, varName);
      return null;
    }
    default:
      return null;
  }
};

// คูณพหุนามหลายตัวประกอบเชิงเส้นเข้าด้วยกัน คืนสัมประสิทธิ์ [c0, c1, c2, ...] (ดีกรีสูงสุดที่รองรับ = 2)
export const multiplyLinearFactors = (factors: Expr[], varName = 'x'): Rational[] | null => {
  let poly: Rational[] = [ONE];
  for (const f of factors) {
    const l = linearCoeffs(f, varName);
    if (!l) return null;
    const factorPoly = l.a.num === 0n ? [l.b] : [l.b, l.a];
    const result: Rational[] = new Array(poly.length + factorPoly.length - 1).fill(ZERO);
    for (let i = 0; i < poly.length; i++) {
      for (let j = 0; j < factorPoly.length; j++) {
        result[i + j] = ratAdd(result[i + j], ratMul(poly[i], factorPoly[j]));
      }
    }
    poly = result;
    if (poly.length > 3) return null; // ดีกรีเกิน 2 ไม่รองรับ
  }
  while (poly.length < 3) poly.push(ZERO);
  return poly;
};

export const ratIsIntegerCheck = ratIsInteger;
export const ratSubtract = ratSub;

// ยูทิลิตี "เศษส่วนแม่นตรง" (exact rational) บน bigint
// ใช้เป็นแกนกลางของการคำนวณแบบ exact (ไม่ปัดเศษ) ทั่วทั้ง engine

import type { Expr } from './ast';
import { Frac, Int } from './ast';

export interface Rational {
  num: bigint;
  den: bigint; // den > 0 เสมอ
}

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) {
    [a, b] = [b, a % b];
  }
  return a === 0n ? 1n : a;
};

export const mkRational = (num: bigint, den: bigint): Rational => {
  if (den === 0n) throw new Error('ส่วนเป็นศูนย์');
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
};

export const ratAdd = (a: Rational, b: Rational): Rational =>
  mkRational(a.num * b.den + b.num * a.den, a.den * b.den);

export const ratSub = (a: Rational, b: Rational): Rational =>
  mkRational(a.num * b.den - b.num * a.den, a.den * b.den);

export const ratMul = (a: Rational, b: Rational): Rational =>
  mkRational(a.num * b.num, a.den * b.den);

export const ratDiv = (a: Rational, b: Rational): Rational =>
  mkRational(a.num * b.den, a.den * b.num);

// a^n โดย n เป็นจำนวนเต็ม (บวก/ลบ/ศูนย์)
export const ratPowInt = (a: Rational, n: bigint): Rational => {
  if (n === 0n) return mkRational(1n, 1n);
  const neg = n < 0n;
  let e = neg ? -n : n;
  let resNum = 1n;
  let resDen = 1n;
  let baseNum = a.num;
  let baseDen = a.den;
  while (e > 0n) {
    if (e & 1n) {
      resNum *= baseNum;
      resDen *= baseDen;
    }
    baseNum *= baseNum;
    baseDen *= baseDen;
    e >>= 1n;
  }
  return neg ? mkRational(resDen, resNum) : mkRational(resNum, resDen);
};

export const ratEquals = (a: Rational, b: Rational): boolean =>
  a.num === b.num && a.den === b.den;

export const ratIsPositive = (a: Rational): boolean => a.num > 0n;

export const ratIsInteger = (a: Rational): boolean => a.den === 1n;

export const ratToNumber = (a: Rational): number => Number(a.num) / Number(a.den);

// แปลง Rational กลับเป็นโหนด AST (Int ถ้าเป็นจำนวนเต็ม ไม่งั้นเป็น Frac)
export const ratToExpr = (a: Rational): Expr => (a.den === 1n ? Int(a.num) : Frac(a.num, a.den));

// พยายามอ่านโหนด AST ที่เป็นค่าคงที่ (int/frac/neg ของ int/frac) เป็น Rational แบบ exact
// คืนค่า null ถ้านิพจน์ไม่ใช่ค่าคงที่แบบง่าย (เช่น มีตัวแปร)
export const exprToRational = (e: Expr): Rational | null => {
  switch (e.kind) {
    case 'int':
      return mkRational(e.value, 1n);
    case 'frac':
      return mkRational(e.num, e.den);
    case 'neg': {
      const inner = exprToRational(e.arg);
      return inner ? mkRational(-inner.num, inner.den) : null;
    }
    case 'add': {
      let acc: Rational | null = mkRational(0n, 1n);
      for (const t of e.terms) {
        const r = exprToRational(t);
        if (!r || !acc) return null;
        acc = ratAdd(acc, r);
      }
      return acc;
    }
    case 'mul': {
      let acc: Rational | null = mkRational(1n, 1n);
      for (const f of e.factors) {
        const r = exprToRational(f);
        if (!r || !acc) return null;
        acc = ratMul(acc, r);
      }
      return acc;
    }
    case 'div': {
      const n = exprToRational(e.num);
      const d = exprToRational(e.den);
      return n && d ? ratDiv(n, d) : null;
    }
    case 'pow': {
      const b = exprToRational(e.base);
      const ex = exprToRational(e.exp);
      if (!b || !ex || ex.den !== 1n) return null;
      return ratPowInt(b, ex.num);
    }
    default:
      return null;
  }
};

// หาจำนวนเต็ม k ที่ base^k = arg แบบ exact (log_base(arg) = k) ถ้ามี, ไม่งั้น null
// ค้นหาในช่วง k ที่สมเหตุสมผล (-64..64) เพียงพอสำหรับโจทย์ระดับมัธยม
export const exactRationalLog = (base: Rational, arg: Rational): bigint | null => {
  if (ratEquals(arg, mkRational(1n, 1n))) return 0n;
  if (ratEquals(base, arg)) return 1n;
  // ฐาน/อาร์กิวเมนต์ต้อง > 0 และฐาน != 1 (ตรวจก่อนเรียกฟังก์ชันนี้ในชั้น evaluate)
  for (let k = 1n; k <= 64n; k++) {
    if (ratEquals(ratPowInt(base, k), arg)) return k;
    if (ratEquals(ratPowInt(base, -k), arg)) return -k;
  }
  return null;
};

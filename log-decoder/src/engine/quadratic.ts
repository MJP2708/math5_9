// แก้สมการกำลังสอง a x^2 + b x + c = 0 แบบ exact เมื่อทำได้ (b^2-4ac เป็นกำลังสองสมบูรณ์ของตรรกยะ)
// ถ้าไม่ใช่ ใช้ Pow(., 1/2) แทนรูป √ อย่าง exact เชิงสัญลักษณ์ (ยังคงแม่นตรง ไม่ปัดเศษ)
import type { Expr } from './ast';
import { Add, Div, Neg, Pow } from './ast';
import { type Rational, mkRational, ratMul, ratSub, ratToExpr } from './rational';

const bigintSqrt = (n: bigint): bigint | null => {
  if (n < 0n) return null;
  if (n < 2n) return n;
  let x0 = n;
  let x1 = (x0 + 1n) / 2n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + n / x0) / 2n;
  }
  return x0 * x0 === n ? x0 : null;
};

// ถ้า r เป็นกำลังสองสมบูรณ์ของตรรกยะ (num, den ต่างเป็นกำลังสองสมบูรณ์) คืนค่ารากที่สอง exact
const exactSqrtRational = (r: Rational): Rational | null => {
  if (r.num < 0n) return null;
  const sn = bigintSqrt(r.num);
  const sd = bigintSqrt(r.den);
  if (sn === null || sd === null) return null;
  return mkRational(sn, sd);
};

export interface QuadraticRoot {
  exact: Expr;
}

// คืนราก 2 ตัว (root1 ใช้ +, root2 ใช้ -) ของ a x^2 + b x + c = 0
export const solveQuadratic = (a: Rational, b: Rational, c: Rational): QuadraticRoot[] | 'no-real-root' => {
  const disc = ratSub(ratMul(b, b), ratMul(mkRational(4n, 1n), ratMul(a, c)));
  if (disc.num < 0n) return 'no-real-root';
  const exactSqrt = exactSqrtRational(disc);
  // หมายเหตุ: ถ้า disc ไม่ใช่กำลังสองสมบูรณ์ ใช้ Pow(disc, 1/2) แทน √disc แบบ exact เชิงสัญลักษณ์
  const sqrtNode: Expr = exactSqrt
    ? ratToExpr(exactSqrt)
    : Pow(ratToExpr(disc), ratToExpr(mkRational(1n, 2n)));
  const negB = ratToExpr(mkRational(-b.num, b.den));
  const twoA = ratToExpr(ratMul(mkRational(2n, 1n), a));
  const root1 = Div(Add(negB, sqrtNode), twoA);
  const root2 = Div(Add(negB, Neg(sqrtNode)), twoA);
  return [{ exact: root1 }, { exact: root2 }];
};

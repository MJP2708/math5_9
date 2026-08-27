// แก้สมการลอการิทึม/เลขชี้กำลัง: รวบรวม log ทุกตัวในสมการ ใช้สมบัติผลคูณ/ผลหารรวมเป็น log เดียว
// แล้วยกกำลังทั้งสองข้าง หรือถ้าเป็นสมการเลขชี้กำลัง ใช้ log ทั้งสองข้างเพื่อดึงตัวแปรลงมา
// จากนั้นตรวจคำตอบทุกตัวกลับกับเงื่อนไขโดเมน (ตัดคำตอบแปลกปลอมทิ้ง)

import type { Equation, Expr } from './ast';
import { Add, Div, Int, Ln, Log, Mul, Neg, Var } from './ast';
import { collectDomainConditions } from './domain-collect';
import { Decimal, evaluateExpr } from './evaluate';
import { linearCoeffs, multiplyLinearFactors } from './linear';
import { exprToLatex } from './latex';
import { solveQuadratic } from './quadratic';
import { exprToRational, mkRational, ratEquals, ratPowInt, ratSub, ratToExpr, type Rational } from './rational';
import type { CandidateRoot, Derivation, Step } from './steps';
import { type AppError, type Result, err, ok } from './errors';

const VAR = 'x';

let stepCounter = 0;
const nextStepId = () => `eq-step-${stepCounter++}`;

const mkStep = (before: Equation, after: Equation, property: Step['property'], explanationTh: string): Step => ({
  id: nextStepId(),
  before,
  after,
  property,
  explanationTh,
  whyTh: explanationTh,
});

// เก็บพจน์ log ที่พบทั้งหมด (พร้อมเครื่องหมาย) และพจน์ค่าคงที่ที่เหลือ จากสมการ left = right
interface FlatTerm {
  sign: 1 | -1;
  isLog: boolean;
  base?: Expr; // undefined หมายถึง ln (ฐาน e)
  arg?: Expr;
  constExpr?: Expr;
}

const flatten = (e: Expr, sign: 1 | -1, out: FlatTerm[]): boolean => {
  if (e.kind === 'add') {
    return e.terms.every((t) => flatten(t, sign, out));
  }
  if (e.kind === 'neg') {
    return flatten(e.arg, sign === 1 ? -1 : 1, out);
  }
  if (e.kind === 'log') {
    out.push({ sign, isLog: true, base: e.base, arg: e.arg });
    return true;
  }
  if (e.kind === 'ln') {
    out.push({ sign, isLog: true, base: undefined, arg: e.arg });
    return true;
  }
  out.push({ sign, isLog: false, constExpr: e });
  return true;
};

// ---------- โจทย์สมการลอการิทึม ----------
const trySolveLogarithmic = (eq: Equation, domain: ReturnType<typeof collectDomainConditions>): Result<Derivation> | null => {
  const terms: FlatTerm[] = [];
  const okLeft = flatten(eq.left, 1, terms);
  const okRight = flatten(eq.right, -1, terms);
  if (!okLeft || !okRight) return null;

  const logTerms = terms.filter((t) => t.isLog);
  if (logTerms.length === 0) return null; // ไม่ใช่สมการ log ให้ไปลองแบบเลขชี้กำลังต่อ

  // ทุก log ต้องฐานเดียวกัน (numeric เดียวกัน หรือทั้งหมดเป็น ln)
  const first = logTerms[0];
  const sameBase = logTerms.every((t) => {
    if (first.base === undefined) return t.base === undefined;
    if (t.base === undefined) return false;
    const a = exprToRational(first.base);
    const b = exprToRational(t.base);
    return a && b && ratEquals(a, b);
  });
  if (!sameBase) {
    return err({ code: 'unsupported-expression', messageTh: 'สมการนี้มี log หลายฐานที่ไม่เท่ากัน ยังไม่รองรับการแก้อัตโนมัติ' });
  }

  // พจน์ที่ไม่ใช่ log ต้องไม่มีตัวแปร x (ไม่รองรับสมการผสม เช่น log_2(x) + x = 3)
  const constTerms = terms.filter((t) => !t.isLog);
  let constSum: Rational = mkRational(0n, 1n);
  for (const t of constTerms) {
    const r = exprToRational(t.constExpr!);
    if (!r) {
      return err({
        code: 'unsupported-expression',
        messageTh: 'สมการนี้มีพจน์ที่ไม่ใช่ log และมีตัวแปรปนอยู่ ยังไม่รองรับการแก้อัตโนมัติ',
      });
    }
    constSum = t.sign === 1 ? { num: constSum.num * r.den + r.num * constSum.den, den: constSum.den * r.den } : constSum;
    constSum = t.sign === 1
      ? constSum
      : (() => {
          const neg = { num: -r.num, den: r.den };
          return { num: constSum.num * neg.den + neg.num * constSum.den, den: constSum.den * neg.den };
        })();
  }
  // ทำให้ constSum ลดรูป (ผ่าน mkRational)
  constSum = mkRational(constSum.num, constSum.den);

  const numeratorArgs = logTerms.filter((t) => t.sign === 1).map((t) => t.arg!);
  const denominatorArgs = logTerms.filter((t) => t.sign === -1).map((t) => t.arg!);

  const baseExpr: Expr = first.base ?? Var('e');

  // ---- ขั้นตอนที่ 1: รวม log ด้วยสมบัติผลคูณ/ผลหาร ----
  let combinedArg: Expr;
  if (denominatorArgs.length === 0) {
    combinedArg = numeratorArgs.length === 1 ? numeratorArgs[0] : Mul(...numeratorArgs);
  } else {
    const numExpr = numeratorArgs.length === 0 ? Int(1) : numeratorArgs.length === 1 ? numeratorArgs[0] : Mul(...numeratorArgs);
    const denExpr = denominatorArgs.length === 1 ? denominatorArgs[0] : Mul(...denominatorArgs);
    combinedArg = Div(numExpr, denExpr);
  }
  const combinedLogNode = first.base ? Log(baseExpr, combinedArg) : Ln(combinedArg);
  const rhsConstExpr: Expr = ratToExpr(mkRational(-constSum.num, constSum.den));

  const steps: Step[] = [];
  steps.push(
    mkStep(
      eq,
      { left: combinedLogNode, right: rhsConstExpr },
      denominatorArgs.length > 0 ? 'quotient-rule' : 'product-rule',
      `รวม log ทุกพจน์ที่มีฐานเดียวกัน ด้วยสมบัติผลคูณ/ผลหาร ให้เหลือ log เดียว: ${exprToLatex(combinedLogNode)} = ${exprToLatex(rhsConstExpr)}`,
    ),
  );

  // ---- ขั้นตอนที่ 2: ยกกำลังทั้งสองข้างเพื่อกำจัด log ----
  const rhsRational = exprToRational(rhsConstExpr);
  const baseRational = first.base ? exprToRational(first.base) : null;
  if (!rhsRational) {
    return err({ code: 'unsupported-expression', messageTh: 'ค่าคงที่ด้านขวาของสมการซับซ้อนเกินกว่าจะแก้แบบ exact ได้' });
  }

  let rhsPowExpr: Expr;
  if (first.base && baseRational && rhsRational.den === 1n) {
    rhsPowExpr = ratToExpr(ratPowInt(baseRational, rhsRational.num));
  } else if (!first.base) {
    // ln: exp(rhsConst) — แทนด้วยทศนิยม เพราะ e^k ไม่ใช่ตรรกยะ (ยกเว้น k=0)
    const dec = evaluateExpr(rhsConstExpr, {});
    if (!dec.ok) return dec;
    rhsPowExpr = rhsRational.num === 0n ? Int(1) : { kind: 'int', value: BigInt(Math.round(Decimal.exp(dec.value).toNumber())) };
  } else {
    return err({ code: 'unsupported-expression', messageTh: 'เลขชี้กำลังไม่ใช่จำนวนเต็ม ยังไม่รองรับในการยกกำลังแบบ exact' });
  }

  const polyEquation: Equation = { left: combinedArg, right: rhsPowExpr };
  steps.push(
    mkStep(
      { left: combinedLogNode, right: rhsConstExpr },
      polyEquation,
      'exponentiate-both-sides',
      `ยกกำลังฐาน ${first.base ? exprToLatex(baseExpr) : 'e'} ทั้งสองข้าง เพื่อกำจัด log: ${exprToLatex(combinedArg)} = ${exprToLatex(rhsPowExpr)}`,
    ),
  );

  // ---- ขั้นตอนที่ 3: แก้พหุนามที่ได้ (เชิงเส้น หรือกำลังสองจากผลคูณสองพจน์) ----
  const numFactorsForPoly = combinedArg.kind === 'div' ? [combinedArg.num] : combinedArg.kind === 'mul' ? combinedArg.factors : [combinedArg];
  const denFactorsForPoly = combinedArg.kind === 'div' ? (combinedArg.den.kind === 'mul' ? combinedArg.den.factors : [combinedArg.den]) : [];

  const numPoly = multiplyLinearFactors(numFactorsForPoly, VAR);
  const denPoly = denFactorsForPoly.length > 0 ? multiplyLinearFactors(denFactorsForPoly, VAR) : [mkRational(1n, 1n)];
  const rhsPolyVal = exprToRational(rhsPowExpr);
  if (!numPoly || !denPoly || !rhsPolyVal) {
    return err({ code: 'unsupported-expression', messageTh: 'รูปแบบสมการซับซ้อนเกินกว่า solver ปัจจุบันจะแก้ได้ (รองรับพหุนามดีกรีไม่เกิน 2)' });
  }
  // numPoly(x) - rhsPolyVal * denPoly(x) = 0
  const rhsScaledDen = denPoly.map((c) => ({ num: c.num * rhsPolyVal.num, den: c.den * rhsPolyVal.den }));
  const maxLen = Math.max(numPoly.length, rhsScaledDen.length);
  const finalPoly: Rational[] = [];
  for (let i = 0; i < maxLen; i++) {
    const a = numPoly[i] ?? mkRational(0n, 1n);
    const b = rhsScaledDen[i] ?? mkRational(0n, 1n);
    finalPoly.push(ratSub(mkRational(a.num, a.den), mkRational(b.num, b.den)));
  }
  while (finalPoly.length > 1 && finalPoly[finalPoly.length - 1].num === 0n) finalPoly.pop();

  let candidateXs: Expr[] = [];
  if (finalPoly.length === 1) {
    if (finalPoly[0].num === 0n) {
      return err({ code: 'no-solution', messageTh: 'สมการนี้เป็นจริงสำหรับทุกค่า x ในโดเมน (ไม่สามารถระบุคำตอบเดี่ยวได้)' });
    }
    return err({ code: 'no-solution', messageTh: 'สมการนี้ไม่มีคำตอบ' });
  } else if (finalPoly.length === 2) {
    const [c0, c1] = finalPoly;
    // c1 x + c0 = 0
    const x = { num: -c0.num * c1.den, den: c0.den * c1.num };
    candidateXs = [ratToExpr(mkRational(x.num, x.den))];
  } else if (finalPoly.length === 3) {
    const [c0, c1, c2] = finalPoly;
    const roots = solveQuadratic(c2, c1, c0);
    if (roots === 'no-real-root') {
      return err({ code: 'no-solution', messageTh: 'สมการนี้ไม่มีคำตอบจริง (discriminant ติดลบ)' });
    }
    candidateXs = roots.map((r) => r.exact);
  } else {
    return err({ code: 'unsupported-expression', messageTh: 'สมการมีดีกรีสูงเกินกว่า solver ปัจจุบันจะแก้ได้' });
  }

  steps.push(
    mkStep(
      polyEquation,
      { left: Var(VAR), right: candidateXs.length === 1 ? candidateXs[0] : Add(...candidateXs) },
      finalPoly.length === 3 ? 'quadratic-formula' : 'isolate-term',
      finalPoly.length === 3
        ? 'แก้สมการกำลังสองที่ได้ด้วยสูตร x = (-b ± √(b²-4ac)) / 2a'
        : 'จัดสมการแยกตัวแปร x ออกมาข้างเดียว',
    ),
  );

  // ---- ขั้นตอนที่ 4: ตรวจคำตอบแปลกปลอม ----
  const candidateRoots: CandidateRoot[] = candidateXs.map((xExpr) => {
    const decRes = evaluateExpr(xExpr, {});
    const decimal = decRes.ok ? decRes.value.toNumber() : NaN;
    const checks = domain.map((cond) => {
      const val = evaluateExpr(cond.subject, { [VAR]: new Decimal(Number.isFinite(decimal) ? decimal : 0) });
      let satisfied = false;
      let evaluatedValueTh = 'ประเมินค่าไม่ได้';
      if (val.ok) {
        if (cond.kind === 'arg-positive') {
          satisfied = val.value.gt(0);
          evaluatedValueTh = `${exprToLatex(cond.subject)} = ${val.value.toDecimalPlaces(4).toString()}`;
        } else if (cond.kind === 'base-positive-ne-one') {
          satisfied = val.value.gt(0) && !val.value.eq(1);
          evaluatedValueTh = `${exprToLatex(cond.subject)} = ${val.value.toDecimalPlaces(4).toString()}`;
        } else {
          satisfied = true;
        }
      }
      return { condition: cond, satisfied, evaluatedValueTh };
    });
    const isValid = checks.every((c) => c.satisfied);
    const failedCheck = checks.find((c) => !c.satisfied);
    return {
      exact: xExpr,
      decimal,
      domainChecks: checks,
      isValid,
      rejectionReasonTh: isValid
        ? undefined
        : `x = ${exprToLatex(xExpr)} ถูกตัดทิ้ง เพราะ ${failedCheck ? failedCheck.evaluatedValueTh : 'ไม่ผ่านเงื่อนไขโดเมน'} ไม่เป็นไปตามเงื่อนไข ${failedCheck?.condition.descriptionTh}`,
    };
  });

  if (candidateRoots.every((r) => !r.isValid)) {
    return err({ code: 'all-roots-extraneous', messageTh: 'ทุกคำตอบที่หาได้เป็นคำตอบแปลกปลอมทั้งหมด (ไม่มีคำตอบที่สมเหตุสมผล)' });
  }

  return ok({ domain, steps, candidateRoots });
};

// ---------- โจทย์สมการเลขชี้กำลัง ----------
interface ExpForm {
  a: Rational; // สัมประสิทธิ์หน้า x ในเลขชี้กำลัง
  b: Rational; // ค่าคงที่ในเลขชี้กำลัง
  base: Expr; // ฐาน (ค่าคงที่)
  baseRational: Rational;
}

const toExpForm = (e: Expr): ExpForm | null => {
  if (e.kind === 'pow') {
    const baseR = exprToRational(e.base);
    const lin = linearCoeffs(e.exp, VAR);
    if (baseR && lin && baseR.num > 0n) return { a: lin.a, b: lin.b, base: e.base, baseRational: baseR };
    return null;
  }
  const r = exprToRational(e);
  if (r && r.num > 0n) return { a: mkRational(0n, 1n), b: mkRational(1n, 1n), base: e, baseRational: r };
  return null;
};

const trySolveExponential = (eq: Equation, domain: ReturnType<typeof collectDomainConditions>): Result<Derivation> | null => {
  const L = toExpForm(eq.left);
  const R = toExpForm(eq.right);
  if (!L || !R) return null;
  if (L.a.num === 0n && R.a.num === 0n) return null; // ไม่มี x เลย ไม่ใช่สมการที่ต้องแก้

  const steps: Step[] = [];
  const lnLNode = Ln(L.base);
  const lnRNode = Ln(R.base);
  const afterLogEq: Equation = {
    left: Mul(ratToExpr(L.a) as Expr, Var(VAR)),
    right: Int(0),
  };
  steps.push(
    mkStep(
      eq,
      { left: Mul(Add(Mul(ratToExpr(L.a), Var(VAR)), ratToExpr(L.b)), lnLNode), right: Mul(Add(Mul(ratToExpr(R.a), Var(VAR)), ratToExpr(R.b)), lnRNode) },
      'take-log-both-sides',
      `ใส่ ln ทั้งสองข้าง เพื่อดึงตัวแปร x จากเลขชี้กำลังลงมา: (${exprToLatex(eq.left)}) \\to ${exprToLatex(lnLNode)}, (${exprToLatex(eq.right)}) \\to ${exprToLatex(lnRNode)}`,
    ),
  );
  void afterLogEq;

  // x*(a1 ln(base1) - a2 ln(base2)) = b2 ln(base2) - b1 ln(base1)
  const coeffExpr = Add(Mul(ratToExpr(L.a), lnLNode), Neg(Mul(ratToExpr(R.a), lnRNode)));
  const constExpr = Add(Mul(ratToExpr(R.b), lnRNode), Neg(Mul(ratToExpr(L.b), lnLNode)));

  const coeffVal = evaluateExpr(coeffExpr, {});
  if (!coeffVal.ok) return coeffVal;
  if (coeffVal.value.abs().lt(1e-12)) {
    return err({ code: 'no-solution', messageTh: 'สมการนี้ไม่มีคำตอบ หรือเป็นจริงสำหรับทุกค่า x (สัมประสิทธิ์ของ x กลายเป็นศูนย์)' });
  }

  const xExactRaw: Expr = Div(constExpr, coeffExpr);
  steps.push(
    mkStep(
      { left: Mul(ratToExpr(L.a), lnLNode), right: Mul(ratToExpr(R.a), lnRNode) },
      { left: Var(VAR), right: xExactRaw },
      'isolate-term',
      `จัดรูปแยก x ออกมา: x = ${exprToLatex(xExactRaw)}`,
    ),
  );

  const decRes = evaluateExpr(xExactRaw, {});
  if (!decRes.ok) return decRes;
  const decimalValue = decRes.value;

  // ลองหาค่า "สวย" (จำนวนเต็ม/เศษส่วนง่ายๆ) ที่ตรงกับสมการเดิม เพื่อแสดงคำตอบแบบ exact ที่อ่านง่ายกว่า
  let niceExpr: Expr | null = null;
  const candidates: Rational[] = [];
  for (let i = -20; i <= 20; i++) candidates.push(mkRational(BigInt(i), 1n));
  for (let den = 2n; den <= 6n; den++) {
    for (let num = -40n; num <= 40n; num++) candidates.push(mkRational(num, den));
  }
  for (const cand of candidates) {
    const candDec = new Decimal(cand.num.toString()).div(cand.den.toString());
    if (candDec.sub(decimalValue).abs().lt(new Decimal('1e-8'))) {
      const lVal = evaluateExpr(eq.left, { [VAR]: candDec });
      const rVal = evaluateExpr(eq.right, { [VAR]: candDec });
      if (lVal.ok && rVal.ok && lVal.value.sub(rVal.value).abs().lt(new Decimal('1e-6'))) {
        niceExpr = ratToExpr(cand);
        break;
      }
    }
  }

  const finalExact = niceExpr ?? xExactRaw;
  const candidateRoots: CandidateRoot[] = [
    {
      exact: finalExact,
      decimal: decimalValue.toNumber(),
      domainChecks: [],
      isValid: true,
    },
  ];

  return ok({ domain, steps, candidateRoots });
};

export const solveEquation = (eq: Equation): Result<Derivation> => {
  const domain = [...collectDomainConditions(eq.left), ...collectDomainConditions(eq.right)];
  stepCounter = 0;

  const logResult = trySolveLogarithmic(eq, domain);
  if (logResult) return logResult;

  const expResult = trySolveExponential(eq, domain);
  if (expResult) return expResult;

  return err({
    code: 'unsupported-expression',
    messageTh: 'ยังไม่รองรับการแก้สมการรูปแบบนี้โดยอัตโนมัติ ลองเขียนในรูป log_b(x) หรือ b^x = c',
  });
};

export const _err: AppError | undefined = undefined;

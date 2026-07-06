import Decimal from "decimal.js";

Decimal.set({ precision: 50 });

export interface ComputationStep {
  label: string;
  latex: string;
}

export type RationalExponentError =
  | { kind: "invalid-input"; message: string }
  | { kind: "zero-denominator"; message: string }
  | { kind: "even-root-of-negative"; message: string; n: number }
  | { kind: "zero-negative-exponent"; message: string }
  | { kind: "indeterminate"; message: string };

export interface RationalExponentSuccess {
  kind: "value";
  simplifiedM: number;
  simplifiedN: number;
  wasSimplified: boolean;
  isExact: boolean;
  isHuge: boolean;
  exactFractionLatex?: string;
  displayLatex: string;
  numericValue: number;
  steps: ComputationStep[];
}

export type RationalExponentResult = RationalExponentSuccess | RationalExponentError;

const HUGE_THRESHOLD = new Decimal("1e15");
const TINY_THRESHOLD = new Decimal("1e-12");

function gcdInt(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function gcdBig(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1n;
}

/** Largest integer r with r^n <= x (x, n non-negative), plus whether it's an exact n-th root. */
function bigintNthRoot(x: bigint, n: bigint): { root: bigint; exact: boolean } {
  if (x === 0n) return { root: 0n, exact: true };
  if (n === 1n) return { root: x, exact: true };
  let low = 0n;
  let high = 1n;
  while (high ** n <= x) high *= 2n;
  while (low + 1n < high) {
    const mid = (low + high) / 2n;
    if (mid ** n <= x) low = mid;
    else high = mid;
  }
  return { root: low, exact: low ** n === x };
}

/** True if the reduced fraction num/den terminates in base 10 (denominator's only prime factors are 2 and 5). */
function isTerminatingDecimal(den: bigint): boolean {
  let d = den < 0n ? -den : den;
  while (d % 2n === 0n) d /= 2n;
  while (d % 5n === 0n) d /= 5n;
  return d === 1n;
}

function formatDecimalFromFraction(num: bigint, den: bigint, sigDigits: number): string {
  const value = new Decimal(num.toString()).div(new Decimal(den.toString()));
  return value.toSignificantDigits(sigDigits).toString();
}

interface BuildArgs {
  simplifiedM: number;
  simplifiedN: number;
  wasSimplified: boolean;
  steps: ComputationStep[];
  exactNum: bigint;
  exactDen: bigint;
}

function buildExactSuccess(args: BuildArgs): RationalExponentSuccess {
  const { simplifiedM, simplifiedN, wasSimplified, steps, exactNum, exactDen } = args;
  const g = gcdBig(exactNum, exactDen);
  const num = exactNum / g;
  const den = exactDen / g;

  const terminating = isTerminatingDecimal(den);
  let displayLatex: string;
  let exactFractionLatex: string | undefined;
  let numericValue: number;
  let isHuge = false;

  if (den === 1n) {
    const abs = num < 0n ? -num : num;
    isHuge = abs > BigInt("1000000000000000");
    displayLatex = `= ${num.toString()}`;
    numericValue = Number(num);
  } else {
    exactFractionLatex = `\\frac{${num.toString()}}{${den.toString()}}`;
    if (terminating) {
      const decStr = formatDecimalFromFraction(num, den, 20);
      displayLatex = `= ${exactFractionLatex} = ${decStr}`;
      numericValue = Number(decStr);
    } else {
      const decStr = formatDecimalFromFraction(num, den, 12);
      displayLatex = `= ${exactFractionLatex} \\approx ${decStr}`;
      numericValue = Number(decStr);
    }
  }

  steps.push({ label: "ผลลัพธ์ (ค่าที่แท้จริง)", latex: displayLatex.replace(/^= /, "") });

  return {
    kind: "value",
    simplifiedM,
    simplifiedN,
    wasSimplified,
    isExact: true,
    isHuge,
    exactFractionLatex,
    displayLatex,
    numericValue,
    steps,
  };
}

/**
 * Computes a^(m/n) following the definition:
 *   a^(m/n) = (n-th root of a)^m = n-th root(a^m), for the reduced fraction m/n.
 * Root is taken before the power (n-th root first) so intermediate magnitudes stay small.
 * Exact perfect-power results (e.g. 8^(2/3) = 4) are detected with BigInt arithmetic so they
 * never degrade to floating-point artifacts like 3.9999999999996.
 */
export function computeRationalExponent(
  aInput: number | string,
  mInput: number,
  nInput: number
): RationalExponentResult {
  if (!Number.isInteger(mInput) || !Number.isInteger(nInput)) {
    return {
      kind: "invalid-input",
      message: "ตัวเศษ (m) และตัวส่วน (n) ของเลขชี้กำลังต้องเป็นจำนวนเต็มเท่านั้น",
    };
  }
  if (nInput === 0) {
    return {
      kind: "zero-denominator",
      message: "ตัวส่วนของเลขชี้กำลัง (n) เป็น 0 ไม่ได้ เพราะการหารากที่ 0 ไม่มีนิยาม",
    };
  }

  let m = mInput;
  let n = nInput;
  if (n < 0) {
    m = -m;
    n = -n;
  }

  const g = gcdInt(m, n);
  const simplifiedM = m / g;
  const simplifiedN = n / g;
  const wasSimplified = g > 1;

  let aDecimal: Decimal;
  try {
    aDecimal = new Decimal(aInput);
    if (!aDecimal.isFinite()) throw new Error("not finite");
  } catch {
    return { kind: "invalid-input", message: "ค่าฐาน (a) ไม่ถูกต้อง" };
  }

  const steps: ComputationStep[] = [
    {
      label: "โจทย์ตั้งต้น",
      latex: `${aDecimal.toString()}^{\\frac{${m}}{${n}}}`,
    },
  ];

  if (wasSimplified) {
    steps.push({
      label: "ลดรูปเศษส่วนของเลขชี้กำลังให้เป็นเศษส่วนอย่างต่ำก่อนคำนวณ",
      latex: `\\frac{${m}}{${n}} = \\frac{${simplifiedM}}{${simplifiedN}}`,
    });
  }

  if (aDecimal.isZero()) {
    if (simplifiedM > 0) {
      steps.push({
        label: "ฐานเป็น 0 และเลขชี้กำลังเป็นบวก จึงได้ผลลัพธ์เป็น 0",
        latex: `0^{\\frac{${simplifiedM}}{${simplifiedN}}} = 0`,
      });
      return buildExactSuccess({ simplifiedM, simplifiedN, wasSimplified, steps, exactNum: 0n, exactDen: 1n });
    }
    if (simplifiedM === 0) {
      return {
        kind: "indeterminate",
        message: "0^0 เป็นรูปแบบไม่กำหนด (indeterminate form) ทางคณิตศาสตร์ไม่สามารถระบุค่าที่แน่นอนให้ได้",
      };
    }
    return {
      kind: "zero-negative-exponent",
      message: "ฐานเป็น 0 และเลขชี้กำลังเป็นลบ ซึ่งเทียบเท่ากับการหารด้วย 0 จึงไม่มีนิยาม",
    };
  }

  const isNegativeBase = aDecimal.isNegative();
  if (isNegativeBase && simplifiedN % 2 === 0) {
    return {
      kind: "even-root-of-negative",
      n: simplifiedN,
      message: `ฐานเป็นจำนวนลบ (a = ${aDecimal.toString()}) และตัวส่วนของเลขชี้กำลังเป็นเลขคู่ (n = ${simplifiedN}) ทำให้ต้องหารากที่คู่ของจำนวนลบ ซึ่งไม่มีนิยามในจำนวนจริง`,
    };
  }

  const absM = Math.abs(simplifiedM);

  // n = 1: no root involved, exponent is a plain integer -> always exact.
  if (simplifiedN === 1) {
    const [numAbsDec, denAbsDec] = aDecimal.abs().toFraction();
    const numAbs = BigInt(numAbsDec.toFixed(0));
    const denAbs = BigInt(denAbsDec.toFixed(0));
    let num = numAbs ** BigInt(absM);
    let den = denAbs ** BigInt(absM);
    if (isNegativeBase && absM % 2 === 1) num = -num;
    if (simplifiedM < 0) {
      [num, den] = [den, num];
      if (den < 0n) {
        num = -num;
        den = -den;
      }
    }
    steps.push({
      label: "เลขชี้กำลังเป็นจำนวนเต็ม จึงคำนวณได้โดยตรงโดยไม่ต้องถอดราก",
      latex: `${aDecimal.toString()}^{${simplifiedM}}`,
    });
    return buildExactSuccess({ simplifiedM, simplifiedN, wasSimplified, steps, exactNum: num, exactDen: den });
  }

  // Try exact perfect-root detection via BigInt (bounded so it stays fast).
  const EXACT_SAFE = absM <= 60 && simplifiedN <= 60;
  if (EXACT_SAFE) {
    const [numAbsDec, denAbsDec] = aDecimal.abs().toFraction();
    const numAbs = BigInt(numAbsDec.toFixed(0));
    const denAbs = BigInt(denAbsDec.toFixed(0));
    const { root: rootNum, exact: exactNumRoot } = bigintNthRoot(numAbs, BigInt(simplifiedN));
    const { root: rootDen, exact: exactDenRoot } = bigintNthRoot(denAbs, BigInt(simplifiedN));

    if (exactNumRoot && exactDenRoot) {
      const rootLatex = rootDen === 1n ? rootNum.toString() : `\\frac{${rootNum}}{${rootDen}}`;
      steps.push({
        label: `ถอดรากที่ ${simplifiedN} ของฐาน a = ${aDecimal.toString()}`,
        latex: `\\sqrt[${simplifiedN}]{${aDecimal.abs().toString()}} = ${rootLatex}`,
      });
      let num = rootNum ** BigInt(absM);
      let den = rootDen ** BigInt(absM);
      if (isNegativeBase && absM % 2 === 1) num = -num;
      if (simplifiedM < 0) {
        [num, den] = [den, num];
        if (den < 0n) {
          num = -num;
          den = -den;
        }
      }
      steps.push({
        label: `ยกกำลัง ${simplifiedM} ของค่ารากที่ได้`,
        latex: `\\left(${isNegativeBase ? `-${rootLatex}` : rootLatex}\\right)^{${simplifiedM}}`,
      });
      return buildExactSuccess({ simplifiedM, simplifiedN, wasSimplified, steps, exactNum: num, exactDen: den });
    }
  }

  // Fallback: no exact perfect root — use high-precision Decimal arithmetic, clearly marked as approximate.
  const baseAbs = aDecimal.abs();
  let rootApprox: Decimal;
  try {
    rootApprox = baseAbs.pow(new Decimal(1).div(simplifiedN));
  } catch {
    return { kind: "invalid-input", message: "ไม่สามารถคำนวณค่านี้ได้" };
  }
  const signedRoot = isNegativeBase ? rootApprox.neg() : rootApprox;
  steps.push({
    label: `ถอดรากที่ ${simplifiedN} ของฐาน a = ${aDecimal.toString()} (เป็นจำนวนอตรรกยะ แสดงค่าประมาณ)`,
    latex: `\\sqrt[${simplifiedN}]{${aDecimal.toString()}} \\approx ${rootApprox.toSignificantDigits(10).toString()}`,
  });

  let approxValue: Decimal;
  try {
    approxValue = signedRoot.pow(simplifiedM);
  } catch {
    return { kind: "invalid-input", message: "ไม่สามารถคำนวณค่านี้ได้" };
  }

  if (!approxValue.isFinite()) {
    return { kind: "invalid-input", message: "ผลลัพธ์มีขนาดใหญ่เกินกว่าจะคำนวณได้" };
  }

  const isHuge = approxValue.abs().gte(HUGE_THRESHOLD) || (!approxValue.isZero() && approxValue.abs().lte(TINY_THRESHOLD));
  const displayStr = isHuge
    ? approxValue.toExponential(6)
    : approxValue.toSignificantDigits(10).toString();

  steps.push({
    label: `ยกกำลัง ${simplifiedM} ของค่ารากที่ได้ (ผลลัพธ์เป็นค่าประมาณ)`,
    latex: `\\approx ${displayStr}`,
  });

  return {
    kind: "value",
    simplifiedM,
    simplifiedN,
    wasSimplified,
    isExact: false,
    isHuge,
    displayLatex: `\\approx ${displayStr}`,
    numericValue: approxValue.toNumber(),
    steps,
  };
}

/**
 * Fast float evaluator for sampling f(x) = x^(m/n) across many points for the graph.
 * Returns NaN for any x where the value is undefined in the reals (Plotly renders NaN as a gap).
 */
export function evaluateFloatForGraph(x: number, mInput: number, nInput: number): number {
  if (!Number.isInteger(mInput) || !Number.isInteger(nInput) || nInput === 0) return NaN;

  let m = mInput;
  let n = nInput;
  if (n < 0) {
    m = -m;
    n = -n;
  }
  const g = gcdInt(m, n);
  m = m / g;
  n = n / g;

  if (x === 0) {
    if (m > 0) return 0;
    return NaN;
  }
  if (x < 0 && n % 2 === 0) return NaN;

  const sign = x < 0 ? -1 : 1;
  const root = sign * Math.pow(Math.abs(x), 1 / n);
  return Math.pow(root, m);
}

export function simplifyFraction(m: number, n: number): { m: number; n: number } {
  if (n < 0) {
    m = -m;
    n = -n;
  }
  const g = gcdInt(m, n);
  return { m: m / g, n: n / g };
}

// ระดับความเข้มเสียง: β = 10 log10(I/I0), I0 = 1e-12 W/m^2
import Decimal from 'decimal.js';
import { type Result, err, ok } from '../engine/errors';
import type { CompareResult, ScaleResult } from './types';

export const I0 = new Decimal('1e-12');

export const decibelFromIntensity = (I: number): Result<ScaleResult> => {
  if (!Number.isFinite(I) || I <= 0) {
    return err({ code: 'physically-impossible', messageTh: 'ความเข้มเสียง I ต้องมากกว่า 0 W/m² (เป็นไปไม่ได้ในทางฟิสิกส์)' });
  }
  const ratio = new Decimal(I).div(I0);
  const beta = new Decimal(10).times(ratio.log(10));
  return ok({
    value: beta.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'β = 10·log₁₀(I / I₀), I₀ = 10⁻¹² W/m²' },
      { labelTh: 'แทนค่า', detailTh: `β = 10·log₁₀(${I} / 10⁻¹²) = 10·log₁₀(${ratio.toExponential(4)})` },
      { labelTh: 'คำนวณ', detailTh: `β ≈ ${beta.toDecimalPlaces(4).toString()} dB` },
    ],
  });
};

export const intensityFromDecibel = (beta: number): Result<ScaleResult> => {
  if (!Number.isFinite(beta)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่าระดับเสียง β ต้องเป็นตัวเลข', argument: String(beta) });
  }
  const I = I0.times(new Decimal(10).pow(new Decimal(beta).div(10)));
  return ok({
    value: I.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'I = I₀ · 10^(β/10)' },
      { labelTh: 'แทนค่า', detailTh: `I = 10⁻¹² · 10^(${beta}/10) ≈ ${I.toExponential(4)} W/m²` },
    ],
  });
};

export const compareIntensity = (b1: number, b2: number): Result<CompareResult> => {
  if (!Number.isFinite(b1) || !Number.isFinite(b2)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่าระดับเสียงต้องเป็นตัวเลขทั้งสองค่า', argument: `${b1}, ${b2}` });
  }
  const deltaExp = new Decimal(b1 - b2).div(10);
  const ratio = new Decimal(10).pow(deltaExp);
  return ok({
    ratio: ratio.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'I₁/I₂ = 10^((β₁-β₂)/10)' },
      { labelTh: 'แทนค่า', detailTh: `I₁/I₂ = 10^((${b1}-${b2})/10) = 10^${deltaExp.toDecimalPlaces(4).toString()}` },
      { labelTh: 'คำนวณ', detailTh: `I₁/I₂ ≈ ${ratio.toDecimalPlaces(2).toString()} เท่า` },
    ],
    summaryTh: `เสียงระดับ ${b1} dB มีความเข้มมากกว่าระดับ ${b2} dB ประมาณ ${ratio.toDecimalPlaces(2).toString()} เท่า`,
  });
};

// ค่า pH: pH = -log10[H+], [H+] = 10^(-pH), pH + pOH = 14
import Decimal from 'decimal.js';
import { type Result, err, ok } from '../engine/errors';
import type { CompareResult, ScaleResult } from './types';

export const phFromHPlus = (hPlus: number): Result<ScaleResult> => {
  if (!Number.isFinite(hPlus) || hPlus <= 0) {
    return err({ code: 'physically-impossible', messageTh: 'ความเข้มข้น [H⁺] ต้องมากกว่า 0 mol/L' });
  }
  const pH = new Decimal(hPlus).log(10).neg();
  const pOH = new Decimal(14).minus(pH);
  return ok({
    value: pH.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'pH = -log₁₀[H⁺]' },
      { labelTh: 'แทนค่า', detailTh: `pH = -log₁₀(${hPlus}) = ${pH.toDecimalPlaces(4).toString()}` },
      { labelTh: 'pOH', detailTh: `pOH = 14 - pH = ${pOH.toDecimalPlaces(4).toString()}` },
    ],
  });
};

export const hPlusFromPH = (pH: number): Result<ScaleResult> => {
  if (!Number.isFinite(pH)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่า pH ต้องเป็นตัวเลข', argument: String(pH) });
  }
  const hPlus = new Decimal(10).pow(new Decimal(pH).neg());
  return ok({
    value: hPlus.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: '[H⁺] = 10^(-pH)' },
      { labelTh: 'แทนค่า', detailTh: `[H⁺] = 10^(-${pH}) ≈ ${hPlus.toExponential(4)} mol/L` },
    ],
  });
};

export const compareAcidity = (ph1: number, ph2: number): Result<CompareResult> => {
  if (!Number.isFinite(ph1) || !Number.isFinite(ph2)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่า pH ต้องเป็นตัวเลขทั้งสองค่า', argument: `${ph1}, ${ph2}` });
  }
  const deltaExp = new Decimal(ph2 - ph1);
  const ratio = new Decimal(10).pow(deltaExp);
  return ok({
    ratio: ratio.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: '[H⁺]₁ / [H⁺]₂ = 10^(pH₂ - pH₁)' },
      { labelTh: 'แทนค่า', detailTh: `[H⁺]₁ / [H⁺]₂ = 10^(${ph2} - ${ph1}) = 10^${deltaExp.toDecimalPlaces(4).toString()}` },
      { labelTh: 'คำนวณ', detailTh: `[H⁺]₁ / [H⁺]₂ ≈ ${ratio.toDecimalPlaces(2).toString()} เท่า` },
    ],
    summaryTh: `สารที่ pH ${ph1} มีความเป็นกรดมากกว่าสารที่ pH ${ph2} ประมาณ ${ratio.toDecimalPlaces(2).toString()} เท่า`,
  });
};

// มาตราริกเตอร์: M = log10(A/A0)  และพลังงาน log10(E) = 4.8 + 1.5M (E หน่วยจูล)
import Decimal from 'decimal.js';
import { type Result, err, ok } from '../engine/errors';
import type { CompareResult, ScaleResult } from './types';

export const magnitudeFromAmplitudeRatio = (ratioAoverA0: number): Result<ScaleResult> => {
  if (!Number.isFinite(ratioAoverA0) || ratioAoverA0 <= 0) {
    return err({ code: 'physically-impossible', messageTh: 'อัตราส่วนแอมพลิจูด A/A₀ ต้องมากกว่า 0 (เป็นไปไม่ได้ในทางฟิสิกส์)' });
  }
  const M = new Decimal(ratioAoverA0).log(10);
  return ok({
    value: M.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'M = log₁₀(A / A₀)' },
      { labelTh: 'แทนค่า', detailTh: `M = log₁₀(${ratioAoverA0}) = ${M.toDecimalPlaces(4).toString()}` },
    ],
  });
};

export const amplitudeRatioFromMagnitude = (M: number): Result<ScaleResult> => {
  if (!Number.isFinite(M)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่าขนาด M ต้องเป็นตัวเลข', argument: String(M) });
  }
  const ratio = new Decimal(10).pow(M);
  return ok({
    value: ratio.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'A / A₀ = 10^M' },
      { labelTh: 'แทนค่า', detailTh: `A / A₀ = 10^${M} = ${ratio.toDecimalPlaces(4).toString()}` },
    ],
  });
};

export const energyFromMagnitude = (M: number): Result<ScaleResult> => {
  if (!Number.isFinite(M)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่าขนาด M ต้องเป็นตัวเลข', argument: String(M) });
  }
  const logE = new Decimal(4.8).plus(new Decimal(1.5).times(M));
  const E = new Decimal(10).pow(logE);
  return ok({
    value: E.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'log₁₀E = 4.8 + 1.5M' },
      { labelTh: 'แทนค่า', detailTh: `log₁₀E = 4.8 + 1.5(${M}) = ${logE.toDecimalPlaces(4).toString()}` },
      { labelTh: 'ยกกำลัง', detailTh: `E = 10^${logE.toDecimalPlaces(4).toString()} ≈ ${E.toExponential(4)} จูล` },
    ],
  });
};

// เปรียบเทียบพลังงานระหว่างขนาดแผ่นดินไหวสองขนาด
export const compareEnergy = (M1: number, M2: number): Result<CompareResult> => {
  if (!Number.isFinite(M1) || !Number.isFinite(M2)) {
    return err({ code: 'invalid-argument', messageTh: 'ค่าขนาด M ต้องเป็นตัวเลขทั้งสองค่า', argument: `${M1}, ${M2}` });
  }
  const deltaLogE = new Decimal(1.5).times(M1 - M2);
  const ratio = new Decimal(10).pow(deltaLogE);
  return ok({
    ratio: ratio.toNumber(),
    steps: [
      { labelTh: 'สูตร', detailTh: 'log₁₀(E₁/E₂) = 1.5(M₁ - M₂)' },
      { labelTh: 'แทนค่า', detailTh: `log₁₀(E₁/E₂) = 1.5(${M1} - ${M2}) = ${deltaLogE.toDecimalPlaces(4).toString()}` },
      { labelTh: 'ยกกำลัง', detailTh: `E₁/E₂ = 10^${deltaLogE.toDecimalPlaces(4).toString()} ≈ ${ratio.toDecimalPlaces(2).toString()} เท่า` },
    ],
    summaryTh: `แผ่นดินไหวขนาด M ${M1} ปล่อยพลังงานประมาณ ${ratio.toDecimalPlaces(2).toString()} เท่าของขนาด M ${M2}`,
  });
};

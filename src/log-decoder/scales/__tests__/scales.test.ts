import { describe, expect, it } from 'vitest';
import { amplitudeRatioFromMagnitude, compareEnergy, energyFromMagnitude, magnitudeFromAmplitudeRatio } from '../richter';
import { compareIntensity, decibelFromIntensity, intensityFromDecibel } from '../decibel';
import { compareAcidity, hPlusFromPH, phFromHPlus } from '../ph';

describe('Richter scale', () => {
  it('M = log10(A/A0), known value M=6 for ratio 1e6', () => {
    const r = magnitudeFromAmplitudeRatio(1_000_000);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(6, 6);
  });

  it('inverts correctly: amplitude ratio for M=6 is 1e6', () => {
    const r = amplitudeRatioFromMagnitude(6);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(1_000_000, 3);
  });

  it('energy formula known value at M=0', () => {
    const r = energyFromMagnitude(0);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(Math.pow(10, 4.8), 0);
  });

  it('M7 releases ~31.6x energy of M6', () => {
    const r = compareEnergy(7, 6);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.ratio).toBeCloseTo(31.622776601, 3);
  });

  it('rejects non-positive amplitude ratio', () => {
    const r = magnitudeFromAmplitudeRatio(-5);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('physically-impossible');
  });
});

describe('Decibel scale', () => {
  it('known value: I = I0 -> 0 dB', () => {
    const r = decibelFromIntensity(1e-12);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(0, 6);
  });

  it('known value: I = 1 W/m^2 -> 120 dB', () => {
    const r = decibelFromIntensity(1);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(120, 6);
  });

  it('inverts correctly', () => {
    const r = intensityFromDecibel(120);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(1, 6);
  });

  it('90dB is 1000x more intense than 60dB', () => {
    const r = compareIntensity(90, 60);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.ratio).toBeCloseTo(1000, 6);
  });

  it('rejects non-positive intensity', () => {
    const r = decibelFromIntensity(0);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('physically-impossible');
  });
});

describe('pH scale', () => {
  it('known value: [H+]=1e-7 -> pH=7', () => {
    const r = phFromHPlus(1e-7);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(7, 6);
  });

  it('inverts correctly', () => {
    const r = hPlusFromPH(7);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(1e-7, 9);
  });

  it('pH 2 is 100000x more acidic than pH 7', () => {
    const r = compareAcidity(2, 7);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.ratio).toBeCloseTo(100000, 3);
  });

  it('rejects non-positive [H+]', () => {
    const r = phFromHPlus(-1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('physically-impossible');
  });
});

// Feature 2: เครื่องคิดเลขมาตราส่วนโลกจริง — ริกเตอร์ / เดซิเบล / pH ทั้งสามทิศทาง พร้อมโหมดเปรียบเทียบ
import { useState } from 'react';
import { DECIBEL_REFERENCE, PH_REFERENCE, RICHTER_REFERENCE, type ReferencePoint } from '../data/referenceScales';
import { compareIntensity, decibelFromIntensity, intensityFromDecibel } from '../scales/decibel';
import { compareAcidity, hPlusFromPH, phFromHPlus } from '../scales/ph';
import { amplitudeRatioFromMagnitude, compareEnergy, energyFromMagnitude, magnitudeFromAmplitudeRatio } from '../scales/richter';
import type { ScaleResult, CompareResult } from '../scales/types';
import { SCALES } from '../strings';

type Tab = 'richter' | 'decibel' | 'ph';

const ReferenceStrip = ({ points, unit }: { points: ReferencePoint[]; unit: string }) => (
  <div className="flex flex-wrap gap-2">
    {points.map((p) => (
      <span key={p.labelTh} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-dim)]">
        {p.labelTh}: {p.value}
        {unit}
      </span>
    ))}
  </div>
);

const WorkingBox = ({ result }: { result: ScaleResult | CompareResult }) => (
  <div className="mt-3 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
    <p className="font-mono-th text-xs uppercase tracking-wide text-[var(--accent)]">{SCALES.workingHeading}</p>
    {result.steps.map((s, i) => (
      <p key={i} className="font-mono-th text-sm text-[var(--text)]">
        {s.labelTh}: {s.detailTh}
      </p>
    ))}
  </div>
);

const ErrorBox = ({ message }: { message: string }) => (
  <div className="mt-3 rounded-lg border border-[var(--danger)] bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">{message}</div>
);

const RichterTab = () => {
  const [direction, setDirection] = useState<'atoM' | 'mtoA'>('atoM');
  const [amplitude, setAmplitude] = useState('1000000');
  const [magnitude, setMagnitude] = useState('6');
  const [result, setResult] = useState<ScaleResult | null>(null);
  const [energy, setEnergy] = useState<ScaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [m1, setM1] = useState('7');
  const [m2, setM2] = useState('6');
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    setResult(null);
    setEnergy(null);
    if (direction === 'atoM') {
      const r = magnitudeFromAmplitudeRatio(Number(amplitude));
      if (!r.ok) return setError(r.error.messageTh);
      setResult(r.value);
      const e = energyFromMagnitude(r.value.value);
      if (e.ok) setEnergy(e.value);
    } else {
      const r = amplitudeRatioFromMagnitude(Number(magnitude));
      if (!r.ok) return setError(r.error.messageTh);
      setResult(r.value);
      const e = energyFromMagnitude(Number(magnitude));
      if (e.ok) setEnergy(e.value);
    }
  };

  const runCompare = () => {
    setCompareError(null);
    setCompare(null);
    const r = compareEnergy(Number(m1), Number(m2));
    if (!r.ok) return setCompareError(r.error.messageTh);
    setCompare(r.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{SCALES.richter.title}</h3>
        <p className="font-mono-th text-sm text-[var(--text-dim)]">
          {SCALES.richter.formula1} · {SCALES.richter.formula2}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection('atoM')}
          className={`rounded px-3 py-1.5 text-sm ${direction === 'atoM' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
        >
          {SCALES.richter.directionAtoM}
        </button>
        <button
          type="button"
          onClick={() => setDirection('mtoA')}
          className={`rounded px-3 py-1.5 text-sm ${direction === 'mtoA' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
        >
          {SCALES.richter.directionMtoA}
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {direction === 'atoM' ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.richter.inputA}
            <input value={amplitude} onChange={(e) => setAmplitude(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.richter.inputM}
            <input value={magnitude} onChange={(e) => setMagnitude(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
        )}
        <button type="button" onClick={compute} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
          {SCALES.submit}
        </button>
      </div>
      {error && <ErrorBox message={error} />}
      {result && <WorkingBox result={result} />}
      {energy && (
        <p className="text-sm text-[var(--text-dim)]">
          {SCALES.richter.energyLabel}: {energy.value.toExponential(4)} J
        </p>
      )}

      <div className="rounded-lg border border-[var(--border)] p-4">
        <h4 className="mb-2 font-semibold">{SCALES.richter.compareHeading}</h4>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.richter.compareM1}
            <input value={m1} onChange={(e) => setM1(e.target.value)} className="w-24 rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.richter.compareM2}
            <input value={m2} onChange={(e) => setM2(e.target.value)} className="w-24 rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
          <button type="button" onClick={runCompare} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
            {SCALES.submit}
          </button>
        </div>
        {compareError && <ErrorBox message={compareError} />}
        {compare && (
          <>
            <p className="mt-3 text-sm">{compare.summaryTh}</p>
            <WorkingBox result={compare} />
          </>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm text-[var(--text-dim)]">{SCALES.richter.scaleStrip}</p>
        <ReferenceStrip points={RICHTER_REFERENCE} unit=" M" />
      </div>
    </div>
  );
};

const DecibelTab = () => {
  const [direction, setDirection] = useState<'itoB' | 'btoI'>('itoB');
  const [intensity, setIntensity] = useState('1');
  const [beta, setBeta] = useState('90');
  const [result, setResult] = useState<ScaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [b1, setB1] = useState('90');
  const [b2, setB2] = useState('60');
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    setResult(null);
    if (direction === 'itoB') {
      const r = decibelFromIntensity(Number(intensity));
      if (!r.ok) return setError(r.error.messageTh);
      setResult(r.value);
    } else {
      const r = intensityFromDecibel(Number(beta));
      if (!r.ok) return setError(r.error.messageTh);
      setResult(r.value);
    }
  };

  const runCompare = () => {
    setCompareError(null);
    setCompare(null);
    const r = compareIntensity(Number(b1), Number(b2));
    if (!r.ok) return setCompareError(r.error.messageTh);
    setCompare(r.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{SCALES.decibel.title}</h3>
        <p className="font-mono-th text-sm text-[var(--text-dim)]">{SCALES.decibel.formula}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection('itoB')}
          className={`rounded px-3 py-1.5 text-sm ${direction === 'itoB' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
        >
          {SCALES.decibel.directionItoB}
        </button>
        <button
          type="button"
          onClick={() => setDirection('btoI')}
          className={`rounded px-3 py-1.5 text-sm ${direction === 'btoI' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
        >
          {SCALES.decibel.directionBtoI}
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {direction === 'itoB' ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.decibel.inputI}
            <input value={intensity} onChange={(e) => setIntensity(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.decibel.inputB}
            <input value={beta} onChange={(e) => setBeta(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
        )}
        <button type="button" onClick={compute} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
          {SCALES.submit}
        </button>
      </div>
      {error && <ErrorBox message={error} />}
      {result && <WorkingBox result={result} />}

      <div className="rounded-lg border border-[var(--border)] p-4">
        <h4 className="mb-2 font-semibold">{SCALES.decibel.compareHeading}</h4>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.decibel.compareB1}
            <input value={b1} onChange={(e) => setB1(e.target.value)} className="w-24 rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.decibel.compareB2}
            <input value={b2} onChange={(e) => setB2(e.target.value)} className="w-24 rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
          <button type="button" onClick={runCompare} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
            {SCALES.submit}
          </button>
        </div>
        {compareError && <ErrorBox message={compareError} />}
        {compare && (
          <>
            <p className="mt-3 text-sm">{compare.summaryTh}</p>
            <WorkingBox result={compare} />
          </>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm text-[var(--text-dim)]">{SCALES.decibel.scaleStrip}</p>
        <ReferenceStrip points={DECIBEL_REFERENCE} unit=" dB" />
      </div>
    </div>
  );
};

const PhTab = () => {
  const [direction, setDirection] = useState<'htoPH' | 'phtoH'>('htoPH');
  const [hplus, setHplus] = useState('0.0000001');
  const [ph, setPh] = useState('7');
  const [result, setResult] = useState<ScaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [p1, setP1] = useState('2');
  const [p2, setP2] = useState('7');
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    setResult(null);
    if (direction === 'htoPH') {
      const r = phFromHPlus(Number(hplus));
      if (!r.ok) return setError(r.error.messageTh);
      setResult(r.value);
    } else {
      const r = hPlusFromPH(Number(ph));
      if (!r.ok) return setError(r.error.messageTh);
      setResult(r.value);
    }
  };

  const runCompare = () => {
    setCompareError(null);
    setCompare(null);
    const r = compareAcidity(Number(p1), Number(p2));
    if (!r.ok) return setCompareError(r.error.messageTh);
    setCompare(r.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{SCALES.ph.title}</h3>
        <p className="font-mono-th text-sm text-[var(--text-dim)]">
          {SCALES.ph.formula1} · {SCALES.ph.formula2}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection('htoPH')}
          className={`rounded px-3 py-1.5 text-sm ${direction === 'htoPH' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
        >
          {SCALES.ph.directionHtoPH}
        </button>
        <button
          type="button"
          onClick={() => setDirection('phtoH')}
          className={`rounded px-3 py-1.5 text-sm ${direction === 'phtoH' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
        >
          {SCALES.ph.directionPHtoH}
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {direction === 'htoPH' ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.ph.inputH}
            <input value={hplus} onChange={(e) => setHplus(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.ph.inputPH}
            <input value={ph} onChange={(e) => setPh(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
        )}
        <button type="button" onClick={compute} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
          {SCALES.submit}
        </button>
      </div>
      {error && <ErrorBox message={error} />}
      {result && <WorkingBox result={result} />}

      <div className="rounded-lg border border-[var(--border)] p-4">
        <h4 className="mb-2 font-semibold">{SCALES.ph.compareHeading}</h4>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.ph.comparePH1}
            <input value={p1} onChange={(e) => setP1(e.target.value)} className="w-24 rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--text-dim)]">
            {SCALES.ph.comparePH2}
            <input value={p2} onChange={(e) => setP2(e.target.value)} className="w-24 rounded border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2" />
          </label>
          <button type="button" onClick={runCompare} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
            {SCALES.submit}
          </button>
        </div>
        {compareError && <ErrorBox message={compareError} />}
        {compare && (
          <>
            <p className="mt-3 text-sm">{compare.summaryTh}</p>
            <WorkingBox result={compare} />
          </>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm text-[var(--text-dim)]">{SCALES.ph.scaleStrip}</p>
        <ReferenceStrip points={PH_REFERENCE} unit=" pH" />
      </div>
    </div>
  );
};

export const ScaleCalculator = () => {
  const [tab, setTab] = useState<Tab>('richter');

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold">{SCALES.heading}</h2>
        <p className="text-[var(--text-dim)]">{SCALES.intro}</p>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        {(['richter', 'decibel', 'ph'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t px-4 py-2 font-mono-th text-sm ${tab === t ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
          >
            {SCALES.tabs[t]}
          </button>
        ))}
      </div>
      {tab === 'richter' && <RichterTab />}
      {tab === 'decibel' && <DecibelTab />}
      {tab === 'ph' && <PhTab />}
    </section>
  );
};

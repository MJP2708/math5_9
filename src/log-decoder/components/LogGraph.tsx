// กราฟเชิงโต้ตอบของ y = log_b(x) วาดด้วย inline SVG (ไม่พึ่งพา chart library)
// แสดงเส้นกำกับแนวตั้งที่ x=0, จุดคงที่ (1,0) และจุดคำตอบ (ถ้ามี)
import { useState } from 'react';
import { GRAPH } from '../strings';

const W = 320;
const H = 260;
const PAD = 28;

const xToPx = (x: number, xMin: number, xMax: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
const yToPx = (y: number, yMin: number, yMax: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);

interface Props {
  answerX?: number | null;
}

export const LogGraph = ({ answerX }: Props) => {
  const [base, setBase] = useState(2);
  const xMin = 0.05;
  const xMax = 12;
  const yMin = -4;
  const yMax = 4;

  const points: string[] = [];
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    const y = Math.log(x) / Math.log(base);
    if (y >= yMin - 1 && y <= yMax + 1) {
      points.push(`${xToPx(x, xMin, xMax)},${yToPx(Math.max(yMin, Math.min(yMax, y)), yMin, yMax)}`);
    }
  }

  const fixedPointVisible = base > 0 && base !== 1;
  const answerY = answerX && answerX > 0 ? Math.log(answerX) / Math.log(base) : null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <h3 className="mb-2 font-mono-th text-sm uppercase tracking-wider text-[var(--accent)]">{GRAPH.heading}</h3>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={GRAPH.heading}>
        {/* แกน */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
        <line x1={xToPx(0.0001, xMin, xMax)} y1={PAD} x2={xToPx(0.0001, xMin, xMax)} y2={H - PAD} stroke="var(--danger)" strokeDasharray="4 3" />
        {/* เส้นกำกับแนวตั้ง x=0 */}
        <line x1={xToPx(xMin, xMin, xMax)} y1={PAD} x2={xToPx(xMin, xMin, xMax)} y2={H - PAD} stroke="var(--danger)" strokeDasharray="4 3" opacity={0.6} />
        <polyline points={points.join(' ')} fill="none" stroke="var(--accent-2)" strokeWidth={2} />
        {/* จุดคงที่ (1,0) */}
        {fixedPointVisible && <circle cx={xToPx(1, xMin, xMax)} cy={yToPx(0, yMin, yMax)} r={4} fill="var(--warn)" />}
        {answerX && answerY !== null && Number.isFinite(answerX) && Number.isFinite(answerY) && answerX > 0 && answerX <= xMax && (
          <circle cx={xToPx(answerX, xMin, xMax)} cy={yToPx(Math.max(yMin, Math.min(yMax, answerY)), yMin, yMax)} r={5} fill="var(--accent)" stroke="#06120c" strokeWidth={1} />
        )}
      </svg>
      <div className="mt-3 flex items-center gap-3">
        <label htmlFor="base-slider" className="font-mono-th text-xs text-[var(--text-dim)]">
          {GRAPH.baseLabel} = {base.toFixed(2)}
        </label>
        <input
          id="base-slider"
          type="range"
          min={1.05}
          max={10}
          step={0.05}
          value={base}
          onChange={(e) => setBase(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <ul className="mt-2 space-y-1 text-xs text-[var(--text-dim)]">
        <li>
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--danger)] align-middle" /> {GRAPH.asymptoteLabel}
        </li>
        <li>
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--warn)] align-middle" /> {GRAPH.fixedPointLabel}
        </li>
        {answerX && (
          <li>
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] align-middle" /> {GRAPH.answerPointLabel}
          </li>
        )}
      </ul>
    </div>
  );
};

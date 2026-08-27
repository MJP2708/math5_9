// แสดงขั้นตอนการแก้ทีละขั้น (decoder reveal animation) พร้อมปุ่ม "ขั้นถัดไป" และ tooltip "ทำไม"
import { useState } from 'react';
import type { Equation, Expr } from '../engine/ast';
import { equationToLatex, exprToLatex } from '../engine/latex';
import type { Step } from '../engine/steps';
import { PROPERTY_NAMES_TH } from '../strings';
import { SOLVER } from '../strings';
import { KaTeXSpan } from './KaTeXSpan';

const isEquation = (v: Expr | Equation): v is Equation => typeof v === 'object' && 'left' in v && 'right' in v;

const toLatex = (v: Expr | Equation): string => (isEquation(v) ? equationToLatex(v) : exprToLatex(v));

export const StepReveal = ({ steps }: { steps: Step[] }) => {
  const [revealCount, setRevealCount] = useState(steps.length > 0 ? 1 : 0);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? steps.length : revealCount;

  if (steps.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono-th text-sm uppercase tracking-wider text-[var(--accent)]">{SOLVER.stepsHeading}</h3>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="rounded border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {SOLVER.showAll}
        </button>
      </div>
      <ol className="space-y-4">
        {steps.slice(0, visible).map((step, i) => (
          <li key={step.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-[var(--accent)]/10 px-2 py-0.5 font-mono-th text-xs text-[var(--accent)]">
                {SOLVER.stepLabel} {i + 1}
              </span>
              <span className="text-sm font-medium text-[var(--accent-2)]">{PROPERTY_NAMES_TH[step.property]}</span>
              <details className="group ml-auto">
                <summary className="cursor-pointer list-none rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-dim)] hover:text-[var(--warn)]">
                  {SOLVER.why}
                </summary>
                <p className="mt-2 max-w-sm text-xs text-[var(--text-dim)]">{step.whyTh}</p>
              </details>
            </div>
            <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto_1fr] sm:items-center">
              <span className="text-xs text-[var(--text-dim)]">{SOLVER.before}</span>
              <div className="overflow-x-auto">
                <KaTeXSpan latex={toLatex(step.before)} />
              </div>
              <span className="text-xs text-[var(--text-dim)]">{SOLVER.after}</span>
              <div className="overflow-x-auto">
                <KaTeXSpan latex={toLatex(step.after)} />
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text)]">{step.explanationTh}</p>
          </li>
        ))}
      </ol>
      {!showAll && revealCount < steps.length && (
        <button
          type="button"
          onClick={() => setRevealCount((c) => Math.min(c + 1, steps.length))}
          className="rounded-lg border border-[var(--accent)] px-4 py-2 font-mono-th text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10"
        >
          {SOLVER.next} ({revealCount}/{steps.length})
        </button>
      )}
    </div>
  );
};

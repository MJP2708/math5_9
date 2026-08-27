// Feature 1: ตัวช่วยแก้ลอการิทึม — ป้อนนิพจน์/สมการ แล้วดูขั้นตอนการแก้ทีละขั้น
import { useMemo, useState } from 'react';
import type { Expr } from '../engine/ast';
import type { AppError } from '../engine/errors';
import { equationToLatex, exprToLatex } from '../engine/latex';
import { equationToPlainText, exprToPlainText } from '../engine/plainText';
import { parseEquation, parseExpression } from '../engine/parser';
import { simplifyExpr } from '../engine/simplify';
import { solveEquation } from '../engine/solveEquation';
import type { Derivation } from '../engine/steps';
import { evaluateExpr } from '../engine/evaluate';
import { SOLVER } from '../strings';
import { CopyButtons } from './CopyButtons';
import { DomainPanel } from './DomainPanel';
import { KaTeXSpan } from './KaTeXSpan';
import { LogGraph } from './LogGraph';
import { RootsPanel } from './RootsPanel';
import { StepReveal } from './StepReveal';

type Outcome = { kind: 'derivation'; derivation: Derivation; mode: 'simplify' | 'solve' } | { kind: 'error'; error: AppError } | null;

export const Solver = () => {
  const [input, setInput] = useState('log_2(x) + log_2(x-2) = 3');
  const [outcome, setOutcome] = useState<Outcome>(null);

  const run = () => {
    const trimmed = input.trim();
    if (trimmed.includes('=')) {
      const eq = parseEquation(trimmed);
      if (!eq.ok) {
        setOutcome({ kind: 'error', error: eq.error });
        return;
      }
      const solved = solveEquation(eq.value);
      if (!solved.ok) {
        setOutcome({ kind: 'error', error: solved.error });
        return;
      }
      setOutcome({ kind: 'derivation', derivation: solved.value, mode: 'solve' });
    } else {
      const parsed = parseExpression(trimmed);
      if (!parsed.ok) {
        setOutcome({ kind: 'error', error: parsed.error });
        return;
      }
      const derivation = simplifyExpr(parsed.value);
      setOutcome({ kind: 'derivation', derivation, mode: 'simplify' });
    }
  };

  const answerX = useMemo(() => {
    if (!outcome || outcome.kind !== 'derivation') return null;
    const roots = outcome.derivation.candidateRoots?.filter((r) => r.isValid);
    if (roots && roots.length > 0 && Number.isFinite(roots[0].decimal)) {
      return roots[0].decimal;
    }
    return null;
  }, [outcome]);

  const latexText = useMemo(() => {
    if (!outcome || outcome.kind !== 'derivation') return '';
    const lines: string[] = [];
    for (const step of outcome.derivation.steps) {
      const before = 'left' in step.before ? equationToLatex(step.before) : exprToLatex(step.before as Expr);
      const after = 'left' in step.after ? equationToLatex(step.after) : exprToLatex(step.after as Expr);
      lines.push(`${before} \\to ${after}`);
    }
    if (outcome.derivation.simplifiedResult) lines.push(`= ${exprToLatex(outcome.derivation.simplifiedResult)}`);
    outcome.derivation.candidateRoots?.forEach((r) => lines.push(`x = ${exprToLatex(r.exact)} (${r.isValid ? 'ผ่านโดเมน' : 'ถูกปฏิเสธ'})`));
    return lines.join('\\\\\n');
  }, [outcome]);

  const plainText = useMemo(() => {
    if (!outcome || outcome.kind !== 'derivation') return '';
    const lines: string[] = [];
    for (const step of outcome.derivation.steps) {
      const before = 'left' in step.before ? equationToPlainText(step.before) : exprToPlainText(step.before as Expr);
      const after = 'left' in step.after ? equationToPlainText(step.after) : exprToPlainText(step.after as Expr);
      lines.push(`${before}  ->  ${after}   [${step.explanationTh}]`);
    }
    if (outcome.derivation.simplifiedResult) lines.push(`= ${exprToPlainText(outcome.derivation.simplifiedResult)}`);
    outcome.derivation.candidateRoots?.forEach((r) =>
      lines.push(`x = ${exprToPlainText(r.exact)} ~= ${r.decimal.toFixed(4)} (${r.isValid ? 'ผ่านโดเมน' : r.rejectionReasonTh})`),
    );
    return lines.join('\n');
  }, [outcome]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-[var(--text)]">{SOLVER.heading}</h2>
        <p className="text-[var(--text-dim)]">{SOLVER.intro}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="solver-input" className="sr-only">
          {SOLVER.inputLabel}
        </label>
        <input
          id="solver-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder={SOLVER.inputPlaceholder}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3 font-mono-th text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={run}
          className="rounded-lg border border-[var(--accent)] bg-[var(--accent)]/10 px-6 py-3 font-mono-th font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20"
        >
          {SOLVER.submit}
        </button>
      </div>

      {!outcome && <p className="text-sm text-[var(--text-dim)]">{SOLVER.emptyState}</p>}

      {outcome?.kind === 'error' && (
        <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger)]/10 p-4 text-[var(--danger)]">{outcome.error.messageTh}</div>
      )}

      {outcome?.kind === 'derivation' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <DomainPanel domain={outcome.derivation.domain} />
            <StepReveal steps={outcome.derivation.steps} />

            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
              <h3 className="mb-2 font-mono-th text-sm uppercase tracking-wider text-[var(--accent)]">{SOLVER.resultHeading}</h3>
              {outcome.mode === 'simplify' && outcome.derivation.simplifiedResult && (
                <div className="space-y-1">
                  <p className="text-sm text-[var(--text-dim)]">{SOLVER.simplifiedLabel}</p>
                  <KaTeXSpan display latex={exprToLatex(outcome.derivation.simplifiedResult)} />
                  {(() => {
                    const d = evaluateExpr(outcome.derivation.simplifiedResult);
                    return d.ok ? (
                      <p className="text-sm text-[var(--text-dim)]">
                        {SOLVER.decimalLabel}: ≈ {d.value.toDecimalPlaces(6).toString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
              {outcome.mode === 'solve' && outcome.derivation.candidateRoots && <RootsPanel roots={outcome.derivation.candidateRoots} />}
            </div>

            <CopyButtons latexText={latexText} plainText={plainText} />
          </div>
          <LogGraph answerX={answerX} />
        </div>
      )}
    </section>
  );
};

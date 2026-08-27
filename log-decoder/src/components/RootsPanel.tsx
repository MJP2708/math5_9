// แสดงคำตอบทั้งหมดที่หาได้ พร้อมผลตรวจคำตอบแปลกปลอม (extraneous root check)
import { exprToLatex } from '../engine/latex';
import type { CandidateRoot } from '../engine/steps';
import { SOLVER } from '../strings';
import { KaTeXSpan } from './KaTeXSpan';

export const RootsPanel = ({ roots }: { roots: CandidateRoot[] }) => (
  <div className="space-y-3">
    <h3 className="font-mono-th text-sm uppercase tracking-wider text-[var(--accent)]">{SOLVER.rootsHeading}</h3>
    {roots.map((root, i) => (
      <div
        key={i}
        className={`rounded-lg border p-4 ${root.isValid ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5' : 'border-[var(--danger)]/50 bg-[var(--danger)]/5'}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <KaTeXSpan latex={`x = ${exprToLatex(root.exact)}`} />
          <span className="text-sm text-[var(--text-dim)]">≈ {Number.isFinite(root.decimal) ? root.decimal.toFixed(4) : '—'}</span>
          <span
            className={`ml-auto rounded px-2 py-0.5 font-mono-th text-xs ${root.isValid ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--danger)]/20 text-[var(--danger)]'}`}
          >
            {root.isValid ? SOLVER.rootValid : SOLVER.rootRejected}
          </span>
        </div>
        {root.domainChecks.length > 0 && (
          <div className="mt-2 space-y-1 text-xs text-[var(--text-dim)]">
            <p className="font-mono-th uppercase tracking-wide">{SOLVER.checkHeading}</p>
            {root.domainChecks.map((c, j) => (
              <p key={j} className={c.satisfied ? '' : 'text-[var(--danger)]'}>
                {c.condition.descriptionTh.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\ne/g, '≠')} → {c.evaluatedValueTh} {c.satisfied ? '✓' : '✗'}
              </p>
            ))}
          </div>
        )}
        {!root.isValid && root.rejectionReasonTh && <p className="mt-2 text-sm text-[var(--danger)]">{root.rejectionReasonTh}</p>}
      </div>
    ))}
  </div>
);

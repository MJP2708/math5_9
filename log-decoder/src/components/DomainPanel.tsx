// แผงแสดงเงื่อนไข/โดเมนของนิพจน์ก่อนเริ่มแก้ (arg>0, base>0 และ != 1)
import type { Condition } from '../engine/domain';
import { SOLVER } from '../strings';
import { KaTeXSpan } from './KaTeXSpan';

export const DomainPanel = ({ domain }: { domain: Condition[] }) => (
  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
    <h3 className="mb-2 font-mono-th text-sm uppercase tracking-wider text-[var(--accent)]">{SOLVER.domainHeading}</h3>
    {domain.length === 0 ? (
      <p className="text-sm text-[var(--text-dim)]">{SOLVER.domainEmpty}</p>
    ) : (
      <ul className="space-y-1">
        {domain.map((c, i) => (
          <li key={`${c.kind}-${i}`} className="flex items-center gap-2 text-sm">
            <span className="text-[var(--warn)]">•</span>
            <KaTeXSpan latex={c.descriptionTh} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

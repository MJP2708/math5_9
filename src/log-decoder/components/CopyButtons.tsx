// ปุ่มคัดลอกคำตอบ/ขั้นตอน เป็น LaTeX หรือข้อความธรรมดา
import { useState } from 'react';
import { SOLVER } from '../strings';

export const CopyButtons = ({ latexText, plainText }: { latexText: string; plainText: string }) => {
  const [copied, setCopied] = useState<'latex' | 'text' | null>(null);

  const copy = async (kind: 'latex' | 'text', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // เบราว์เซอร์บางตัวอาจบล็อก clipboard API — ไม่ต้อง throw ต่อ UI
    }
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copy('latex', latexText)}
        className="rounded border border-[var(--border)] px-3 py-1.5 font-mono-th text-xs text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {copied === 'latex' ? SOLVER.copied : SOLVER.copyLatex}
      </button>
      <button
        type="button"
        onClick={() => copy('text', plainText)}
        className="rounded border border-[var(--border)] px-3 py-1.5 font-mono-th text-xs text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {copied === 'text' ? SOLVER.copied : SOLVER.copyText}
      </button>
    </div>
  );
};

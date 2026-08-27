import { useState } from "react";
import { ErrorBoundary } from "../log-decoder/components/ErrorBoundary";
import { PracticeMode } from "../log-decoder/components/PracticeMode";
import { ScaleCalculator } from "../log-decoder/components/ScaleCalculator";
import { Solver } from "../log-decoder/components/Solver";
import { FOOTER, NAV } from "../log-decoder/strings";

type View = "solver" | "scales" | "practice";

export function LogDecoderPage() {
  const [view, setView] = useState<View>("solver");

  const navItem = (key: View, label: string) => (
    <button
      type="button"
      onClick={() => setView(key)}
      className={`rounded-lg px-4 py-2 font-mono-th text-sm transition-colors ${
        view === key
          ? "bg-[var(--accent)]/15 text-[var(--accent)]"
          : "text-[var(--text-dim)] hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <ErrorBoundary>
      <div className="log-decoder text-[var(--text)]">
        <nav className="mb-6 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-2">
          {navItem("solver", NAV.solver)}
          {navItem("scales", NAV.scales)}
          {navItem("practice", NAV.practice)}
        </nav>

        <main>
          {view === "solver" && <Solver />}
          {view === "scales" && <ScaleCalculator />}
          {view === "practice" && <PracticeMode />}
        </main>

        <footer className="mt-8 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--text-dim)]">
          {FOOTER.text}
        </footer>
      </div>
    </ErrorBoundary>
  );
}

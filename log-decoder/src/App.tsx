// แอปหลัก: จัดวางธีม "decoder terminal" (มืด, สำเนียง monospace) + นำทางไปยังแต่ละฟีเจอร์
import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PracticeMode } from './components/PracticeMode';
import { ScaleCalculator } from './components/ScaleCalculator';
import { Solver } from './components/Solver';
import { APP_SUBTITLE, APP_TITLE, FOOTER, NAV } from './strings';

type View = 'solver' | 'scales' | 'practice';

function App() {
  const [view, setView] = useState<View>('solver');

  const navItem = (key: View, label: string) => (
    <button
      type="button"
      onClick={() => setView(key)}
      className={`rounded-lg px-4 py-2 font-mono-th text-sm transition-colors ${
        view === key ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <header className="border-b border-[var(--border)] bg-[var(--bg-panel)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
            <div>
              <h1 className="font-mono-th text-xl font-bold text-[var(--accent)]">{APP_TITLE}</h1>
              <p className="text-xs text-[var(--text-dim)]">{APP_SUBTITLE}</p>
            </div>
            <nav className="ml-auto flex flex-wrap gap-2">
              {navItem('solver', NAV.solver)}
              {navItem('scales', NAV.scales)}
              {navItem('practice', NAV.practice)}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {view === 'solver' && <Solver />}
          {view === 'scales' && <ScaleCalculator />}
          {view === 'practice' && <PracticeMode />}
        </main>

        <footer className="border-t border-[var(--border)] px-4 py-6 text-center text-xs text-[var(--text-dim)] sm:px-6">
          {FOOTER.text}
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;

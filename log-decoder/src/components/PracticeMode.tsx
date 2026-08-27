// Feature: โหมดฝึกฝน — สุ่มโจทย์ตามระดับความยาก ตรวจคำตอบ แล้วเฉลยทีละขั้นตอนได้
import { useState } from 'react';
import { Int, Log, Mul, Pow } from '../engine/ast';
import type { Expr } from '../engine/ast';
import { evaluateExpr } from '../engine/evaluate';
import { exprToLatex } from '../engine/latex';
import { simplifyExpr } from '../engine/simplify';
import { PRACTICE } from '../strings';
import { KaTeXSpan } from './KaTeXSpan';
import { StepReveal } from './StepReveal';

type Difficulty = 'easy' | 'medium' | 'hard';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const BASES = [2, 3, 5, 10];

const generateProblem = (difficulty: Difficulty): Expr => {
  const base = BASES[randInt(0, BASES.length - 1)];
  if (difficulty === 'easy') {
    const k = randInt(1, 4);
    // log_b(b^k) = k
    return Log(Int(base), Pow(Int(base), Int(k)));
  }
  if (difficulty === 'medium') {
    const k1 = randInt(1, 3);
    const k2 = randInt(1, 3);
    // log_b(b^k1 * b^k2) = k1 + k2
    return Log(Int(base), Mul(Pow(Int(base), Int(k1)), Pow(Int(base), Int(k2))));
  }
  // hard: log_b(b^k1) + log_b(b^k2) หรือมีตัวเลขล้วนผสม
  const k1 = randInt(2, 5);
  const k2 = randInt(1, 3);
  return Log(Int(base), Pow(Int(base ** k2), Int(k1)));
};

export const PracticeMode = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [problem, setProblem] = useState<Expr>(() => generateProblem('easy'));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const correctValue = evaluateExpr(problem);
  const correctNumber = correctValue.ok ? correctValue.value.toNumber() : NaN;
  const derivation = simplifyExpr(problem);

  const regenerate = (d: Difficulty) => {
    setDifficulty(d);
    setProblem(generateProblem(d));
    setAnswer('');
    setFeedback(null);
    setShowReveal(false);
  };

  const check = () => {
    const userVal = Number(answer.trim());
    if (!Number.isFinite(userVal)) {
      setFeedback('incorrect');
      return;
    }
    setFeedback(Math.abs(userVal - correctNumber) < 1e-6 ? 'correct' : 'incorrect');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold">{PRACTICE.heading}</h2>
        <p className="text-[var(--text-dim)]">{PRACTICE.intro}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--text-dim)]">{PRACTICE.difficulty}:</span>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => regenerate(d)}
            className={`rounded px-3 py-1.5 text-sm ${difficulty === d ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
          >
            {PRACTICE[d]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => regenerate(difficulty)}
          className="ml-auto rounded-lg border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)]"
        >
          {PRACTICE.generate}
        </button>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-6 text-center">
        <KaTeXSpan display latex={`${exprToLatex(problem)} = \\ ?`} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="practice-answer" className="sr-only">
          {PRACTICE.answerLabel}
        </label>
        <input
          id="practice-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={PRACTICE.answerLabel}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-2"
        />
        <button type="button" onClick={check} className="rounded-lg border border-[var(--accent)] px-4 py-2 text-[var(--accent)]">
          {PRACTICE.check}
        </button>
      </div>

      {feedback && (
        <p className={feedback === 'correct' ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}>
          {feedback === 'correct' ? PRACTICE.correct : PRACTICE.incorrect}
        </p>
      )}

      <button type="button" onClick={() => setShowReveal((s) => !s)} className="text-sm text-[var(--accent-2)] underline">
        {showReveal ? PRACTICE.hideReveal : PRACTICE.reveal}
      </button>

      {showReveal && <StepReveal steps={derivation.steps} />}
    </section>
  );
};

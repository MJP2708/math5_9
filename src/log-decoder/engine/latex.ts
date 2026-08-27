// แปลง Expr/Equation ให้เป็นสตริง LaTeX สำหรับ render ด้วย KaTeX และสำหรับปุ่ม "คัดลอกเป็น LaTeX"
import type { Equation, Expr } from './ast';

const needsParens = (e: Expr): boolean => e.kind === 'add';

const wrap = (e: Expr): string => (needsParens(e) ? `\\left(${exprToLatex(e)}\\right)` : exprToLatex(e));

export const exprToLatex = (e: Expr): string => {
  switch (e.kind) {
    case 'int':
      return e.value.toString();
    case 'frac':
      return `\\frac{${e.num}}{${e.den}}`;
    case 'var':
      return e.name === 'e' ? 'e' : e.name;
    case 'add':
      return e.terms
        .map((t, i) => {
          if (t.kind === 'neg') return `${i === 0 ? '-' : ' - '}${wrap(t.arg)}`;
          return `${i === 0 ? '' : ' + '}${exprToLatex(t)}`;
        })
        .join('');
    case 'neg':
      return `-${wrap(e.arg)}`;
    case 'mul':
      return e.factors.map((f) => wrap(f)).join(' \\cdot ');
    case 'div':
      return `\\frac{${exprToLatex(e.num)}}{${exprToLatex(e.den)}}`;
    case 'pow':
      return `${wrap(e.base)}^{${exprToLatex(e.exp)}}`;
    case 'log': {
      if (e.base.kind === 'int' && e.base.value === 10n) return `\\log\\left(${exprToLatex(e.arg)}\\right)`;
      return `\\log_{${exprToLatex(e.base)}}\\left(${exprToLatex(e.arg)}\\right)`;
    }
    case 'ln':
      return `\\ln\\left(${exprToLatex(e.arg)}\\right)`;
    default:
      return '';
  }
};

export const equationToLatex = (eq: Equation): string => `${exprToLatex(eq.left)} = ${exprToLatex(eq.right)}`;

// แปลง Expr/Equation เป็นข้อความธรรมดา (plain text) สำหรับปุ่ม "คัดลอกเป็นข้อความ"
import type { Equation, Expr } from './ast';

const needsParens = (e: Expr): boolean => e.kind === 'add';
const wrap = (e: Expr): string => (needsParens(e) ? `(${exprToPlainText(e)})` : exprToPlainText(e));

export const exprToPlainText = (e: Expr): string => {
  switch (e.kind) {
    case 'int':
      return e.value.toString();
    case 'frac':
      return `${e.num}/${e.den}`;
    case 'var':
      return e.name;
    case 'add':
      return e.terms
        .map((t, i) => {
          if (t.kind === 'neg') return `${i === 0 ? '-' : ' - '}${wrap(t.arg)}`;
          return `${i === 0 ? '' : ' + '}${exprToPlainText(t)}`;
        })
        .join('');
    case 'neg':
      return `-${wrap(e.arg)}`;
    case 'mul':
      return e.factors.map(wrap).join(' * ');
    case 'div':
      return `${wrap(e.num)} / ${wrap(e.den)}`;
    case 'pow':
      return `${wrap(e.base)}^${wrap(e.exp)}`;
    case 'log': {
      if (e.base.kind === 'int' && e.base.value === 10n) return `log(${exprToPlainText(e.arg)})`;
      return `log_${exprToPlainText(e.base)}(${exprToPlainText(e.arg)})`;
    }
    case 'ln':
      return `ln(${exprToPlainText(e.arg)})`;
    default:
      return '';
  }
};

export const equationToPlainText = (eq: Equation): string => `${exprToPlainText(eq.left)} = ${exprToPlainText(eq.right)}`;

// เปรียบเทียบ Expr สองตัวว่า "เหมือนกันทุกประการทางโครงสร้าง" หรือ "มีค่าเท่ากันแบบ exact" หรือไม่
import type { Expr } from '../ast';
import { exprToRational, ratEquals } from '../rational';

const stringify = (e: Expr): string => {
  switch (e.kind) {
    case 'int':
      return `int:${e.value}`;
    case 'frac':
      return `frac:${e.num}/${e.den}`;
    case 'var':
      return `var:${e.name}`;
    case 'add':
      return `add:[${e.terms.map(stringify).join(',')}]`;
    case 'neg':
      return `neg:(${stringify(e.arg)})`;
    case 'mul':
      return `mul:[${e.factors.map(stringify).join(',')}]`;
    case 'div':
      return `div:(${stringify(e.num)}/${stringify(e.den)})`;
    case 'pow':
      return `pow:(${stringify(e.base)}^${stringify(e.exp)})`;
    case 'log':
      return `log:(${stringify(e.base)},${stringify(e.arg)})`;
    case 'ln':
      return `ln:(${stringify(e.arg)})`;
  }
};

export const exprStructurallyEqual = (a: Expr, b: Expr): boolean => stringify(a) === stringify(b);

export const exprValueEqual = (a: Expr, b: Expr): boolean => {
  if (exprStructurallyEqual(a, b)) return true;
  const ra = exprToRational(a);
  const rb = exprToRational(b);
  if (ra && rb) return ratEquals(ra, rb);
  return false;
};

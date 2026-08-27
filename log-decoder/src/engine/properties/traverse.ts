// เดินสำรวจ Expr แบบ bottom-up เพื่อลองใช้กฎ (Rule) ที่ตำแหน่งแรกที่ใช้ได้ (ลึกสุดก่อน)
import type { Expr } from '../ast';
import type { Rule, RuleResult } from './types';

const mapChildren = (e: Expr, fn: (c: Expr) => Expr): Expr => {
  switch (e.kind) {
    case 'add':
      return { kind: 'add', terms: e.terms.map(fn) };
    case 'neg':
      return { kind: 'neg', arg: fn(e.arg) };
    case 'mul':
      return { kind: 'mul', factors: e.factors.map(fn) };
    case 'div':
      return { kind: 'div', num: fn(e.num), den: fn(e.den) };
    case 'pow':
      return { kind: 'pow', base: fn(e.base), exp: fn(e.exp) };
    case 'log':
      return { kind: 'log', base: fn(e.base), arg: fn(e.arg) };
    case 'ln':
      return { kind: 'ln', arg: fn(e.arg) };
    default:
      return e;
  }
};

// พยายามใช้กฎหนึ่งข้อ กับนิพจน์ย่อยแรกที่พบ (bottom-up: ลูกก่อน แล้วค่อยตัวเอง)
export const applyRuleOnce = (e: Expr, rule: Rule): RuleResult | null => {
  let found: RuleResult | null = null;
  const newChildren = mapChildren(e, (c) => {
    if (found) return c;
    const r = applyRuleOnce(c, rule);
    if (r) {
      found = r;
      return r.after;
    }
    return c;
  });
  if (found) return { after: newChildren, property: (found as RuleResult).property, explanationTh: (found as RuleResult).explanationTh };
  return rule(e);
};

// เดินสำรวจ Expr เพื่อรวบรวมเงื่อนไขโดเมนทั้งหมด (อาร์กิวเมนต์ > 0, ฐาน > 0 และ != 1)
// ของทุก log/ln ที่ปรากฏในนิพจน์ (ใช้ทั้งตอนแสดงแผงเงื่อนไข และตอนตรวจคำตอบแปลกปลอม)
import type { Expr } from './ast';
import { exprToLatex } from './latex';
import type { Condition } from './domain';

export const collectDomainConditions = (expr: Expr): Condition[] => {
  const conditions: Condition[] = [];
  const visit = (e: Expr) => {
    switch (e.kind) {
      case 'log':
        conditions.push({
          kind: 'arg-positive',
          subject: e.arg,
          descriptionTh: `${exprToLatex(e.arg)} > 0`,
        });
        conditions.push({
          kind: 'base-positive-ne-one',
          subject: e.base,
          descriptionTh: `${exprToLatex(e.base)} > 0 \\text{ และ } ${exprToLatex(e.base)} \\ne 1`,
        });
        visit(e.base);
        visit(e.arg);
        break;
      case 'ln':
        conditions.push({
          kind: 'arg-positive',
          subject: e.arg,
          descriptionTh: `${exprToLatex(e.arg)} > 0`,
        });
        visit(e.arg);
        break;
      case 'add':
        e.terms.forEach(visit);
        break;
      case 'mul':
        e.factors.forEach(visit);
        break;
      case 'neg':
        visit(e.arg);
        break;
      case 'div':
        visit(e.num);
        visit(e.den);
        break;
      case 'pow':
        visit(e.base);
        visit(e.exp);
        break;
      default:
        break;
    }
  };
  visit(expr);
  return conditions;
};

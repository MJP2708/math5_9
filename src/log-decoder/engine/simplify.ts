// pipeline การ "ทำให้ง่าย" นิพจน์ลอการิทึม: ใช้กฎทีละข้อ ทีละตำแหน่ง จนกว่าจะไม่มีกฎใดใช้ได้อีก
// บันทึกทุกขั้นตอนเป็น Step[] เพื่อนำไปแสดงผลแบบ step-by-step

import type { Expr } from './ast';
import { collectDomainConditions } from './domain-collect';
import type { Derivation, Step } from './steps';
import { changeOfBaseRule } from './properties/changeOfBase';
import { inverseExpLogRule } from './properties/inverseExpLog';
import { inverseLogExpRule } from './properties/inverseLogExp';
import { logBaseSelfRule } from './properties/logBaseSelf';
import { logOfOneRule } from './properties/logOfOne';
import { powerRuleRule } from './properties/powerRule';
import { productRuleRule } from './properties/productRule';
import { quotientRuleRule } from './properties/quotientRule';
import { simplifyArithmeticRule } from './properties/simplifyArithmetic';
import { applyRuleOnce } from './properties/traverse';
import { exprStructurallyEqual } from './properties/equals';
import type { Rule } from './properties/types';

// ลำดับความสำคัญของกฎ: กฎที่ลดรูปตรงๆ (identity) มาก่อน แล้วค่อยเป็นกฎที่ "แตก" นิพจน์ออก
const RULES_PRIORITY: Rule[] = [
  simplifyArithmeticRule,
  logOfOneRule,
  logBaseSelfRule,
  inverseLogExpRule,
  inverseExpLogRule,
  productRuleRule,
  quotientRuleRule,
  powerRuleRule,
];

const MAX_STEPS = 40;

export const simplifyExpr = (expr: Expr): Derivation => {
  const domain = collectDomainConditions(expr);
  const steps: Step[] = [];
  let current = expr;
  let stepId = 0;
  for (let i = 0; i < MAX_STEPS; i++) {
    let applied = false;
    for (const rule of RULES_PRIORITY) {
      const result = applyRuleOnce(current, rule);
      if (result && !exprStructurallyEqual(result.after, current)) {
        steps.push({
          id: `step-${stepId++}`,
          before: current,
          after: result.after,
          property: result.property,
          explanationTh: result.explanationTh,
          whyTh: result.explanationTh,
        });
        current = result.after;
        applied = true;
        break;
      }
    }
    if (!applied) break;
  }
  return { domain, steps, simplifiedResult: current };
};

// ใช้ change-of-base แบบชัดเจน (เรียกเองจาก UI ถ้าผู้ใช้อยากดูขั้นตอนเปลี่ยนฐาน) — export แยกไว้ให้ทดสอบได้
export const applyChangeOfBase = changeOfBaseRule;

// ประเภทข้อมูลสำหรับ "ขั้นตอนการแก้โจทย์" (Step) และผลลัพธ์การแก้ทั้งหมด (Derivation)
// เป้าหมายคือให้ทุกขั้นตอนระบุชัดเจนว่าใช้ "สมบัติ" ใด ไม่ใช่แค่โยนคำตอบสุดท้าย

import type { Equation, Expr } from './ast';
import type { Condition, ConditionCheck } from './domain';

// รายชื่อสมบัติ/เทคนิคทั้งหมดที่ rule engine อาจใช้
// ใช้เป็น key ไปค้นชื่อภาษาไทย + คำอธิบายใน src/strings.ts
export type PropertyId =
  | 'product-rule' // log_b(xy) = log_b(x) + log_b(y)
  | 'quotient-rule' // log_b(x/y) = log_b(x) - log_b(y)
  | 'power-rule' // log_b(x^k) = k·log_b(x)
  | 'change-of-base' // log_b(x) = log_c(x) / log_c(b)
  | 'log-base-self' // log_b(b) = 1
  | 'log-of-one' // log_b(1) = 0
  | 'inverse-exp-log' // b^(log_b x) = x
  | 'inverse-log-exp' // log_b(b^k) = k
  | 'ln-is-log-base-e' // ln(x) = log_e(x)
  | 'combine-like-terms'
  | 'isolate-term'
  | 'take-log-both-sides' // แปลงสมการเลขชี้กำลังให้เป็น log ทั้งสองข้าง
  | 'exponentiate-both-sides' // ยกกำลังฐานเดียวกันทั้งสองข้าง เพื่อกำจัด log
  | 'equate-arguments' // log_b(x) = log_b(y) => x = y (เมื่อฐานเท่ากัน)
  | 'quadratic-formula'
  | 'substitute-value'
  | 'simplify-arithmetic';

// ขั้นตอนหนึ่งขั้น ใช้ได้ทั้งกับนิพจน์เดี่ยว (Expr) และสมการ (Equation)
export interface Step<T = Expr | Equation> {
  id: string;
  before: T;
  after: T;
  property: PropertyId;
  // คำอธิบายขั้นตอนนี้แบบเจาะจงกับโจทย์ (ภาษาไทย)
  explanationTh: string;
  // คำอธิบาย "ทำไมทำแบบนี้" แบบทั่วไป (แสดงใน tooltip)
  whyTh: string;
}

// คำตอบหนึ่งตัวที่เป็นไปได้ ก่อน/หลังตรวจคำตอบแปลกปลอม
export interface CandidateRoot {
  // รูปแบบ exact ของคำตอบ (เช่น ln 50 / ln 2) สำหรับ render ด้วย KaTeX
  exact: Expr;
  // ค่าประมาณทศนิยม (คำนวณด้วย decimal.js)
  decimal: number;
  // ผลตรวจสอบเงื่อนไขโดเมนของคำตอบนี้
  domainChecks: ConditionCheck[];
  // ผ่านเงื่อนไขทุกข้อหรือไม่ (ไม่ใช่คำตอบแปลกปลอม)
  isValid: boolean;
  // เหตุผลที่ถูกตัดทิ้ง (กรณี isValid = false)
  rejectionReasonTh?: string;
}

// ผลลัพธ์รวมของการ "ทำให้ง่าย" หรือ "แก้สมการ" หนึ่งโจทย์
export interface Derivation {
  // เงื่อนไขโดเมนของโจทย์ตั้งต้น (แสดงในแผงเงื่อนไขก่อนเริ่มแก้)
  domain: Condition[];
  // ลำดับขั้นตอนทั้งหมด
  steps: Step[];
  // สำหรับโจทย์ "ทำให้ง่าย": นิพจน์ผลลัพธ์สุดท้าย
  simplifiedResult?: Expr;
  // สำหรับโจทย์ "แก้สมการ": คำตอบที่เป็นไปได้ทั้งหมดพร้อมผลตรวจ
  candidateRoots?: CandidateRoot[];
}

// ประเภทข้อมูลสำหรับ "เงื่อนไข/โดเมน" ของนิพจน์ลอการิทึม
// เช่น อาร์กิวเมนต์ต้อง > 0, ฐานต้อง > 0 และ ≠ 1

import type { Expr } from './ast';

export type ConditionKind = 'arg-positive' | 'base-positive-ne-one' | 'custom';

// เงื่อนไขหนึ่งข้อที่ต้องเป็นจริง ก่อนที่นิพจน์/สมการจะมีความหมาย
export interface Condition {
  kind: ConditionKind;
  // นิพจน์ที่เงื่อนไขนี้อ้างถึง (เช่น อาร์กิวเมนต์ของ log ตัวที่ทำให้เกิดเงื่อนไข)
  subject: Expr;
  // ข้อความอธิบายเงื่อนไขเป็นภาษาไทย เช่น "x - 2 > 0"
  descriptionTh: string;
}

// ผลของการตรวจสอบเงื่อนไขหนึ่งข้อ เมื่อแทนค่าตัวแปรแล้ว
export interface ConditionCheck {
  condition: Condition;
  satisfied: boolean;
  // ค่าที่ได้จากการแทนค่า (ใช้แสดงในขั้นตอนตรวจคำตอบ)
  evaluatedValueTh: string;
}

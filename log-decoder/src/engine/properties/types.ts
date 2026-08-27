// อินเทอร์เฟซกลางของ "กฎ" หนึ่งข้อในระบบ rule engine
// กฎแต่ละข้อรับ Expr เข้ามา พยายามค้นหาตำแหน่งที่ใช้กฎนี้ได้ (ตำแหน่งเดียว แบบ "บนสุดที่เจอ")
// แล้วคืนนิพจน์ใหม่ + explanationTh ถ้าใช้ได้ หรือ null ถ้าใช้ไม่ได้เลยในนิพจน์นี้

import type { Expr } from '../ast';
import type { PropertyId } from '../steps';

export interface RuleResult {
  after: Expr;
  property: PropertyId;
  explanationTh: string;
}

export type Rule = (e: Expr) => RuleResult | null;

// log_b(x) = log_c(x) / log_c(b) — ใช้ตอนต้องรวม log ต่างฐานเข้าด้วยกัน (ที่นี่เปลี่ยนเป็นฐาน e คือ ln)
import { Div, Ln } from '../ast';
import type { Rule } from './types';

export const changeOfBaseRule: Rule = (e) => {
  if (e.kind === 'log') {
    return {
      after: Div(Ln(e.arg), Ln(e.base)),
      property: 'change-of-base',
      explanationTh: 'เปลี่ยนฐานของ log เป็นฐาน e (ln) เพื่อให้คำนวณค่าทศนิยมได้',
    };
  }
  return null;
};

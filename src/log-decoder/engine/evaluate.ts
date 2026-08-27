// ประเมินค่า Expr เป็นตัวเลขจริง (Decimal) แบบแม่นยำสูง โดยใช้ decimal.js
// สำหรับกรณี log/ln ที่ผลลัพธ์เป็นจำนวนเต็ม/ตรรกยะพอดี (เช่น log_2(8)=3) จะพยายามหาค่า "exact" ก่อน
// เพื่อไม่ให้ได้ 2.9999999999999996 แทนที่จะเป็น 3

import Decimal from 'decimal.js';
import type { Expr } from './ast';
import { type AppError, type Result, err, ok } from './errors';
import { exactRationalLog, exprToRational } from './rational';

Decimal.set({ precision: 50 });

export type Env = Record<string, Decimal>;

const invalidArg = (argument: string, messageTh: string): AppError => ({
  code: 'invalid-argument',
  messageTh,
  argument,
});

const invalidBase = (base: string, messageTh: string): AppError => ({
  code: 'invalid-base',
  messageTh,
  base,
});

export const evaluateExpr = (e: Expr, env: Env = {}): Result<Decimal> => {
  switch (e.kind) {
    case 'int':
      return ok(new Decimal(e.value.toString()));
    case 'frac':
      return ok(new Decimal(e.num.toString()).div(new Decimal(e.den.toString())));
    case 'var': {
      const v = env[e.name];
      if (v === undefined) {
        return err({
          code: 'unsupported-expression',
          messageTh: `ไม่พบค่าของตัวแปร "${e.name}" สำหรับแทนค่า`,
        });
      }
      return ok(v);
    }
    case 'add': {
      let acc = new Decimal(0);
      for (const t of e.terms) {
        const r = evaluateExpr(t, env);
        if (!r.ok) return r;
        acc = acc.plus(r.value);
      }
      return ok(acc);
    }
    case 'neg': {
      const r = evaluateExpr(e.arg, env);
      if (!r.ok) return r;
      return ok(r.value.neg());
    }
    case 'mul': {
      let acc = new Decimal(1);
      for (const f of e.factors) {
        const r = evaluateExpr(f, env);
        if (!r.ok) return r;
        acc = acc.times(r.value);
      }
      return ok(acc);
    }
    case 'div': {
      const n = evaluateExpr(e.num, env);
      if (!n.ok) return n;
      const d = evaluateExpr(e.den, env);
      if (!d.ok) return d;
      if (d.value.isZero()) {
        return err(invalidArg('/', 'หารด้วยศูนย์ไม่ได้'));
      }
      return ok(n.value.div(d.value));
    }
    case 'pow': {
      const b = evaluateExpr(e.base, env);
      if (!b.ok) return b;
      const p = evaluateExpr(e.exp, env);
      if (!p.ok) return p;
      try {
        return ok(b.value.pow(p.value));
      } catch {
        return err(invalidArg('^', 'ยกกำลังนี้ไม่นิยาม (เช่น ฐานติดลบกับเลขชี้กำลังไม่เต็ม)'));
      }
    }
    case 'log': {
      const baseD = evaluateExpr(e.base, env);
      if (!baseD.ok) return baseD;
      const argD = evaluateExpr(e.arg, env);
      if (!argD.ok) return argD;
      if (baseD.value.lte(0) || baseD.value.eq(1)) {
        return err(invalidBase(baseD.value.toString(), `ฐานของ log ต้องมากกว่า 0 และไม่เท่ากับ 1 (ฐาน = ${baseD.value.toString()})`));
      }
      if (argD.value.lte(0)) {
        return err(invalidArg(argD.value.toString(), `อาร์กิวเมนต์ของ log ต้องมากกว่า 0 (ได้ ${argD.value.toString()})`));
      }
      // ลองหาค่า exact ก่อน (กรณีฐาน/อาร์กิวเมนต์เป็นค่าคงที่ตรรกยะ)
      const baseR = exprToRational(e.base);
      const argR = exprToRational(e.arg);
      if (baseR && argR) {
        const k = exactRationalLog(baseR, argR);
        if (k !== null) return ok(new Decimal(k.toString()));
      }
      return ok(Decimal.ln(argD.value).div(Decimal.ln(baseD.value)));
    }
    case 'ln': {
      const argD = evaluateExpr(e.arg, env);
      if (!argD.ok) return argD;
      if (argD.value.lte(0)) {
        return err(invalidArg(argD.value.toString(), `อาร์กิวเมนต์ของ ln ต้องมากกว่า 0 (ได้ ${argD.value.toString()})`));
      }
      const argR = exprToRational(e.arg);
      if (argR && argR.num === 1n && argR.den === 1n) return ok(new Decimal(0));
      return ok(Decimal.ln(argD.value));
    }
    default:
      return err({ code: 'unsupported-expression', messageTh: 'นิพจน์นี้ยังไม่รองรับ' });
  }
};

export { Decimal };

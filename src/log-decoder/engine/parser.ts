// ตัวแปลงข้อความอิสระ (free-text) ให้เป็น Expr/Equation
// ใช้ mathjs เฉพาะสำหรับ "โทเคน/พาร์สโครงสร้างเลขคณิต" เท่านั้น (ไม่ใช้ mathjs.simplify)
// รูปแบบ log แบบไทย/พิมพ์ทั่วไป (log_2(8), log2(8), log_2 8, log(x), ln(x)) จะถูกแปลงเป็น
// ไวยากรณ์ฟังก์ชันมาตรฐานก่อน (LOG(base,arg) / LN(arg)) แล้วค่อยส่งให้ mathjs.parse()

import { parse as mathjsParse } from 'mathjs';
import type { Equation, Expr } from './ast';
import { Add, Div, Frac, Int, Ln, Log, Mul, Neg, Pow, Var } from './ast';
import { type AppError, type Result, err, ok } from './errors';

// หา index ของวงเล็บปิดที่จับคู่กับวงเล็บเปิดที่ตำแหน่ง openIdx
const findMatchingParen = (s: string, openIdx: number): number => {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

// แปลง log/ln ทุกรูปแบบในสตริง ให้เป็น LOG(base,arg) หรือ LN(arg) หนึ่งรอบ
const transformOnce = (s: string): { result: string; changed: boolean } => {
  let result = '';
  let i = 0;
  let changed = false;
  const isWordChar = (c: string | undefined) => !!c && /[a-zA-Z0-9_§]/.test(c);

  while (i < s.length) {
    const rest = s.slice(i);
    const prevChar = i > 0 ? s[i - 1] : undefined;
    const boundaryOk = !isWordChar(prevChar);

    const lnMatch = boundaryOk && /^ln\b/i.test(rest) ? rest.match(/^ln/i) : null;
    const logBaseMatch = boundaryOk && /^log_?\s*(\d+(?:\.\d+)?)/i.test(rest)
      ? rest.match(/^log_?\s*(\d+(?:\.\d+)?)/i)
      : null;
    const logPlainMatch = boundaryOk && /^log\b/i.test(rest) && !logBaseMatch ? rest.match(/^log/i) : null;

    if (lnMatch || logBaseMatch || logPlainMatch) {
      const matchLen = (lnMatch ?? logBaseMatch ?? logPlainMatch)![0].length;
      let j = i + matchLen;
      while (s[j] === ' ') j++;
      let argRaw: string;
      if (s[j] === '(') {
        const close = findMatchingParen(s, j);
        if (close === -1) {
          result += s[i];
          i++;
          continue;
        }
        argRaw = s.slice(j + 1, close);
        j = close + 1;
      } else {
        const tokenMatch = s.slice(j).match(/^[a-zA-Z0-9._]+/);
        if (!tokenMatch) {
          result += s[i];
          i++;
          continue;
        }
        argRaw = tokenMatch[0];
        j += tokenMatch[0].length;
      }
      if (lnMatch) {
        result += `§LN(${argRaw})`;
      } else if (logBaseMatch) {
        result += `§LOG(${logBaseMatch[1]},${argRaw})`;
      } else {
        result += `§LOG(10,${argRaw})`;
      }
      changed = true;
      i = j;
    } else {
      result += s[i];
      i++;
    }
  }
  return { result, changed };
};

const preprocess = (raw: string): string => {
  let s = raw;
  for (let iter = 0; iter < 8; iter++) {
    const { result, changed } = transformOnce(s);
    s = result;
    if (!changed) break;
  }
  // เอาเครื่องหมาย § (ตัวคั่นชั่วคราวที่กันไม่ให้ regex จับ LOG/LN ที่แปลงแล้วซ้ำ) ออกก่อนส่งให้ mathjs
  return s.replace(/§/g, '');
};

// แปลงเลขทศนิยม/จำนวนเต็มจากสตริง เป็น Expr (Int หรือ Frac แบบ exact)
const numberStringToExpr = (raw: string): Expr => {
  if (!raw.includes('.')) return Int(BigInt(raw));
  const [intPart, fracPart] = raw.split('.');
  const den = 10n ** BigInt(fracPart.length);
  const sign = intPart.startsWith('-') ? -1n : 1n;
  const absIntPart = BigInt(intPart.replace('-', '') || '0');
  const numAbs = absIntPart * den + BigInt(fracPart);
  const numSigned = sign * numAbs;
  return numSigned % den === 0n ? Int(numSigned / den) : Frac(numSigned, den);
};

// mathjs Node -> Expr ของเรา (recursive descent บนผลลัพธ์ของ mathjs.parse)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeToExpr = (node: any): Result<Expr> => {
  switch (node.type) {
    case 'ConstantNode': {
      if (typeof node.value === 'number') {
        return ok(numberStringToExpr(String(node.value)));
      }
      return err({ code: 'unsupported-expression', messageTh: 'ค่าคงที่นี้ไม่รองรับ' });
    }
    case 'SymbolNode': {
      if (node.name === 'e' || node.name === 'pi') {
        return err({ code: 'unsupported-expression', messageTh: `ยังไม่รองรับค่าคงที่ ${node.name}` });
      }
      return ok(Var(node.name));
    }
    case 'ParenthesisNode':
      return nodeToExpr(node.content);
    case 'UnaryMinusNode':
    case 'UnaryPlusNode': {
      const inner = nodeToExpr(node.args ? node.args[0] : node.arg);
      if (!inner.ok) return inner;
      return ok(node.type === 'UnaryMinusNode' ? Neg(inner.value) : inner.value);
    }
    case 'OperatorNode': {
      const args = node.args.map(nodeToExpr);
      for (const a of args) if (!a.ok) return a;
      const vals = args.map((a: Result<Expr>) => (a as { ok: true; value: Expr }).value);
      switch (node.op) {
        case '+':
          return ok(Add(...vals));
        case '-':
          if (vals.length === 1) return ok(Neg(vals[0]));
          return ok(Add(vals[0], Neg(vals[1])));
        case '*':
          return ok(Mul(...vals));
        case '/':
          return ok(Div(vals[0], vals[1]));
        case '^':
          return ok(Pow(vals[0], vals[1]));
        case 'unaryMinus':
          return ok(Neg(vals[0]));
        default:
          return err({ code: 'unsupported-expression', messageTh: `ตัวดำเนินการ "${node.op}" ยังไม่รองรับ` });
      }
    }
    case 'FunctionNode': {
      const name = node.fn.name;
      const args = node.args.map(nodeToExpr);
      for (const a of args) if (!a.ok) return a;
      const vals = args.map((a: Result<Expr>) => (a as { ok: true; value: Expr }).value);
      if (name === 'LN') return ok(Ln(vals[0]));
      if (name === 'LOG') return ok(Log(vals[0], vals[1]));
      if (name === 'sqrt') return ok(Pow(vals[0], Frac(1n, 2n)));
      return err({ code: 'unsupported-expression', messageTh: `ฟังก์ชัน "${name}" ยังไม่รองรับ` });
    }
    default:
      return err({ code: 'unsupported-expression', messageTh: `ไม่เข้าใจโครงสร้างนิพจน์ (${node.type})` });
  }
};

const parseSide = (raw: string): Result<Expr> => {
  const pre = preprocess(raw);
  let node: unknown;
  try {
    node = mathjsParse(pre);
  } catch {
    return err({ code: 'parse-error', messageTh: `แปลความหมายนิพจน์ไม่ได้: "${raw}"`, raw });
  }
  return nodeToExpr(node);
};

// parseExpression: สำหรับโหมด "ทำให้ง่าย" (นิพจน์เดี่ยว ไม่มี =)
export const parseExpression = (raw: string): Result<Expr> => {
  const trimmed = raw.trim();
  if (trimmed === '') return err({ code: 'empty-input', messageTh: 'กรุณาป้อนนิพจน์ก่อนคำนวณ' });
  if (trimmed.includes('=')) {
    return err({ code: 'parse-error', messageTh: 'นิพจน์สำหรับ "ทำให้ง่าย" ต้องไม่มีเครื่องหมาย =', raw });
  }
  return parseSide(trimmed);
};

// parseEquation: สำหรับโหมด "แก้สมการ" (ต้องมี = เดียว)
export const parseEquation = (raw: string): Result<Equation> => {
  const trimmed = raw.trim();
  if (trimmed === '') return err({ code: 'empty-input', messageTh: 'กรุณาป้อนสมการก่อนแก้' });
  const parts = trimmed.split('=');
  if (parts.length !== 2) {
    return err({ code: 'parse-error', messageTh: 'สมการต้องมีเครื่องหมาย = เพียงหนึ่งตัว', raw });
  }
  const left = parseSide(parts[0]);
  if (!left.ok) return left;
  const right = parseSide(parts[1]);
  if (!right.ok) return right;
  return ok({ left: left.value, right: right.value });
};

export const _internal = { preprocess };
export const _errType: AppError | undefined = undefined;

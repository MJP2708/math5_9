// โครงสร้างข้อมูล AST (Abstract Syntax Tree) สำหรับนิพจน์ทางคณิตศาสตร์
// ใช้แทนทั้งนิพจน์ที่ผู้ใช้ป้อน และคำตอบแบบ exact (เช่น ln 50 / ln 2)
// จำนวนเต็ม/เศษส่วนเก็บเป็น bigint เพื่อความแม่นยำ ไม่ปัดเศษทิ้ง

export type Expr =
  | IntNode
  | FracNode
  | VarNode
  | AddNode
  | NegNode
  | MulNode
  | DivNode
  | PowNode
  | LogNode
  | LnNode;

// จำนวนเต็ม เช่น 3, -5
export interface IntNode {
  kind: 'int';
  value: bigint;
}

// เศษส่วนที่ลดรูปแล้ว (den > 0 และ den !== 1n)
export interface FracNode {
  kind: 'frac';
  num: bigint;
  den: bigint;
}

// ตัวแปร เช่น x
export interface VarNode {
  kind: 'var';
  name: string;
}

// ผลบวก (รองรับการบวกหลายพจน์ในโหนดเดียว)
export interface AddNode {
  kind: 'add';
  terms: Expr[];
}

// นิเสธ (ลบ/ติดลบ) เช่น -x
export interface NegNode {
  kind: 'neg';
  arg: Expr;
}

// ผลคูณ (รองรับการคูณหลายตัวประกอบในโหนดเดียว)
export interface MulNode {
  kind: 'mul';
  factors: Expr[];
}

// การหาร a / b (เก็บแยกจาก FracNode เพื่อรองรับตัวแปร เช่น 1/x)
export interface DivNode {
  kind: 'div';
  num: Expr;
  den: Expr;
}

// เลขยกกำลัง base^exp
export interface PowNode {
  kind: 'pow';
  base: Expr;
  exp: Expr;
}

// ลอการิทึม log_base(arg) — log(x) ฐาน 10 แทนด้วย base = IntNode(10)
export interface LogNode {
  kind: 'log';
  base: Expr;
  arg: Expr;
}

// ลอการิทึมธรรมชาติ ln(arg) — แยกจาก LogNode เพื่อให้ engine จับคู่สมบัติ
// เช่น "เปลี่ยนฐาน" ได้ตรงกับที่หนังสือเรียนสอน (ln = log ฐาน e)
export interface LnNode {
  kind: 'ln';
  arg: Expr;
}

// สมการ ซ้าย = ขวา
export interface Equation {
  left: Expr;
  right: Expr;
}

// ตัวช่วยสร้างโหนด (helper constructors) ใช้ตอนเขียน rule engine และเทสต์
export const Int = (value: bigint | number): IntNode => ({
  kind: 'int',
  value: typeof value === 'bigint' ? value : BigInt(value),
});

export const Frac = (num: bigint, den: bigint): FracNode => ({ kind: 'frac', num, den });

export const Var = (name: string): VarNode => ({ kind: 'var', name });

export const Add = (...terms: Expr[]): AddNode => ({ kind: 'add', terms });

export const Neg = (arg: Expr): NegNode => ({ kind: 'neg', arg });

export const Mul = (...factors: Expr[]): MulNode => ({ kind: 'mul', factors });

export const Div = (num: Expr, den: Expr): DivNode => ({ kind: 'div', num, den });

export const Pow = (base: Expr, exp: Expr): PowNode => ({ kind: 'pow', base, exp });

export const Log = (base: Expr, arg: Expr): LogNode => ({ kind: 'log', base, arg });

export const Ln = (arg: Expr): LnNode => ({ kind: 'ln', arg });

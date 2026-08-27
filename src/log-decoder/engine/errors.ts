// ประเภทข้อผิดพลาดที่ typed ทั้งหมด — ทุก error ต้องมีข้อความภาษาไทยติดมาด้วย
// เพื่อไม่ให้เกิด NaN เงียบๆ หรือหน้าจอว่างเปล่าเมื่อ input ไม่ถูกต้อง

export type AppError =
  | { code: 'empty-input'; messageTh: string }
  | { code: 'parse-error'; messageTh: string; raw: string }
  | { code: 'invalid-base'; messageTh: string; base: string }
  | { code: 'invalid-argument'; messageTh: string; argument: string }
  | { code: 'no-solution'; messageTh: string }
  | { code: 'all-roots-extraneous'; messageTh: string }
  | { code: 'unsupported-expression'; messageTh: string }
  | { code: 'physically-impossible'; messageTh: string };

// Result type แบบง่าย ใช้แทน exception ตลอดทั้ง engine
// เพื่อบังคับให้ผู้เรียกจัดการกรณี error เสมอ (ไม่มี throw ที่ไหลไปจนถึง UI)
export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <T>(error: AppError): Result<T> => ({ ok: false, error });

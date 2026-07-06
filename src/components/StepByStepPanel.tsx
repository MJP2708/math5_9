import { Math } from "./Math";
import type { RationalExponentResult } from "../lib/rationalExponent";

interface StepByStepPanelProps {
  result: RationalExponentResult;
}

type ErrorKind = Exclude<RationalExponentResult["kind"], "value">;

const errorTitle: Record<ErrorKind, string> = {
  "invalid-input": "ข้อมูลไม่ถูกต้อง",
  "zero-denominator": "ตัวส่วนของเลขชี้กำลังเป็น 0",
  "even-root-of-negative": "นิยามไม่ได้ในจำนวนจริง",
  "zero-negative-exponent": "หารด้วย 0 ไม่มีนิยาม",
  indeterminate: "ค่าไม่กำหนด (Indeterminate Form)",
};

export function StepByStepPanel({ result }: StepByStepPanelProps) {
  if (result.kind !== "value") {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
        <h3 className="mb-1 text-sm font-semibold">⚠ {errorTitle[result.kind]}</h3>
        <p className="text-sm leading-relaxed">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">ขั้นตอนการคำนวณ</h2>
      <ol className="flex flex-col gap-3">
        {result.steps.map((step, i) => (
          <li key={i} className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">{step.label}</span>
            <div className="overflow-x-auto rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <Math latex={step.latex} display />
            </div>
          </li>
        ))}
      </ol>
      {(!result.isExact || result.isHuge) && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {!result.isExact && "* ผลลัพธ์นี้เป็นจำนวนอตรรกยะ จึงแสดงเป็นค่าประมาณ (≈) ไม่ใช่ค่าที่แท้จริงทั้งหมด "}
          {result.isHuge && "* ผลลัพธ์มีขนาดใหญ่มาก ค่าที่แสดงอาจถูกปัดเศษหรือย่อรูปเพื่อความชัดเจน"}
        </p>
      )}
    </div>
  );
}

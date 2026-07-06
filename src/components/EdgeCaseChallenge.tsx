import { useEffect, useState } from "react";
import { HUGE_RESULT_NOTE, type RationalExponentResult } from "../lib/rationalExponent";

type TargetKey = "negative-even-root" | "zero-negative-exponent" | "zero-zero" | "overflow";

interface Target {
  key: TargetKey;
  title: string;
  hint: string;
  test: (result: RationalExponentResult) => boolean;
  explain: (result: RationalExponentResult, a: number, m: number, n: number) => string;
}

const TARGETS: Target[] = [
  {
    key: "negative-even-root",
    title: "1. ฐานติดลบ + รากเป็นเลขคู่",
    hint: "ลองปรับฐาน a ให้เป็นจำนวนลบ และปรับตัวส่วน n ให้เป็นเลขคู่",
    test: (r) => r.kind === "even-root-of-negative",
    explain: (r) => (r.kind === "even-root-of-negative" ? r.message : ""),
  },
  {
    key: "zero-negative-exponent",
    title: "2. ฐานเป็น 0 + เลขชี้กำลังติดลบ",
    hint: "ลองปรับฐาน a ให้เป็น 0 และปรับตัวเศษ m ให้เป็นจำนวนลบ",
    test: (r) => r.kind === "zero-negative-exponent",
    explain: (r) => (r.kind === "zero-negative-exponent" ? r.message : ""),
  },
  {
    key: "zero-zero",
    title: "3. 0 ยกกำลัง 0",
    hint: "ลองปรับฐาน a ให้เป็น 0 และปรับตัวเศษ m ให้เป็น 0 ด้วย",
    test: (r) => r.kind === "indeterminate",
    explain: (r) => (r.kind === "indeterminate" ? r.message : ""),
  },
  {
    key: "overflow",
    title: "4. ค่าล้น (Overflow)",
    hint: "ลองปรับฐาน a และเลขชี้กำลัง m/n ให้มีค่ามาก ๆ (เช่น a มากและ m มากพร้อมกัน) จนผลลัพธ์มีขนาดใหญ่มาก — พิมพ์ตัวเลขในช่องตัวเลขให้มากกว่าที่แถบเลื่อนลากถึงก็ได้",
    test: (r) => r.kind === "value" && r.isHuge,
    explain: (_r, a, m, n) => `${a}^(${m}/${n}) ${HUGE_RESULT_NOTE}`,
  },
];

interface EdgeCaseChallengeProps {
  a: number;
  m: number;
  n: number;
  result: RationalExponentResult;
}

export function EdgeCaseChallenge({ a, m, n, result }: EdgeCaseChallengeProps) {
  const [foundExplanations, setFoundExplanations] = useState<Partial<Record<TargetKey, string>>>({});

  useEffect(() => {
    for (const target of TARGETS) {
      if (target.test(result)) {
        setFoundExplanations((prev) => {
          if (prev[target.key]) return prev;
          return { ...prev, [target.key]: target.explain(result, a, m, n) };
        });
      }
    }
  }, [result, a, m, n]);

  const foundCount = Object.keys(foundExplanations).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">ท้าทาย: หาให้แตก</h2>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            พบแล้ว {foundCount} / {TARGETS.length}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ปรับตัวเลื่อน a, m, n ทางด้านซ้ายให้ค่าปัจจุบันตรงกับกรณีพิเศษแต่ละข้อด้านล่าง เมื่อทำได้ตรงกันระบบจะตรวจจับ
          ให้อัตโนมัติและอธิบายว่าทำไมค่านั้นจึงพิเศษ
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {TARGETS.map((target) => {
          const explanation = foundExplanations[target.key];
          const isFound = Boolean(explanation);
          return (
            <div
              key={target.key}
              className={`rounded-xl border p-4 shadow-sm transition-colors ${
                isFound
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-950/30"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isFound
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {isFound ? "✓" : "?"}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{target.title}</h3>
              </div>
              {isFound ? (
                <p className="mt-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">{explanation}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{target.hint}</p>
              )}
            </div>
          );
        })}
      </div>

      {foundCount === TARGETS.length && (
        <div className="rounded-xl border border-violet-300 bg-violet-50 p-4 text-sm font-medium text-violet-800 dark:border-violet-700/60 dark:bg-violet-950/40 dark:text-violet-200">
          🎉 ครบทั้ง 4 กรณีแล้ว! คุณเข้าใจข้อจำกัดของนิยามเลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนตรรกยะครบถ้วน
        </div>
      )}
    </div>
  );
}

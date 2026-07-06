import { useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import { Plot } from "../lib/plotly";
import { StepByStepPanel } from "./StepByStepPanel";
import { computeRationalExponent, evaluateFloatForGraph, rationalApproximationSequence } from "../lib/rationalExponent";

const STEPS = 6;
const X_MIN = 0.1;
const X_MAX = 10;
const X_STEP_COUNT = 120;

type TargetKey = "sqrt2" | "pi" | "e" | "custom";

const PRESET_TARGETS: Record<Exclude<TargetKey, "custom">, { label: string; decimalString: string }> = {
  sqrt2: { label: "√2", decimalString: new Decimal(2).sqrt().toFixed(20) },
  pi: { label: "π", decimalString: "3.14159265358979323846" },
  e: { label: "e", decimalString: "2.71828182845904523536" },
};

interface RationalToIrrationalBridgeProps {
  a: number;
}

export function RationalToIrrationalBridge({ a }: RationalToIrrationalBridgeProps) {
  const [targetKey, setTargetKey] = useState<TargetKey>("sqrt2");
  const [customInput, setCustomInput] = useState("1.61803398875");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { targetDecimal, targetError } = useMemo(() => {
    if (targetKey !== "custom") {
      return { targetDecimal: new Decimal(PRESET_TARGETS[targetKey].decimalString), targetError: null as string | null };
    }
    try {
      const d = new Decimal(customInput);
      if (!d.isFinite()) throw new Error("not finite");
      return { targetDecimal: d, targetError: null as string | null };
    } catch {
      return { targetDecimal: null, targetError: "รูปแบบตัวเลขไม่ถูกต้อง กรุณาพิมพ์ทศนิยม เช่น 1.61803398875" };
    }
  }, [targetKey, customInput]);

  const targetLabel = targetKey === "custom" ? customInput : PRESET_TARGETS[targetKey].label;
  const targetNumber = targetDecimal ? targetDecimal.toNumber() : NaN;

  const sequence = useMemo(
    () => (targetDecimal ? rationalApproximationSequence(targetDecimal, STEPS) : []),
    [targetDecimal]
  );

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [targetKey, customInput]);

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= sequence.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => Math.min(i + 1, sequence.length - 1)), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, sequence.length]);

  const current = sequence[stepIndex];
  const result = current ? computeRationalExponent(a, current.m, current.n) : null;

  const xs = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i <= X_STEP_COUNT; i++) arr.push(X_MIN + ((X_MAX - X_MIN) * i) / X_STEP_COUNT);
    return arr;
  }, []);

  const approxY = useMemo(
    () => (current ? xs.map((x) => evaluateFloatForGraph(x, current.m, current.n)) : []),
    [xs, current]
  );
  const limitY = useMemo(
    () => (Number.isFinite(targetNumber) ? xs.map((x) => Math.pow(x, targetNumber)) : []),
    [xs, targetNumber]
  );

  const isLast = stepIndex >= sequence.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-relaxed text-violet-900 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-200">
        นี่คือตัวอย่าง "ตัวอย่างล่วงหน้า" ของหัวข้อถัดไป คือเลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนอตรรกยะ (เช่น a
        <sup>√2</sup>) ซึ่งยังไม่มีนิยามตรง ๆ แต่เราสามารถ "เข้าใกล้" ค่านั้นได้ด้วยเลขยกกำลังที่มีเลขชี้กำลังเป็น
        จำนวนตรรกยะที่เรียนไปแล้วทั้งหมด — ทุกขั้นตอนด้านล่างนี้คำนวณด้วยเครื่องมือเดียวกับแท็บ "หลัก" ทุกประการ
        ไม่มีสูตรใหม่
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          เลือกเลขชี้กำลังอตรรกยะเป้าหมาย
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["sqrt2", "pi", "e", "custom"] as TargetKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTargetKey(key)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                targetKey === key
                  ? "bg-violet-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {key === "custom" ? "กำหนดเอง" : PRESET_TARGETS[key].label}
            </button>
          ))}
        </div>

        {targetKey === "custom" && (
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="เช่น 1.61803398875"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        )}

        {targetError && <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">⚠ {targetError}</p>}

        {!targetError && current && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.min(i + 1, sequence.length - 1))}
              disabled={isLast}
              className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              ค่าประมาณต่อไป
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              disabled={isLast && !isPlaying}
              className="rounded-md bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-100"
            >
              {isPlaying ? "หยุดเล่นอัตโนมัติ" : "เล่นอัตโนมัติ"}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              ขั้นที่ {stepIndex + 1} / {sequence.length}: m/n = {current.m}/{current.n} ≈{" "}
              {(current.m / current.n).toFixed(Math.max(0, stepIndex))}
            </span>
          </div>
        )}
      </div>

      {!targetError && result && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              กราฟลู่เข้า: f(x) = x<sup>m/n</sup> ({current.m}/{current.n}) เทียบกับ f(x) = x<sup>{targetLabel}</sup>
            </h2>
            <Plot
              data={[
                {
                  x: xs,
                  y: limitY,
                  type: "scatter",
                  mode: "lines",
                  name: `f(x) = x^${targetLabel} (เป้าหมาย, ค่าประมาณ)`,
                  line: { color: "#94a3b8", width: 2, dash: "dash" },
                },
                {
                  x: xs,
                  y: approxY,
                  type: "scatter",
                  mode: "lines",
                  name: `f(x) = x^(${current.m}/${current.n})`,
                  line: { color: "#7c3aed", width: 2.5 },
                  connectgaps: false,
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 50, r: 20, t: 10, b: 40 },
                xaxis: { range: [0, X_MAX], zeroline: true, title: { text: "x" } },
                yaxis: { range: [0, 20], zeroline: true, title: { text: "f(x)" } },
                legend: { orientation: "h", y: -0.25 },
                font: { family: "Sarabun, system-ui, sans-serif", size: 12 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
              }}
              useResizeHandler
              style={{ width: "100%", height: "360px" }}
              config={{ displaylogo: false, responsive: true }}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              เมื่อกด "ค่าประมาณต่อไป" เศษส่วน m/n จะมีตัวส่วนมากขึ้นทีละ 10 เท่า (ทศนิยมอีก 1 ตำแหน่ง) เส้นสีม่วง
              (เส้นตรรกยะ) จะขยับเข้าใกล้เส้นประสีเทา (เส้นเป้าหมายที่เป็นอตรรกยะ) มากขึ้นเรื่อย ๆ
            </p>
          </div>

          <StepByStepPanel result={result} />
        </>
      )}
    </div>
  );
}

import { SliderInput } from "./SliderInput";

interface ControlsProps {
  a: number;
  m: number;
  n: number;
  onChangeA: (value: number) => void;
  onChangeM: (value: number) => void;
  onChangeN: (value: number) => void;
  showPowerOverlay: boolean;
  showRootOverlay: boolean;
  onToggleShowPowerOverlay: (value: boolean) => void;
  onToggleShowRootOverlay: (value: boolean) => void;
  showOverlaySection?: boolean;
}

export function Controls({
  a,
  m,
  n,
  onChangeA,
  onChangeM,
  onChangeN,
  showPowerOverlay,
  showRootOverlay,
  onToggleShowPowerOverlay,
  onToggleShowRootOverlay,
  showOverlaySection = true,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">ปรับค่าตัวแปร</h2>

      <SliderInput label="ฐาน a" value={a} min={-10} max={10} step={0.5} onChange={onChangeA} accent="violet" />

      <div className="grid grid-cols-2 gap-4">
        <SliderInput label="ตัวเศษ m" value={m} min={-8} max={8} step={1} onChange={onChangeM} accent="teal" />
        <SliderInput label="ตัวส่วน n" value={n} min={1} max={8} step={1} onChange={onChangeN} accent="teal" />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        นิพจน์ปัจจุบัน: a<sup>m/n</sup> = {a}^({m}/{n})
      </p>

      {showOverlaySection && (
        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            เปรียบเทียบกราฟ (ฟีเจอร์เสริมความเข้าใจ)
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={showPowerOverlay}
                onChange={(e) => onToggleShowPowerOverlay(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              แสดง f(x) = x<sup>m</sup> (ยกกำลังอย่างเดียว)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={showRootOverlay}
                onChange={(e) => onToggleShowRootOverlay(e.target.checked)}
                className="h-4 w-4 accent-rose-500"
              />
              แสดง f(x) = <sup>n</sup>√x (ถอดรากอย่างเดียว)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

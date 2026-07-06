interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accent?: "violet" | "teal";
}

export function SliderInput({ label, value, min, max, step, onChange, accent = "violet" }: SliderInputProps) {
  const accentClass = accent === "violet" ? "accent-violet-600" : "accent-teal-600";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isNaN(next)) return;
            onChange(next);
          }}
          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-sm tabular-nums text-slate-900 focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-2 w-full cursor-pointer rounded-lg ${accentClass}`}
      />
    </div>
  );
}

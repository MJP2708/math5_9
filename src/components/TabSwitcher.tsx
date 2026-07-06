export type TabKey = "baseline" | "surface3d" | "bridge" | "challenge";

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: "baseline", label: "หลัก" },
  { key: "surface3d", label: "พื้นผิว 3D" },
  { key: "bridge", label: "ลู่เข้าสู่เลขชี้กำลังอตรรกยะ" },
  { key: "challenge", label: "ท้าทาย: หาให้แตก" },
];

interface TabSwitcherProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function TabSwitcher({ active, onChange }: TabSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-violet-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

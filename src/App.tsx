import { useMemo, useState } from "react";
import { Controls } from "./components/Controls";
import { GraphPanel } from "./components/GraphPanel";
import { StepByStepPanel } from "./components/StepByStepPanel";
import { Methodology } from "./components/Methodology";
import { TabSwitcher, type TabKey } from "./components/TabSwitcher";
import { Surface3D } from "./components/Surface3D";
import { RationalToIrrationalBridge } from "./components/RationalToIrrationalBridge";
import { EdgeCaseChallenge } from "./components/EdgeCaseChallenge";
import { computeRationalExponent } from "./lib/rationalExponent";

function App() {
  const [tab, setTab] = useState<TabKey>("baseline");
  const [a, setA] = useState(8);
  const [m, setM] = useState(2);
  const [n, setN] = useState(3);
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [showRootOverlay, setShowRootOverlay] = useState(false);

  const result = useMemo(() => computeRationalExponent(a, m, n), [a, m, n]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <header>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนตรรกยะ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            สำรวจค่า a<sup>m/n</sup> แบบอินเทอร์แอกทีฟ พร้อมกราฟและขั้นตอนการคำนวณแบบละเอียด
          </p>
        </header>

        <TabSwitcher active={tab} onChange={setTab} />

        <main className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-6">
            <Controls
              a={a}
              m={m}
              n={n}
              onChangeA={setA}
              onChangeM={setM}
              onChangeN={setN}
              showPowerOverlay={showPowerOverlay}
              showRootOverlay={showRootOverlay}
              onToggleShowPowerOverlay={setShowPowerOverlay}
              onToggleShowRootOverlay={setShowRootOverlay}
              showOverlaySection={tab === "baseline"}
            />
          </div>

          <div className="flex flex-col gap-6">
            {tab === "baseline" && (
              <>
                <GraphPanel a={a} m={m} n={n} showPowerOverlay={showPowerOverlay} showRootOverlay={showRootOverlay} />
                <StepByStepPanel result={result} />
              </>
            )}
            {tab === "surface3d" && <Surface3D a={a} m={m} n={n} />}
            {tab === "bridge" && <RationalToIrrationalBridge a={a} />}
            {tab === "challenge" && <EdgeCaseChallenge a={a} m={m} n={n} result={result} />}
          </div>
        </main>

        {tab === "baseline" && <Methodology />}
      </div>
    </div>
  );
}

export default App;

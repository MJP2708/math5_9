import { useMemo, useState } from "react";
import { Controls } from "../components/Controls";
import { GraphPanel } from "../components/GraphPanel";
import { StepByStepPanel } from "../components/StepByStepPanel";
import { Methodology } from "../components/Methodology";
import { TabSwitcher, type TabKey } from "../components/TabSwitcher";
import { Surface3D } from "../components/Surface3D";
import { RationalToIrrationalBridge } from "../components/RationalToIrrationalBridge";
import { EdgeCaseChallenge } from "../components/EdgeCaseChallenge";
import { computeRationalExponent } from "../lib/rationalExponent";

export function CalculatorPage() {
  const [tab, setTab] = useState<TabKey>("baseline");
  const [a, setA] = useState(8);
  const [m, setM] = useState(2);
  const [n, setN] = useState(3);
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [showRootOverlay, setShowRootOverlay] = useState(false);

  const result = useMemo(() => computeRationalExponent(a, m, n), [a, m, n]);

  return (
    <>
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
    </>
  );
}

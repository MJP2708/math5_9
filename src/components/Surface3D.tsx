import { useMemo } from "react";
import { Plot } from "../lib/plotly";
import { evaluateFloatForGraph, evaluateSurfaceGrid, simplifyFraction } from "../lib/rationalExponent";

const X_MIN = -10;
const X_MAX = 10;
const X_STEP = 0.4;
const M_MIN = -8;
const M_MAX = 8;
const Z_CLAMP = 12;

/** Clamps to +-Z_CLAMP so a few huge values (e.g. x^8) don't turn the whole surface into
 * a near-vertical wall — NaN (a genuine domain gap) is left untouched. */
function clampZ(z: number): number {
  if (Number.isNaN(z)) return z;
  return Math.max(-Z_CLAMP, Math.min(Z_CLAMP, z));
}

interface Surface3DProps {
  a: number;
  m: number;
  n: number;
}

export function Surface3D({ a, m, n }: Surface3DProps) {
  const { n: simplifiedN } = useMemo(() => simplifyFraction(m, n), [m, n]);

  const xs = useMemo(() => {
    const arr: number[] = [];
    for (let x = X_MIN; x <= X_MAX + 1e-9; x += X_STEP) arr.push(Math.round(x * 100) / 100);
    return arr;
  }, []);

  const ms = useMemo(() => {
    const arr: number[] = [];
    for (let mi = M_MIN; mi <= M_MAX; mi++) arr.push(mi);
    return arr;
  }, []);

  const zGrid = useMemo(
    () => evaluateSurfaceGrid(xs, ms, simplifiedN).map((row) => row.map(clampZ)),
    [xs, ms, simplifiedN]
  );

  const sliceZ = useMemo(
    () => xs.map((x) => clampZ(evaluateFloatForGraph(x, m, simplifiedN))),
    [xs, m, simplifiedN]
  );
  const markerZRaw = evaluateFloatForGraph(a, m, simplifiedN);
  const markerZ = clampZ(markerZRaw);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        พื้นผิว 3 มิติ z = x<sup>m/n</sup> (n คงที่ = {simplifiedN})
      </h2>
      <Plot
        data={[
          {
            x: xs,
            y: ms,
            z: zGrid,
            type: "surface",
            colorscale: "Viridis",
            showscale: false,
            opacity: 0.92,
            contours: { z: { show: false } },
            hovertemplate: "x = %{x}<br>m = %{y}<br>z = %{z:.4f}<extra></extra>",
          },
          {
            x: xs,
            y: xs.map(() => m),
            z: sliceZ,
            type: "scatter3d",
            mode: "lines",
            name: `เส้นตัด m = ${m} (ค่าจากแท็บหลัก)`,
            line: { color: "#0f172a", width: 6 },
          },
          ...(Number.isFinite(markerZRaw)
            ? [
                {
                  x: [a],
                  y: [m],
                  z: [markerZ],
                  type: "scatter3d" as const,
                  mode: "markers" as const,
                  name: `จุดปัจจุบัน (a=${a}, m=${m})`,
                  marker: { color: "#dc2626", size: 5 },
                },
              ]
            : []),
        ]}
        layout={{
          autosize: true,
          margin: { l: 0, r: 0, t: 10, b: 0 },
          scene: {
            xaxis: { title: { text: "x" }, range: [X_MIN, X_MAX] },
            yaxis: { title: { text: "m (ตัวเศษของเลขชี้กำลัง)" }, range: [M_MIN, M_MAX] },
            zaxis: { title: { text: "z = x^(m/n)" }, range: [-Z_CLAMP, Z_CLAMP] },
          },
          font: { family: "Sarabun, system-ui, sans-serif", size: 11 },
          paper_bgcolor: "rgba(0,0,0,0)",
          showlegend: true,
          legend: { orientation: "h", y: -0.05 },
        }}
        useResizeHandler
        style={{ width: "100%", height: "520px" }}
        config={{ displaylogo: false, responsive: true }}
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        แกน x คือฐาน แกน m คือตัวเศษของเลขชี้กำลังก่อนลดรูป (ตัวส่วน n ที่ป้อนคงที่เท่ากับค่า n ปัจจุบันจากแท็บหลัก)
        และแกนตั้ง z คือค่า x<sup>m/n</sup> ที่คำนวณได้ เส้นสีดำคือค่า m ปัจจุบันจากแท็บ "หลัก" และจุดสีแดงคือค่า a
        ปัจจุบัน — หมุนพื้นผิวเพื่อดูว่ากราฟ 2 มิติในแท็บหลักเป็นเพียงเส้นตัดเส้นหนึ่งของพื้นผิวนี้เอง (ค่าที่สูง/ต่ำเกิน
        ±{Z_CLAMP} ถูกตัดปลายให้แบนไว้เพื่อให้เห็นรูปทรงโดยรวมชัดเจน ไม่ได้หมายความว่าค่าจริงเท่ากับ {Z_CLAMP})
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        สังเกตว่าส่วนที่ขาดหายไปทางฝั่ง x เป็นลบไม่ได้หายไปทั้งแถบ แต่ขาดเป็นแนวสลับกันไปตามค่า m — เพราะเมื่อ m
        คู่กับ n ลดรูปกันได้ (เช่น m/n = 4/2 = 2/1) เลขชี้กำลังจะกลายเป็นจำนวนเต็มซึ่งนิยามได้แม้ฐานเป็นลบ ส่วนแถวที่ m
        กับ n ลดรูปกันไม่ได้ (ตัวส่วนหลังลดรูปยังเป็นเลขคู่) จึงนิยามไม่ได้เมื่อ x เป็นลบ — เป็นการยืนยันภาพว่าทำไมการ
        ลดรูปเศษส่วนก่อนคำนวณจึงสำคัญ ตรงกับหลักการในแท็บ "หลัก"
      </p>
    </div>
  );
}

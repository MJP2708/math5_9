import { useMemo } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-basic-dist-min";
import { evaluateFloatForGraph, simplifyFraction } from "../lib/rationalExponent";

const Plot = createPlotlyComponent(Plotly);

const X_MIN = -10;
const X_MAX = 10;
const STEP = 0.05;

interface GraphPanelProps {
  a: number;
  m: number;
  n: number;
  showPowerOverlay: boolean;
  showRootOverlay: boolean;
}

function pureIntegerPower(x: number, m: number): number {
  if (x === 0 && m <= 0) return NaN;
  return Math.pow(x, m);
}

export function GraphPanel({ a, m, n, showPowerOverlay, showRootOverlay }: GraphPanelProps) {
  const { simplifiedN } = useMemo(() => {
    const s = simplifyFraction(m, n);
    return { simplifiedM: s.m, simplifiedN: s.n };
  }, [m, n]);

  const xs = useMemo(() => {
    const arr: number[] = [];
    for (let x = X_MIN; x <= X_MAX + 1e-9; x += STEP) arr.push(Math.round(x * 1000) / 1000);
    return arr;
  }, []);

  const mainY = useMemo(() => xs.map((x) => evaluateFloatForGraph(x, m, n)), [xs, m, n]);
  const powerY = useMemo(() => (showPowerOverlay ? xs.map((x) => pureIntegerPower(x, m)) : []), [xs, m, showPowerOverlay]);
  const rootY = useMemo(
    () => (showRootOverlay ? xs.map((x) => evaluateFloatForGraph(x, 1, n)) : []),
    [xs, n, showRootOverlay]
  );

  const markerY = evaluateFloatForGraph(a, m, n);
  const isDomainRestricted = simplifiedN % 2 === 0;

  const shapes = isDomainRestricted
    ? [
        {
          type: "rect" as const,
          xref: "x" as const,
          yref: "paper" as const,
          x0: X_MIN,
          x1: 0,
          y0: 0,
          y1: 1,
          fillcolor: "rgba(244, 63, 94, 0.08)",
          line: { width: 0 },
        },
      ]
    : [];

  const annotations = isDomainRestricted
    ? [
        {
          x: X_MIN / 2,
          y: 1,
          xref: "x" as const,
          yref: "paper" as const,
          text: "ไม่มีนิยามในจำนวนจริง (x < 0)",
          showarrow: false,
          yshift: -10,
          font: { size: 11, color: "#e11d48" },
        },
      ]
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        กราฟ f(x) = x<sup>m/n</sup>
      </h2>
      <Plot
        data={[
          {
            x: xs,
            y: mainY,
            type: "scatter",
            mode: "lines",
            name: "f(x) = x^(m/n)",
            line: { color: "#7c3aed", width: 2.5 },
            connectgaps: false,
            hovertemplate: "x = %{x}<br>f(x) = %{y:.4f}<extra></extra>",
          },
          ...(showPowerOverlay
            ? [
                {
                  x: xs,
                  y: powerY,
                  type: "scatter" as const,
                  mode: "lines" as const,
                  name: "f(x) = x^m",
                  line: { color: "#f59e0b", width: 1.5, dash: "dot" as const },
                  connectgaps: false,
                },
              ]
            : []),
          ...(showRootOverlay
            ? [
                {
                  x: xs,
                  y: rootY,
                  type: "scatter" as const,
                  mode: "lines" as const,
                  name: "f(x) = ⁿ√x",
                  line: { color: "#e11d48", width: 1.5, dash: "dot" as const },
                  connectgaps: false,
                },
              ]
            : []),
          ...(Number.isFinite(markerY)
            ? [
                {
                  x: [a],
                  y: [markerY],
                  type: "scatter" as const,
                  mode: "markers" as const,
                  name: `จุดปัจจุบัน (a = ${a})`,
                  marker: { color: "#0f172a", size: 10, symbol: "circle" as const },
                  hovertemplate: `a = %{x}<br>ผลลัพธ์ = %{y:.6f}<extra></extra>`,
                },
              ]
            : []),
        ]}
        layout={{
          autosize: true,
          margin: { l: 50, r: 20, t: 10, b: 40 },
          xaxis: { range: [X_MIN, X_MAX], zeroline: true, title: { text: "x" } },
          yaxis: { range: [-10, 10], zeroline: true, title: { text: "f(x)" } },
          legend: { orientation: "h", y: -0.2 },
          shapes,
          annotations,
          font: { family: "Sarabun, system-ui, sans-serif", size: 12 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }}
        useResizeHandler
        style={{ width: "100%", height: "420px" }}
        config={{ displaylogo: false, responsive: true }}
      />
    </div>
  );
}

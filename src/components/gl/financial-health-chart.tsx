"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface FinancialHealthChartProps {
  metrics: { label: string; value: number; maxValue: number }[];
  className?: string;
  height?: number;
}

export const FinancialHealthChart = memo(function FinancialHealthChart({ metrics, className, height = 300 }: FinancialHealthChartProps) {
  if (metrics.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const width = 800;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(cx, cy) - 50;
  const n = metrics.length;
  const angleStep = (2 * Math.PI) / n;

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Financial Health Radar</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {gridLevels.map((level) => {
          const r = maxR * level;
          const points = Array.from({ length: n }, (_, i) => {
            const p = polarToCartesian(cx, cy, r, i * angleStep);
            return `${p.x},${p.y}`;
          }).join(" ");

          return (
            <polygon key={level} points={points} fill="none" stroke="rgb(63 63 70)" strokeWidth="0.5" />
          );
        })}

        {Array.from({ length: n }).map((_, i) => {
          const p = polarToCartesian(cx, cy, maxR, i * angleStep);
          return (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
          );
        })}

        {(() => {
          const dataPoints = metrics.map((m, i) => {
            const r = Math.min((m.value / (m.maxValue || 1)) * maxR, maxR);
            return polarToCartesian(cx, cy, r, i * angleStep);
          });
          const dataPointsStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

          return (
            <>
              <polygon points={dataPointsStr} fill="#d4af37" opacity="0.2" stroke="#d4af37" strokeWidth="2" />
              {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#d4af37" stroke="#1a1a24" strokeWidth="2">
                  <title>{metrics[i].label}: {((metrics[i].value / (metrics[i].maxValue || 1)) * 100).toFixed(0)}%</title>
                </circle>
              ))}
            </>
          );
        })()}

        {metrics.map((m, i) => {
          const p = polarToCartesian(cx, cy, maxR + 20, i * angleStep);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" className="fill-zinc-400" fontSize="9" fontWeight="medium">
              {m.label.length > 14 ? m.label.slice(0, 14) + "…" : m.label}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-12 overflow-hidden rounded-full bg-zinc-700">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${Math.min((m.value / (m.maxValue || 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-zinc-500">{m.label.slice(0, 6)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

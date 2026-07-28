"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { GLChartDataPoint } from "./gl-types";

interface FxImpactChartProps {
  data: GLChartDataPoint[];
  className?: string;
  height?: number;
}

export const FxImpactChart = memo(function FxImpactChart({ data, className, height = 240 }: FxImpactChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxAbs = Math.max(...values.map(Math.abs), 1);
  const width = 800;
  const midY = height / 2;

  function toY(value: number): number {
    return midY - (value / (maxAbs * 1.2)) * (midY - 20);
  }

  function toX(i: number): number {
    return (i / Math.max(data.length - 1, 1)) * (width - 40) + 20;
  }

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">FX Gain/Loss Over Time</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fxGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = 20 + (height - 40) * pct;
          const val = (maxAbs * 1.2) * (1 - 2 * pct);
          return (
            <g key={pct}>
              <line x1="20" y1={y} x2={width - 20} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 16} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                ${(val / 1_000).toFixed(0)}K
              </text>
            </g>
          );
        })}

        <line x1="20" y1={midY} x2={width - 20} y2={midY} stroke="rgb(82 82 91)" strokeWidth="1" strokeDasharray="4 2" />

        <polyline points={points} fill="none" stroke="url(#fxGradient)" strokeWidth="2" />

        <path d={`M${toX(0)},${midY} L${points} L${toX(data.length - 1)},${midY} Z`} fill="url(#fxGradient)" opacity="0.3" />

        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.value)} r="3" fill={d.value >= 0 ? "#10b981" : "#ef4444"} stroke="#1a1a24" strokeWidth="1.5">
            <title>{d.period}: ${(d.value / 1_000).toFixed(1)}K</title>
          </circle>
        ))}

        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={`label-${i}`} x={toX(idx)} y={height - 4} textAnchor="middle" className="fill-zinc-600" fontSize="8">
              {d.period.length > 6 ? d.period.slice(0, 6) : d.period}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-zinc-400">Gain</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-[11px] text-zinc-400">Loss</span>
        </div>
      </div>
    </div>
  );
});

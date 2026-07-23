"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { GLChartDataPoint } from "./gl-types";

interface KpiChartProps {
  data: GLChartDataPoint[];
  className?: string;
  height?: number;
}

export const KpiChart = memo(function KpiChart({ data, className, height = 240 }: KpiChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;
  const width = 800;

  function toY(value: number): number {
    return height - 20 - ((value - minVal) / range) * (height - 40);
  }

  function toX(i: number): number {
    return (i / Math.max(data.length - 1, 1)) * (width - 40) + 20;
  }

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const prevPoints = data.filter((d) => d.previousValue !== undefined).map((d, i) => {
    const idx = data.indexOf(d);
    return `${toX(idx)},${toY(d.previousValue!)}`;
  }).join(" ");

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">KPI Trend</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="kpiLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = toY(minVal + range * pct);
          return (
            <g key={pct}>
              <line x1="20" y1={y} x2={width - 20} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 16} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                {(minVal + range * pct).toFixed(0)}
              </text>
            </g>
          );
        })}

        {prevPoints && (
          <polyline points={prevPoints} fill="none" stroke="rgb(82 82 91)" strokeWidth="1.5" strokeDasharray="4 2" />
        )}

        <polyline points={points} fill="none" stroke="#d4af37" strokeWidth="2" />

        <path d={`M${toX(0)},${height - 20} L${points} L${toX(data.length - 1)},${height - 20} Z`} fill="url(#kpiLine)" />

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.value)} r="3" fill="#d4af37" stroke="#1a1a1a" strokeWidth="1.5">
              <title>{d.period}: {d.value.toFixed(2)}</title>
            </circle>
          </g>
        ))}

        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={`label-${i}`} x={toX(idx)} y={height - 4} textAnchor="middle" className="fill-zinc-600" fontSize="8">
              {d.period.length > 8 ? d.period.slice(0, 8) : d.period}
            </text>
          );
        })}
      </svg>
    </div>
  );
});

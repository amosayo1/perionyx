"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { GLChartDataPoint } from "./gl-types";

interface AccountBalanceChartProps {
  data: GLChartDataPoint[];
  className?: string;
  height?: number;
}

export const AccountBalanceChart = memo(function AccountBalanceChart({ data, className, height = 240 }: AccountBalanceChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values.map(Math.abs), 1);
  const width = 800;
  const barWidth = Math.max(8, (width / data.length) * 0.5);
  const midY = height / 2;

  function toY(value: number): number {
    return midY - (value / maxVal) * (midY - 20);
  }

  function toX(i: number): number {
    return (i * (width / data.length)) + (width / data.length - barWidth) / 2;
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Account Balance Comparison</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = 20 + (height - 40) * pct;
          return (
            <g key={pct}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 4} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                ${((maxVal * (1 - 2 * pct)) / 1_000).toFixed(0)}K
              </text>
            </g>
          );
        })}

        <line x1="0" y1={midY} x2={width} y2={midY} stroke="rgb(82 82 91)" strokeWidth="1" />

        {data.map((d, i) => {
          const x = toX(i);
          const isPositive = d.value >= 0;
          const barH = Math.max(1, Math.abs((d.value / maxVal) * (midY - 20)));
          const y = isPositive ? midY - barH : midY;

          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill={isPositive ? "#10b981" : "#ef4444"} opacity="0.8" rx="2">
                <title>{d.period}: ${(d.value / 1_000).toFixed(1)}K</title>
              </rect>
              {d.previousValue !== undefined && (
                <line x1={x} y1={toY(d.previousValue)} x2={x + barWidth} y2={toY(d.previousValue)} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="3 2" />
              )}
            </g>
          );
        })}

        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={`label-${i}`} x={toX(idx) + barWidth / 2} y={height - 4} textAnchor="middle" className="fill-zinc-600" fontSize="8">
              {d.period.length > 6 ? d.period.slice(0, 6) : d.period}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[11px] text-zinc-400">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span className="text-[11px] text-zinc-400">Negative</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-gold" />
          <span className="text-[11px] text-zinc-400">Previous</span>
        </div>
      </div>
    </div>
  );
});

"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface ExpenseBreakdownChartProps {
  data: { category: string; amount: number }[];
  className?: string;
  height?: number;
}

const BAR_COLORS = ["#d4af37", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

export const ExpenseBreakdownChart = memo(function ExpenseBreakdownChart({ data, className, height = 240 }: ExpenseBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const width = 800;
  const barHeight = Math.max(4, (height - 40) / data.length * 0.7);
  const gap = (height - 40) / data.length * 0.3;

  function toX(value: number): number {
    return (value / maxVal) * (width - 100) + 100;
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Expense by Category</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const x = toX(maxVal * pct);
          return (
            <g key={pct}>
              <line x1={x} y1="10" x2={x} y2={height - 10} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={x} y={height - 14} textAnchor="middle" className="fill-zinc-600" fontSize="8">
                ${(maxVal * pct / 1_000).toFixed(0)}K
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = 100;
          const y = 15 + i * ((height - 30) / data.length);
          const barW = Math.max(2, toX(d.amount) - x);
          return (
            <g key={i}>
              <text x={96} y={y + barHeight / 2 + 3} textAnchor="end" className="fill-zinc-400" fontSize="10">
                {d.category.length > 15 ? d.category.slice(0, 15) + "…" : d.category}
              </text>
              <rect x={x} y={y} width={barW} height={barHeight} fill={BAR_COLORS[i % BAR_COLORS.length]} opacity="0.85" rx="2">
                <title>{d.category}: ${(d.amount / 1_000).toFixed(1)}K</title>
              </rect>
              <text x={x + barW + 6} y={y + barHeight / 2 + 3} className="fill-zinc-500" fontSize="9">
                ${(d.amount / 1_000).toFixed(0)}K
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

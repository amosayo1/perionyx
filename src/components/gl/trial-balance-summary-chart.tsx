"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface TrialBalanceSummaryChartProps {
  categories: { name: string; debit: number; credit: number }[];
  className?: string;
  height?: number;
}

export const TrialBalanceSummaryChart = memo(function TrialBalanceSummaryChart({ categories, className, height = 240 }: TrialBalanceSummaryChartProps) {
  if (categories.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...categories.flatMap((c) => [c.debit, c.credit]), 1);
  const width = 800;

  function toX(value: number): number {
    return (value / maxVal) * (width / 2 - 40);
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Trial Balance Summary</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <line x1={width / 2} y1="10" x2={width / 2} y2={height - 10} stroke="rgb(82 82 91)" strokeWidth="1" />

        <text x={width / 2 - 8} y="10" textAnchor="end" className="fill-zinc-500" fontSize="10" fontWeight="bold">Debit</text>
        <text x={width / 2 + 8} y="10" textAnchor="start" className="fill-zinc-500" fontSize="10" fontWeight="bold">Credit</text>

        {categories.map((cat, i) => {
          const y = 25 + i * ((height - 40) / categories.length);
          const barH = Math.max(4, ((height - 40) / categories.length) * 0.7);

          return (
            <g key={i}>
              <text x={width / 2} y={y + barH / 2 + 3} textAnchor="middle" className="fill-zinc-400" fontSize="9" fontWeight="medium">
                {cat.name.length > 12 ? cat.name.slice(0, 12) + "…" : cat.name}
              </text>

              {cat.debit > 0 && (
                <rect x={width / 2 - toX(cat.debit)} y={y} width={toX(cat.debit)} height={barH} fill="#d4af37" opacity="0.85" rx="2">
                  <title>{cat.name} Debit: ${(cat.debit / 1_000).toFixed(1)}K</title>
                </rect>
              )}

              {cat.credit > 0 && (
                <rect x={width / 2} y={y} width={toX(cat.credit)} height={barH} fill="#3b82f6" opacity="0.85" rx="2">
                  <title>{cat.name} Credit: ${(cat.credit / 1_000).toFixed(1)}K</title>
                </rect>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gold" />
          <span className="text-[11px] text-zinc-400">Debit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          <span className="text-[11px] text-zinc-400">Credit</span>
        </div>
      </div>
    </div>
  );
});

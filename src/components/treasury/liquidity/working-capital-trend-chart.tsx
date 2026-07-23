"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA } from "./data";

export function WorkingCapitalTrendChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.workingCapital;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Working Capital Trend</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Monthly net working capital evolution</p>
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end">
          {data.map((point, i) => {
            const h = range > 0 ? ((point.value - min) / range) * 160 + 8 : 80;
            const isPositive = point.value >= 0;
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">{fmt(point.value)}</span>
                <div className={cn("w-full mx-0.5 rounded-t transition-all",
                  isPositive ? "bg-gradient-to-t from-emerald-500/60 to-emerald-500/30" : "bg-gradient-to-t from-red-500/60 to-red-500/30")}
                  style={{ height: `${Math.max(4, h)}px` }} role="img" aria-label={`${point.label}: ${fmt(point.value)}`} />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function fmt(v: number): string { return v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(0)}M` : `$${(v / 1_000).toFixed(0)}K`; }

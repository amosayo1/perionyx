"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA, MOCK_COVERAGE_METRICS } from "./data";

export function CoverageRatioChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.coverage;
  const max = Math.max(...data.map((d) => d.value));
  const target = 2.0;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Coverage Ratios</h3>
          <p className="text-[12px] text-zinc-500">Trend & current metrics</p>
        </div>
        <div className="flex items-center gap-3 text-[12px]">
          <div className="text-right"><p className="text-zinc-500">Current</p><p className="text-emerald-400 font-medium">{MOCK_COVERAGE_METRICS.currentRatio.toFixed(1)}x</p></div>
          <div className="text-right"><p className="text-zinc-500">Quick</p><p className="text-emerald-400 font-medium">{MOCK_COVERAGE_METRICS.quickRatio.toFixed(1)}x</p></div>
          <div className="text-right"><p className="text-zinc-500">Cash</p><p className="text-amber-400 font-medium">{MOCK_COVERAGE_METRICS.cashRatio.toFixed(1)}x</p></div>
        </div>
      </div>
      <div className="relative h-40">
        <div className="absolute inset-0 flex items-end">
          {data.map((point, i) => {
            const h = max > 0 ? (point.value / max) * 140 : 70;
            const isAbove = point.value >= target;
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">{point.value.toFixed(1)}x</span>
                <div className={cn("w-full mx-0.5 rounded-t transition-all",
                  isAbove ? "bg-gradient-to-t from-emerald-500/60 to-emerald-500/30" : "bg-gradient-to-t from-red-500/60 to-red-500/30")}
                  style={{ height: `${Math.max(6, h)}px` }} role="img" aria-label={`${point.label}: ${point.value.toFixed(1)}x`} />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500 text-center">Target: {target.toFixed(1)}x coverage ratio</p>
    </div>
  );
}

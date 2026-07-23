"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA, MOCK_LIQUIDITY_SUMMARY } from "./data";

export function ForecastAccuracyChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.forecastAccuracy;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Forecast Accuracy</h3>
          <p className="text-[12px] text-zinc-500">Monthly forecast vs actual performance</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-zinc-500">Current</p>
          <p className={cn("text-lg font-semibold", MOCK_LIQUIDITY_SUMMARY.forecastConfidence >= 80 ? "text-emerald-400" : "text-amber-400")}>
            {MOCK_LIQUIDITY_SUMMARY.forecastConfidence}%
          </p>
        </div>
      </div>
      <div className="relative h-40">
        <div className="absolute inset-0 flex items-end">
          {data.map((point, i) => {
            const target = 85;
            const h = (point.value / 100) * 140;
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">{point.value}%</span>
                <div className={cn("w-full mx-0.5 rounded-t transition-all",
                  point.value >= target ? "bg-gradient-to-t from-emerald-500/60 to-emerald-500/30" :
                  point.value >= 70 ? "bg-gradient-to-t from-amber-500/60 to-amber-500/30" :
                  "bg-gradient-to-t from-red-500/60 to-red-500/30")}
                  style={{ height: `${Math.max(6, h)}px` }} role="img" aria-label={`${point.label}: ${point.value}%`} />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500 text-center">Target: 85% accuracy</p>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA } from "./data";

export function VaRTrendChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.varTrend;
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">VaR Trend</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Value at Risk (95% 1 day)</p>
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end">
          {data.map((point) => {
            const height = range > 0 ? Math.max(8, ((point.value - minVal) / range) * 140 + 20) : 80;
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">${point.value.toFixed(1)}M</span>
                <div
                  className="w-full mx-0.5 rounded-t bg-gradient-to-t from-red-500/60 via-orange-500/40 to-amber-500/20 transition-all hover:from-red-500/80 hover:via-orange-500/60 hover:to-amber-500/40"
                  style={{ height: `${height}px` }}
                  role="img"
                  aria-label={`${point.label}: $${point.value.toFixed(1)}M VaR`}
                />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

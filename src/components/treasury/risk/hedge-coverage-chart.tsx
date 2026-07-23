"use client";

import { cn } from "@/lib/utils";
import { MOCK_HEDGES } from "./data";

export function HedgeCoverageChart({ className }: { className?: string }) {
  const top = MOCK_HEDGES.slice(0, 12);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">Hedge Coverage</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Coverage ratio by position</p>
      <div className="space-y-2">
        {top.map((h) => {
          const pct = h.coveragePercent;
          const barColor = pct > 80
            ? "bg-emerald-500/60"
            : pct > 60
              ? "bg-blue-500/60"
              : "bg-red-500/60";
          return (
            <div key={h.id}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 truncate max-w-[160px]">{h.instrument}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "font-medium",
                    pct > 80 ? "text-emerald-400" : pct > 60 ? "text-blue-400" : "text-red-400",
                  )}>{h.coveragePercent}%</span>
                  <span className="text-zinc-500 text-[11px]">{fmt(h.notionalAmount)}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${h.instrument}: ${h.coveragePercent}% coverage`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

"use client";

import { cn } from "@/lib/utils";
import { MOCK_FX_EXPOSURES } from "./data";

export function FXDistributionChart({ className }: { className?: string }) {
  const grouped: Record<string, number> = {};
  for (const fx of MOCK_FX_EXPOSURES) {
    grouped[fx.currency] = (grouped[fx.currency] ?? 0) + fx.netExposure;
  }
  const sorted = Object.entries(grouped)
    .map(([currency, net]) => ({ currency, net }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s.net)));

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">FX Distribution</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Net exposure by currency</p>
      <div className="space-y-2">
        {sorted.map((s) => {
          const pct = maxAbs > 0 ? (Math.abs(s.net) / maxAbs) * 100 : 0;
          const isLong = s.net >= 0;
          return (
            <div key={s.currency}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 font-medium w-8">{s.currency}</span>
                </div>
                <span className={cn("font-medium", isLong ? "text-emerald-400" : "text-red-400")}>
                  {isLong ? "+" : ""}{fmt(s.net)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className={cn("h-full rounded-full transition-all", isLong ? "bg-emerald-500/60" : "bg-red-500/60")}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.currency}: ${isLong ? "long" : "short"} ${fmt(s.net)}`}
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
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(0)}M`;
  return `$${(abs / 1_000).toFixed(0)}K`;
}

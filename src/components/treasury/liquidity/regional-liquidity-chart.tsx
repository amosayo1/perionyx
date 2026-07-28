"use client";

import { cn } from "@/lib/utils";
import { MOCK_REGION_LIQUIDITY } from "./data";

export function RegionalLiquidityChart({ className }: { className?: string }) {
  const sorted = [...MOCK_REGION_LIQUIDITY].sort((a, b) => b.totalCash - a.totalCash);
  const maxVal = Math.max(...sorted.map((r) => r.totalCash));

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Regional Liquidity Distribution</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Total liquidity by geographic region</p>
      <div className="space-y-3">
        {sorted.map((r) => {
          const w = maxVal > 0 ? (r.totalCash / maxVal) * 100 : 0;
          return (
            <div key={r.region}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-zinc-300">{r.region}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-100 font-medium">{fmt(r.totalCash)}</span>
                  <span className={cn("text-[12px]", r.coverageDays >= 180 ? "text-emerald-400" : r.coverageDays >= 90 ? "text-amber-400" : "text-red-400")}>
                    {r.coverageDays}d
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-zinc-500/70 to-gold/70"
                  style={{ width: `${w}%` }} role="progressbar" aria-valuenow={w} aria-valuemin={0} aria-valuemax={100} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmt(v: number): string { return v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`; }

"use client";

import { cn } from "@/lib/utils";
import { MOCK_ENTITY_LIQUIDITY } from "./data";

export function CashBurnChart({ className }: { className?: string }) {
  const sorted = [...MOCK_ENTITY_LIQUIDITY].sort((a, b) => b.cashBurn - a.cashBurn).slice(0, 6);
  const maxBurn = Math.max(...sorted.map((e) => e.cashBurn));

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Cash Burn by Entity</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Top 6 entities by monthly cash burn rate</p>
      <div className="space-y-3">
        {sorted.map((e) => {
          const w = maxBurn > 0 ? (e.cashBurn / maxBurn) * 100 : 0;
          return (
            <div key={e.entity}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-zinc-300 truncate max-w-[180px]">{e.entity}</span>
                <div className="flex items-center gap-3">
                  <span className={cn("font-medium", e.cashBurn >= 5000000 ? "text-red-400" : e.cashBurn >= 3000000 ? "text-amber-400" : "text-emerald-400")}>
                    {fmt(e.cashBurn)}
                  </span>
                  <span className={cn("text-[12px]", e.coverageDays >= 180 ? "text-emerald-400" : e.coverageDays >= 90 ? "text-amber-400" : "text-red-400")}>
                    {e.coverageDays}d
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className={cn("h-full rounded-full", e.cashBurn >= 5000000 ? "bg-red-500/60" : e.cashBurn >= 3000000 ? "bg-amber-500/60" : "bg-emerald-500/60")}
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

"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Globe } from "lucide-react";
import { MOCK_REGION_LIQUIDITY } from "./data";

export function RegionalLiquidityCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {MOCK_REGION_LIQUIDITY.map((r) => {
        const availPct = r.totalCash > 0 ? (r.available / r.totalCash) * 100 : 0;
        const needsFunding = r.fundingNeed > 0;
        return (
          <div key={r.region} className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-white">{r.region}</span>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
                r.liquidityScore >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                r.liquidityScore >= 60 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400")}>
                {r.liquidityScore}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div><span className="text-zinc-500">Available</span><p className="text-emerald-400 font-medium">{fmt(r.available)}</p></div>
              <div><span className="text-zinc-500">Restricted</span><p className="text-red-400 font-medium">{fmt(r.restricted)}</p></div>
              <div><span className="text-zinc-500">Net Liquidity</span><p className="text-white font-medium">{fmt(r.netLiquidity)}</p></div>
              {needsFunding ? (
                <div><span className="text-amber-400">Funding Need</span><p className="text-amber-400 font-medium">{fmt(r.fundingNeed)}</p></div>
              ) : (
                <div><span className="text-zinc-500">Cash Burn</span><p className="text-zinc-300 font-medium">{fmt(r.cashBurn)}</p></div>
              )}
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-emerald-500/50" style={{ width: `${availPct}%` }}
                role="progressbar" aria-valuenow={availPct} aria-valuemin={0} aria-valuemax={100} />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className={cn("font-medium", r.coverageDays >= 180 ? "text-emerald-400" : r.coverageDays >= 90 ? "text-amber-400" : "text-red-400")}>
                  {r.coverageDays}d coverage
                </span>
              </div>
              <div className="flex items-center gap-1">
                {r.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : r.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-400" /> : null}
                <span className={cn(r.forecast === "positive" ? "text-emerald-400" : r.forecast === "negative" ? "text-red-400" : "text-zinc-400")}>
                  {r.forecast}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}

"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_LIQUIDITY_POOLS } from "./data";

export function LiquidityPoolsGrid({ compact, className }: { compact?: boolean; className?: string }) {
  const pools = compact ? MOCK_LIQUIDITY_POOLS.slice(0, 3) : MOCK_LIQUIDITY_POOLS;

  return (
    <div className={cn("space-y-4", className)}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Liquidity Pools</h3>
            <p className="text-[12px] text-zinc-500">6 enterprise liquidity pools</p>
          </div>
        </div>
      )}
      <div className={cn("grid gap-4", compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6")}>
        {pools.map((pool) => {
          const availPct = pool.availablePercent;
          return (
            <div key={pool.id} className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{pool.type}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                  pool.policyCompliance === "compliant" ? "bg-emerald-500/10 text-emerald-400" :
                  pool.policyCompliance === "warning" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400")}>
                  {pool.policyCompliance}
                </span>
              </div>
              <p className="text-sm font-medium text-white truncate">{pool.name}</p>
              <p className="mt-1 text-lg font-semibold text-white">{fmt(pool.currentBalance)}</p>

              <div className="mt-3 space-y-1 text-[12px]">
                <div className="flex justify-between"><span className="text-zinc-500">Target</span><span className="text-zinc-300">{fmt(pool.targetBalance)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Utilization</span><span className="text-zinc-300">{pool.utilization.toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Available</span><span className="text-emerald-400">{availPct}%</span></div>
                {pool.recommendedTransfer > 0 && (
                  <div className="flex justify-between"><span className="text-amber-400">Transfer in</span><span className="text-amber-400">{fmt(pool.recommendedTransfer)}</span></div>
                )}
              </div>

              <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-emerald-500/50" style={{ width: `${pool.utilization}%` }} role="progressbar" aria-valuenow={pool.utilization} aria-valuemin={0} aria-valuemax={100} />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className={cn("font-medium", pool.healthScore >= 80 ? "text-emerald-400" : pool.healthScore >= 60 ? "text-amber-400" : "text-red-400")}>
                  Score: {pool.healthScore}
                </span>
                <div className="flex items-center gap-1 text-zinc-500">
                  {pool.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : pool.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-400" /> : null}
                  <span>{pool.members} members</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}

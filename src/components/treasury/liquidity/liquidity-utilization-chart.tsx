"use client";

import { cn } from "@/lib/utils";
import { MOCK_LIQUIDITY_POOLS } from "./data";

export function LiquidityUtilizationChart({ className }: { className?: string }) {
  const sorted = [...MOCK_LIQUIDITY_POOLS].sort((a, b) => b.utilization - a.utilization);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Pool Utilization</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Current vs target utilization by pool</p>
      <div className="space-y-3">
        {sorted.map((pool) => {
          const targetW = pool.targetBalance > 0 ? (pool.currentBalance / pool.targetBalance) * 100 : 0;
          return (
            <div key={pool.id}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-zinc-300">{pool.name}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", pool.utilization >= 90 ? "text-amber-400" : pool.utilization >= 80 ? "text-emerald-400" : "text-red-400")}>
                    {pool.utilization.toFixed(0)}%
                  </span>
                  <span className="text-zinc-500 text-[11px]">target: {targetW.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-800 relative overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500/50" style={{ width: `${Math.min(100, pool.utilization)}%` }} role="progressbar" aria-valuenow={pool.utilization} aria-valuemin={0} aria-valuemax={100} />
                {targetW <= 100 && (
                  <div className="absolute top-0 h-full w-0.5 bg-white/40" style={{ left: `${targetW}%` }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-zinc-500 text-center">White line = target utilization</p>
    </div>
  );
}

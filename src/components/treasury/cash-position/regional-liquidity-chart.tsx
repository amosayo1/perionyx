"use client";

import { cn } from "@/lib/utils";
import { MOCK_REGIONAL_CASH } from "./data";

interface RegionalLiquidityChartProps {
  className?: string;
}

export function RegionalLiquidityChart({ className }: RegionalLiquidityChartProps) {
  const maxScore = Math.max(...MOCK_REGIONAL_CASH.map((r) => r.liquidityScore));

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Regional Liquidity Scores</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Health score by region (0-100)</p>

      <div className="space-y-4">
        {MOCK_REGIONAL_CASH.map((region) => (
          <div key={region.region}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-zinc-300">{region.region}</span>
              <span className={cn(
                "font-medium",
                region.liquidityScore >= 80 ? "text-emerald-400" :
                region.liquidityScore >= 60 ? "text-amber-400" : "text-red-400",
              )}>
                {region.liquidityScore}/100
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-zinc-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  region.liquidityScore >= 80 ? "bg-emerald-500" :
                  region.liquidityScore >= 60 ? "bg-amber-500" : "bg-red-500",
                )}
                style={{ width: `${(region.liquidityScore / maxScore) * 100}%` }}
                role="progressbar"
                aria-valuenow={region.liquidityScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${region.region} liquidity score: ${region.liquidityScore}`}
              />
              <div
                className="absolute top-0 h-full w-0.5 bg-white/30"
                style={{ left: `${((region.availableCash / region.totalCash) / 1) * 100}%` }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[10px] text-zinc-600">
              <span>Availability: {((region.availableCash / region.totalCash) * 100).toFixed(0)}%</span>
              <span>Change: {region.dailyChange >= 0 ? "+" : ""}{formatCurrency(region.dailyChange)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

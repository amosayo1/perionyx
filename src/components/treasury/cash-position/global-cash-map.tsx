"use client";

import { cn } from "@/lib/utils";
import { MOCK_REGIONAL_CASH } from "./data";

interface GlobalCashMapProps {
  className?: string;
}

export function GlobalCashMap({ className }: GlobalCashMapProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Global Cash Distribution</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Regional cash allocation across 5 regions</p>
      <div className="space-y-3">
        {MOCK_REGIONAL_CASH.map((region) => {
          const pct = (region.totalCash / 842750000) * 100;
          return (
            <div key={region.region}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="text-white">{region.region}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">{formatCurrency(region.totalCash)}</span>
                  <span className={cn(
                    "text-[12px] font-medium",
                    region.trend === "up" ? "text-emerald-400" :
                    region.trend === "down" ? "text-red-400" : "text-zinc-400",
                  )}>
                    {region.dailyChange >= 0 ? "+" : ""}{formatCurrency(region.dailyChange)}
                  </span>
                  <span className="text-zinc-500 w-10 text-right">{pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-400 transition-all"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${region.region} ${pct.toFixed(1)}% of total cash`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

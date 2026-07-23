"use client";

import { cn } from "@/lib/utils";
import { MOCK_ENTITY_CASH } from "./data";

interface EntityExposureChartProps {
  className?: string;
}

export function EntityExposureChart({ className }: EntityExposureChartProps) {
  const sorted = [...MOCK_ENTITY_CASH].sort((a, b) => b.available - a.available);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Entity Exposure</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Available cash by legal entity</p>

      <div className="space-y-3">
        {sorted.map((entity, i) => {
          const pct = sorted.length > 0 ? (entity.available / sorted[0].available) * 100 : 0;
          return (
            <div key={entity.entityId}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="text-zinc-300 truncate max-w-[200px]">{entity.entityName}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white font-medium">{formatCurrency(entity.available)}</span>
                  <span className={cn(
                    "w-12 text-right text-[12px] font-medium",
                    entity.dailyChange >= 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {entity.dailyChange >= 0 ? "+" : ""}{formatCurrency(entity.dailyChange)}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500/70 to-violet-400/50"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${entity.entityName}: ${formatCurrency(entity.available)}`}
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

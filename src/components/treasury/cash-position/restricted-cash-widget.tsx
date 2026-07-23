"use client";

import { cn } from "@/lib/utils";
import { Lock, TrendingDown } from "lucide-react";
import { MOCK_TREASURY_KPIS } from "./data";

interface RestrictedCashWidgetProps {
  className?: string;
}

export function RestrictedCashWidget({ className }: RestrictedCashWidgetProps) {
  const kpi = MOCK_TREASURY_KPIS.restrictedCash;
  const ratio = MOCK_TREASURY_KPIS.totalCash.value > 0
    ? (kpi.value / MOCK_TREASURY_KPIS.totalCash.value) * 100
    : 0;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4", className)}>
      <div className="flex items-center justify-between">
        <Lock className="h-5 w-5 text-red-400" />
        <span className="flex items-center gap-1 text-[12px] text-red-400">
          <TrendingDown className="h-3.5 w-3.5" />
          {kpi.changePercent >= 0 ? "+" : ""}{kpi.changePercent.toFixed(2)}%
        </span>
      </div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Restricted Cash</p>
      <p className="text-xl font-semibold text-white">{formatCurrency(kpi.value)}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-red-500"
            style={{ width: `${ratio}%` }}
            role="progressbar"
            aria-valuenow={ratio}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="text-[12px] text-zinc-500">{ratio.toFixed(1)}% of total</span>
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

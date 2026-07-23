"use client";

import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp } from "lucide-react";
import { MOCK_TREASURY_KPIS } from "./data";

interface IdleCashWidgetProps {
  className?: string;
}

export function IdleCashWidget({ className }: IdleCashWidgetProps) {
  const kpi = MOCK_TREASURY_KPIS.idleCash;
  const ratio = MOCK_TREASURY_KPIS.totalCash.value > 0
    ? (kpi.value / MOCK_TREASURY_KPIS.totalCash.value) * 100
    : 0;
  const potentialYield = kpi.value * 0.045;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4", className)}>
      <div className="flex items-center justify-between">
        <DollarSign className="h-5 w-5 text-amber-400" />
        <span className="flex items-center gap-1 text-[12px] text-amber-400">
          <TrendingUp className="h-3.5 w-3.5" />
          {kpi.changePercent >= 0 ? "+" : ""}{kpi.changePercent.toFixed(2)}%
        </span>
      </div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Idle Cash</p>
      <p className="text-xl font-semibold text-white">{formatCurrency(kpi.value)}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{ width: `${ratio}%` }}
            role="progressbar"
            aria-valuenow={ratio}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="text-[12px] text-zinc-500">{ratio.toFixed(0)}% idle</span>
      </div>
      <p className="mt-2 text-[12px] text-zinc-500">
        Potential yield at 4.5%: <span className="text-amber-400">{formatCurrency(potentialYield)}/yr</span>
      </p>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp } from "lucide-react";
import { MOCK_TREASURY_KPIS } from "./data";

interface WorkingCapitalWidgetProps {
  className?: string;
}

export function WorkingCapitalWidget({ className }: WorkingCapitalWidgetProps) {
  const kpi = MOCK_TREASURY_KPIS.workingCapital;
  const ratio = MOCK_TREASURY_KPIS.totalCash.value > 0
    ? (kpi.value / MOCK_TREASURY_KPIS.totalCash.value)
    : 0;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Working Capital</p>
          <p className="text-xl font-semibold text-white">{formatCurrency(kpi.value)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[11px] text-zinc-500">Current Ratio</p>
            <p className="text-sm font-semibold text-emerald-400">2.4x</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-zinc-500">Quick Ratio</p>
            <p className="text-sm font-semibold text-emerald-400">1.8x</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[13px]">
        <div>
          <span className="text-zinc-500">WC / Total Cash: </span>
          <span className="text-white font-medium">{ratio.toFixed(1)}x</span>
        </div>
        <span className="flex items-center gap-1 text-[12px] text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          +{kpi.changePercent.toFixed(2)}%
        </span>
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

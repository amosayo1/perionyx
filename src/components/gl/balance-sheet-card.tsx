"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { BalanceSheet } from "./gl-types";

interface BalanceSheetCardProps {
  data: BalanceSheet;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const BalanceSheetCard = memo(function BalanceSheetCard({ data, className }: BalanceSheetCardProps) {
  const currentRatio = data.currentLiabilities > 0 ? (data.currentAssets / data.currentLiabilities).toFixed(2) : "∞";

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gold">
        Balance Sheet Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Total Assets</p>
          <p className="mt-1 text-xl font-bold text-gold">{formatCurrency(data.totalAssets)}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-600">
            <span>Current: {formatCurrency(data.currentAssets)}</span>
            <span>Non-Current: {formatCurrency(data.nonCurrentAssets)}</span>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Total Liabilities</p>
          <p className="mt-1 text-xl font-bold text-amber-400">{formatCurrency(data.totalLiabilities)}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-600">
            <span>Current: {formatCurrency(data.currentLiabilities)}</span>
            <span>Non-Current: {formatCurrency(data.nonCurrentLiabilities)}</span>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Total Equity</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{formatCurrency(data.totalEquity)}</p>
          <p className="mt-1 text-[10px] text-zinc-600">Retained Earnings: {formatCurrency(data.retainedEarnings)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Working Capital</p>
          <p className={cn("mt-1 text-xl font-bold", data.workingCapital >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(data.workingCapital)}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">Current Ratio: {currentRatio}</p>
        </div>
      </div>
    </div>
  );
});

"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { CashFlowStatement } from "./gl-types";

interface CashFlowCardProps {
  data: CashFlowStatement;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const CashFlowCard = memo(function CashFlowCard({ data, className }: CashFlowCardProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-400">
        Cash Flow Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-[11px] text-zinc-500">Operating CF</p>
          <p className={cn("mt-1 text-xl font-bold", data.operatingCashFlow >= 0 ? "text-blue-400" : "text-red-400")}>
            {formatCurrency(data.operatingCashFlow)}
          </p>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <p className="text-[11px] text-zinc-500">Investing CF</p>
          <p className={cn("mt-1 text-xl font-bold", data.investingCashFlow >= 0 ? "text-purple-400" : "text-red-400")}>
            {formatCurrency(data.investingCashFlow)}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[11px] text-zinc-500">Financing CF</p>
          <p className={cn("mt-1 text-xl font-bold", data.financingCashFlow >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(data.financingCashFlow)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Net Cash Flow</p>
          <p className={cn("mt-1 text-xl font-bold", data.netCashFlow >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(data.netCashFlow)}
          </p>
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="text-[11px] text-zinc-500">Free Cash Flow</p>
          <p className={cn("mt-1 text-xl font-bold", data.freeCashFlow >= 0 ? "text-cyan-400" : "text-red-400")}>
            {formatCurrency(data.freeCashFlow)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Cash Balance</p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-zinc-600">Beginning</p>
              <p className="text-xs font-mono text-zinc-400">{formatCurrency(data.beginningCash)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-zinc-600">Ending</p>
              <p className="text-xs font-mono text-white">{formatCurrency(data.endingCash)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

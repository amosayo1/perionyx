"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { IncomeStatement } from "./gl-types";

interface IncomeStatementCardProps {
  data: IncomeStatement;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const IncomeStatementCard = memo(function IncomeStatementCard({ data, className }: IncomeStatementCardProps) {
  const grossMargin = data.totalRevenue > 0 ? ((data.grossProfit / data.totalRevenue) * 100).toFixed(1) : "0.0";
  const netMargin = data.totalRevenue > 0 ? ((data.netIncome / data.totalRevenue) * 100).toFixed(1) : "0.0";
  const opMargin = data.totalRevenue > 0 ? ((data.operatingIncome / data.totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-400">
        Income Statement Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Revenue</p>
          <p className="mt-1 text-xl font-bold text-white">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">COGS</p>
          <p className="mt-1 text-xl font-bold text-amber-400">{formatCurrency(data.costOfGoodsSold)}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[11px] text-zinc-500">Gross Profit</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{formatCurrency(data.grossProfit)}</p>
          <p className="mt-1 text-[10px] text-zinc-600">Margin: {grossMargin}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Operating Income</p>
          <p className={cn("mt-1 text-xl font-bold", data.operatingIncome >= 0 ? "text-blue-400" : "text-red-400")}>
            {formatCurrency(data.operatingIncome)}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">Margin: {opMargin}%</p>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <p className="text-[11px] text-zinc-500">EBITDA</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{formatCurrency(data.ebitda)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 p-3">
          <p className="text-[11px] text-zinc-500">Net Income</p>
          <p className={cn("mt-1 text-xl font-bold", data.netIncome >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(data.netIncome)}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">Margin: {netMargin}%</p>
        </div>
      </div>
    </div>
  );
});

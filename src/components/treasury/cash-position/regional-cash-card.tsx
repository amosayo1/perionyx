"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Globe } from "lucide-react";
import type { RegionalCashData } from "./types";

interface RegionalCashCardProps {
  data: RegionalCashData;
  className?: string;
}

export function RegionalCashCard({ data, className }: RegionalCashCardProps) {
  const availabilityPct = data.totalCash > 0 ? (data.availableCash / data.totalCash) * 100 : 0;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors", className)}>
      <div className="flex items-center justify-between">
        <Globe className="h-4 w-4 text-zinc-500" />
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-medium",
          data.liquidityScore >= 80 ? "bg-emerald-500/10 text-emerald-400" :
          data.liquidityScore >= 60 ? "bg-amber-500/10 text-amber-400" :
          "bg-red-500/10 text-red-400",
        )}>
          {data.liquidityScore}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{data.region}</p>
      <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(data.totalCash)}</p>

      <div className="mt-3 space-y-1.5 text-[12px]">
        <div className="flex justify-between">
          <span className="text-zinc-500">Available</span>
          <span className="text-emerald-400">{formatCurrency(data.availableCash)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Restricted</span>
          <span className="text-red-400">{formatCurrency(data.restrictedCash)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Availability</span>
          <span className="text-zinc-300">{availabilityPct.toFixed(0)}%</span>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500/50"
          style={{ width: `${availabilityPct}%` }}
          role="progressbar"
          aria-valuenow={availabilityPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${availabilityPct.toFixed(0)}% availability`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-1 text-zinc-500">
          {data.entityCount} entities &bull; {data.institutionCount} banks &bull; {data.currencyCount} currencies
        </div>
        <div className="flex items-center gap-1">
          {data.trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : data.trend === "down" ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          ) : null}
          <span className={cn(
            "font-medium",
            data.trend === "up" ? "text-emerald-400" :
            data.trend === "down" ? "text-red-400" : "text-zinc-400",
          )}>
            {data.dailyChange >= 0 ? "+" : ""}{formatCurrency(data.dailyChange)}
          </span>
        </div>
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

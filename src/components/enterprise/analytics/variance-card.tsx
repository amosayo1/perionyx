"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { VarianceData } from "./types";

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const prefix = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${prefix}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${prefix}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${prefix}$${(abs / 1_000).toFixed(1)}K`;
  return `${prefix}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

interface VarianceCardProps {
  data: VarianceData[];
  title?: string;
  comparisonType?: "budget" | "forecast" | "previous";
  className?: string;
}

export const VarianceCard = memo(function VarianceCard({
  data,
  title = "Variance Analysis",
  comparisonType = "budget",
  className,
}: VarianceCardProps) {
  if (!data.length) {
    return (
      <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-6", className)}>
        <p className="text-sm font-semibold text-white mb-1">{title}</p>
        <p className="text-xs text-zinc-600">No variance data available for this period.</p>
      </div>
    );
  }

  const maxAbsValue = Math.max(...data.map((d) => Math.max(Math.abs(d.budget), Math.abs(d.actual))), 1);

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-[11px] font-medium text-zinc-500">
          {comparisonType === "budget" ? "Budget vs Actual" :
           comparisonType === "forecast" ? "Forecast vs Actual" :
           "Previous vs Actual"}
        </span>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const variance = item.actual - item.budget;
          const variancePct = item.budget !== 0 ? (variance / Math.abs(item.budget)) * 100 : 0;
          const isFavorable = comparisonType === "budget" ? variance >= 0 : variance <= 0;
          const budgetWidth = (Math.abs(item.budget) / maxAbsValue) * 100;
          const actualWidth = (Math.abs(item.actual) / maxAbsValue) * 100;

          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {comparisonType === "budget" ? "Budget" : comparisonType === "forecast" ? "Forecast" : "Previous"}: {formatCurrency(item.budget)}
                  </span>
                  <span className="text-xs text-zinc-300">Actual: {formatCurrency(item.actual)}</span>
                  <span className={cn("text-xs font-medium", isFavorable ? "text-emerald-400" : "text-red-400")}>
                    {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                    <span className="ml-0.5">({variancePct >= 0 ? "+" : ""}{variancePct.toFixed(1)}%)</span>
                  </span>
                </div>
              </div>

              <div className="relative h-6">
                <div
                  className="absolute bottom-0 left-0 h-2 rounded-full bg-zinc-700/50 transition-all"
                  style={{ width: `${Math.min(budgetWidth, 100)}%` }}
                />
                <div
                  className={cn(
                    "absolute bottom-0 h-2 rounded-full transition-all",
                    isFavorable ? "bg-emerald-500/60" : "bg-red-500/60",
                  )}
                  style={{ width: `${Math.min(actualWidth, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

"use client";

import { memo } from "react";
import { TrendingUp, DollarSign, BarChart3, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Forecast } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface ForecastDashboardProps {
  forecasts: Forecast[];
  className?: string;
}

function ForecastRow({ label, value, icon, variant }: { label: string; value: string; icon: React.ReactNode; variant: "gold" | "emerald" | "blue" | "amber" | "purple" | "cyan" }) {
  const COLORS: Record<string, { icon: string; border: string; bg: string }> = {
    gold: { icon: "text-[#d4af37]", border: "border-[#d4af37]/20", bg: "bg-[#d4af37]/10" },
    emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
    amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
    cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
  };
  const c = COLORS[variant];
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export const ForecastDashboard = memo(function ForecastDashboard({ forecasts, className }: ForecastDashboardProps) {
  const latest = forecasts.length > 0 ? forecasts.reduce((a, b) => a.horizon.getTime() > b.horizon.getTime() ? a : b) : null;

  if (!latest) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <p className="text-sm text-zinc-500">No forecasts available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <ForecastRow label="Interest Income" value={formatCurrency(latest.projectedInterestIncome)} icon={<DollarSign />} variant="blue" />
        <ForecastRow label="Dividend Income" value={formatCurrency(latest.projectedDividendIncome)} icon={<TrendingUp />} variant="emerald" />
        <ForecastRow label="Capital Gains" value={formatCurrency(latest.projectedCapitalGains)} icon={<BarChart3 />} variant="purple" />
        <ForecastRow label="Maturity Proceeds" value={formatCurrency(latest.projectedMaturityProceeds)} icon={<Target />} variant="amber" />
        <ForecastRow label="Cash Inflows" value={formatCurrency(latest.projectedCashInflows)} icon={<DollarSign />} variant="gold" />
        <ForecastRow label="Portfolio Growth" value={formatCurrency(latest.projectedPortfolioGrowth)} icon={<TrendingUp />} variant="emerald" />
        <ForecastRow label="Projected Return" value={`${latest.projectedReturn.toFixed(1)}%`} icon={<BarChart3 />} variant="cyan" />
        <ForecastRow label="Projected Yield" value={`${latest.projectedYield.toFixed(1)}%`} icon={<Shield />} variant="purple" />
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#d4af37]" />
            <h3 className="text-sm font-semibold text-white">Forecast Confidence</h3>
          </div>
          <span className="text-sm font-bold text-white">{(latest.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn("h-full rounded-full transition-all", latest.confidence >= 0.8 ? "bg-emerald-500" : latest.confidence >= 0.6 ? "bg-amber-500" : "bg-red-500")}
            style={{ width: `${latest.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
});

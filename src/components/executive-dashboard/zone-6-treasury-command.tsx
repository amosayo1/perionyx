"use client";

import { memo } from "react";
import { ArrowRight, Landmark, DollarSign, RefreshCw, TrendingDown, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";
import { BarChart, DonutChart } from "./charts";

interface Zone6Props {
  totalCash?: number;
  bankCount?: number;
  liquidityRatio?: number;
  fxExposure?: number;
  upcomingPayments?: number;
  forecastConfidence?: number;
  treasuryRiskScore?: number;
  className?: string;
}

export const Zone6TreasuryCommand = memo(function Zone6TreasuryCommand({
  totalCash = 0,
  bankCount = 0,
  liquidityRatio = 1.5,
  fxExposure = 3.2,
  upcomingPayments = 0,
  forecastConfidence = 85,
  treasuryRiskScore = 22,
  className,
}: Zone6Props) {
  const formatCurrency = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toLocaleString()}`;
  };

  const metrics = [
    { label: "Total Cash", value: formatCurrency(totalCash), icon: DollarSign, color: "text-gold bg-gold-500/10" },
    { label: "Bank Accounts", value: bankCount.toString(), icon: Landmark, color: "text-blue-400 bg-blue-500/10" },
    { label: "Liquidity Ratio", value: liquidityRatio.toFixed(1) + "x", icon: RefreshCw, color: "text-emerald-400 bg-emerald-500/10" },
    { label: "FX Exposure", value: `${fxExposure.toFixed(1)}%`, icon: TrendingDown, color: "text-amber-400 bg-amber-500/10" },
    { label: "Upcoming Payments", value: upcomingPayments.toString(), icon: Calendar, color: "text-purple-400 bg-purple-500/10" },
    { label: "Forecast Confidence", value: `${forecastConfidence}%`, icon: RefreshCw, color: "text-cyan-400 bg-cyan-500/10" },
  ];

  return (
    <DashboardCard
      title="Treasury Command Center"
      description="Cash, liquidity, and treasury risk at a glance"
      size="half"
      className={className}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-lg bg-zinc-800/30 p-3">
              <div className={cn("mb-2 flex h-7 w-7 items-center justify-center rounded-md", m.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500">{m.label}</p>
              <p className="mt-0.5 text-[16px] font-bold text-white">{m.value}</p>
            </div>
          );
        })}
      </div>

      {treasuryRiskScore > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-800/30 p-3">
          <div
            className={cn(
              "h-2 flex-1 rounded-full bg-zinc-700 overflow-hidden",
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                treasuryRiskScore < 25 ? "bg-emerald-500" :
                treasuryRiskScore < 50 ? "bg-amber-500" :
                "bg-red-500",
              )}
              style={{ width: `${Math.min(treasuryRiskScore, 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-500 whitespace-nowrap">Risk: {treasuryRiskScore}/100</span>
        </div>
      )}

      <Link
        href="/wallets"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800/40 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        Open Treasury Center
        <ArrowRight className="h-3 w-3" />
      </Link>
    </DashboardCard>
  );
});

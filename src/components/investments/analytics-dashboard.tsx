"use client";

import { memo } from "react";
import { BarChart3, DollarSign, TrendingUp, Shield, Activity, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsKPI } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface AnalyticsDashboardProps {
  kpis: AnalyticsKPI[];
  className?: string;
}

function KpiCard({ label, value, icon, variant }: { label: string; value: string; icon: React.ReactNode; variant: "gold" | "emerald" | "amber" | "red" | "blue" | "purple" | "cyan" }) {
  const COLORS: Record<string, { icon: string; border: string; bg: string }> = {
    gold: { icon: "text-[#d4af37]", border: "border-[#d4af37]/20", bg: "bg-[#d4af37]/10" },
    emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
    blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
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

export const AnalyticsDashboard = memo(function AnalyticsDashboard({ kpis, className }: AnalyticsDashboardProps) {
  if (kpis.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <p className="text-sm text-zinc-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-4 gap-3", className)}>
      {kpis.map((kpi) => {
        const totalMV = kpi.marketValue;
        const totalBV = kpi.bookValue;
        const unrealizedGL = kpi.unrealizedGain;
        const returnPct = kpi.portfolioReturn;

        return (
          <KpiCard key={kpi.totalInvestments + "kpi"} label="Total Investments" value={kpi.totalInvestments.toLocaleString()} icon={<BarChart3 />} variant="blue" />
        );
      })}
      <KpiCard label="Market Value" value={formatCurrency(kpis.reduce((s, k) => s + k.marketValue, 0))} icon={<DollarSign />} variant="gold" />
      <KpiCard label="Book Value" value={formatCurrency(kpis.reduce((s, k) => s + k.bookValue, 0))} icon={<Activity />} variant="blue" />
      <KpiCard label="Unrealized G/L" value={formatCurrency(kpis.reduce((s, k) => s + k.unrealizedGain, 0))} icon={<TrendingUp />} variant={kpis.reduce((s, k) => s + k.unrealizedGain, 0) >= 0 ? "emerald" : "red"} />
      <KpiCard label="Portfolio Return" value={`${(kpis.reduce((s, k) => s + k.portfolioReturn, 0) / (kpis.length || 1)).toFixed(2)}%`} icon={<TrendingUp />} variant="emerald" />
      <KpiCard label="Portfolio Yield" value={`${(kpis.reduce((s, k) => s + k.portfolioYield, 0) / (kpis.length || 1)).toFixed(2)}%`} icon={<PieChart />} variant="purple" />
      <KpiCard label="Avg Duration" value={`${(kpis.reduce((s, k) => s + k.averageDuration, 0) / (kpis.length || 1)).toFixed(1)}y`} icon={<Activity />} variant="cyan" />
      <KpiCard label="Avg Rating" value={kpis.map((k) => k.averageRating).filter(Boolean)[0] ?? "A"} icon={<Shield />} variant="blue" />
      <KpiCard label="Diversification" value={`${(kpis.reduce((s, k) => s + k.diversificationScore, 0) / (kpis.length || 1)).toFixed(0)}/100`} icon={<Shield />} variant={kpis.reduce((s, k) => s + k.diversificationScore, 0) / (kpis.length || 1) >= 70 ? "emerald" : "amber"} />
      <KpiCard label="Cash Available" value={formatCurrency(kpis.reduce((s, k) => s + k.cashAvailable, 0))} icon={<DollarSign />} variant="emerald" />
      <KpiCard label="Upcoming Maturities" value={formatCurrency(kpis.reduce((s, k) => s + k.upcomingMaturities, 0))} icon={<Activity />} variant="amber" />
    </div>
  );
});

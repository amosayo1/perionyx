"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, CalendarDays, Target,
  ShieldCheck, HandCoins, Flame, ArrowRightLeft, Percent,
  AlertTriangle, LayoutDashboard, Banknote,
} from "lucide-react";

interface KpiData {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: number;
  direction: "up" | "down";
  threshold: "good" | "warning" | "critical";
  barColor: string;
  barWidth: number;
}

const MOCK_OVERVIEW_KPIS: KpiData[] = [
  { icon: DollarSign, label: "Projected Cash", value: "$842.8M", delta: 3.2, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 88 },
  { icon: CalendarDays, label: "Cash Runway", value: "342 days", delta: 12, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 85 },
  { icon: Target, label: "Forecast Accuracy", value: "92.4%", delta: 1.8, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 92 },
  { icon: ShieldCheck, label: "Liquidity Buffer", value: "$245.3M", delta: -2.1, direction: "down", threshold: "warning", barColor: "bg-amber-500", barWidth: 65 },
  { icon: HandCoins, label: "Funding Gap", value: "$18.5M", delta: 5.7, direction: "up", threshold: "critical", barColor: "bg-red-500", barWidth: 35 },
  { icon: Flame, label: "Cash Burn", value: "$12.5M/mo", delta: -1.2, direction: "down", threshold: "good", barColor: "bg-emerald-500", barWidth: 72 },
  { icon: ArrowRightLeft, label: "Net Cash Flow", value: "$8.3M", delta: 15.4, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 78 },
  { icon: Percent, label: "Forecast Confidence", value: "87%", delta: 3, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 87 },
  { icon: AlertTriangle, label: "Variance", value: "-3.2%", delta: -0.8, direction: "down", threshold: "warning", barColor: "bg-amber-500", barWidth: 45 },
  { icon: LayoutDashboard, label: "Risk Exposure", value: "$156.2M", delta: 4.5, direction: "up", threshold: "critical", barColor: "bg-red-500", barWidth: 55 },
  { icon: Banknote, label: "Working Capital", value: "$523.0M", delta: 1.7, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 90 },
  { icon: TrendingUp, label: "Free Cash Flow", value: "$34.7M", delta: 8.2, direction: "up", threshold: "good", barColor: "bg-emerald-500", barWidth: 82 },
];

interface CashForecastOverviewProps {
  className?: string;
}

export function CashForecastOverview({ className }: CashForecastOverviewProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {MOCK_OVERVIEW_KPIS.map((kpi) => (
        <KpiCard key={kpi.label} data={kpi} />
      ))}
    </div>
  );
}

function KpiCard({ data }: { data: KpiData }) {
  const { icon: Icon, label, value, delta, direction, threshold, barColor, barWidth } = data;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700" role="region" aria-label={`${label}: ${value}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <Icon className={cn(
          "h-4 w-4",
          threshold === "good" ? "text-emerald-400" :
          threshold === "warning" ? "text-amber-400" :
          "text-red-400",
        )} />
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {direction === "up" ? (
          <TrendingUp className={cn(
            "h-3.5 w-3.5",
            threshold === "critical" ? "text-red-400" : "text-emerald-400",
          )} />
        ) : (
          <TrendingDown className={cn(
            "h-3.5 w-3.5",
            threshold === "good" ? "text-emerald-400" : "text-red-400",
          )} />
        )}
        <span className={cn(
          "text-[12px] font-medium",
          threshold === "good" ? "text-emerald-400" :
          threshold === "warning" ? "text-amber-400" :
          "text-red-400",
        )}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
        </span>
        <span className="text-[11px] text-zinc-500">vs forecast</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${barWidth}%` }}
          role="progressbar"
          aria-valuenow={barWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} at ${barWidth}%`}
        />
      </div>
    </div>
  );
}

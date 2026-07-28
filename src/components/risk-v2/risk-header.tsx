"use client";

import { memo } from "react";
import { Activity, AlertTriangle, Gauge, Shield, Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskOverviewMetrics } from "./risk-types";

const COLORS = {
  gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function formatMetric(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function MetricCard({ label, value, icon, variant = "gold", trend }: { label: string; value: string; icon: React.ReactNode; variant?: keyof typeof COLORS; trend?: { value: string; up: boolean } }) {
  const c = COLORS[variant];
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <span className={cn("text-xs", trend.up ? "text-emerald-400" : "text-red-400")}>
                {trend.up ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RiskHeader = memo(function RiskHeader({ metrics }: { metrics: RiskOverviewMetrics }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard label="Total Risks" value={formatMetric(metrics.totalRisks)} icon={<Activity />} variant="gold" />
      <MetricCard label="Open Risks" value={formatMetric(metrics.openRisks)} icon={<AlertTriangle />} variant={metrics.openRisks > 10 ? "red" : "amber"} trend={metrics.criticalRisks > 0 ? { value: `${metrics.criticalRisks} critical`, up: false } : undefined} />
      <MetricCard label="Total Controls" value={formatMetric(metrics.totalControls)} icon={<Shield />} variant="blue" trend={metrics.ineffectiveControls > 0 ? { value: `${metrics.ineffectiveControls} ineffective`, up: false } : undefined} />
      <MetricCard label="KRI Breaches" value={formatMetric(metrics.kriBreaches)} icon={<Siren />} variant={metrics.kriBreaches > 0 ? "red" : "emerald"} />
      <MetricCard label="Incidents" value={`${metrics.totalIncidents}`} icon={<Siren />} variant={metrics.openIncidents > 0 ? "amber" : "emerald"} trend={{ value: `${metrics.openIncidents} open`, up: metrics.openIncidents <= 3 }} />
      <MetricCard label="Assessments" value={formatMetric(metrics.totalAssessments)} icon={<Gauge />} variant="purple" />
      <MetricCard label="Scenarios" value={formatMetric(metrics.totalScenarios)} icon={<Activity />} variant="cyan" />
      <MetricCard label="High/Critical Risks" value={`${metrics.highRisks}/${metrics.criticalRisks}`} icon={<AlertTriangle />} variant={metrics.criticalRisks > 3 ? "red" : metrics.highRisks > 5 ? "amber" : "emerald"} />
    </div>
  );
});

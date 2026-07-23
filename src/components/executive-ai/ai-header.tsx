"use client";

import { memo } from "react";
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Layers, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIOverviewMetrics } from "./ai-types";

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

interface MetricCardProps {
  label: string; value: string; icon: React.ReactNode;
  variant?: "gold" | "emerald" | "amber" | "red" | "blue" | "purple" | "cyan";
  trend?: { value: string; up: boolean };
}

const COLORS = {
  gold: { icon: "text-[#d4af37]", border: "border-[#d4af37]/20", bg: "bg-[#d4af37]/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function MetricCard({ label, value, icon, variant = "gold" }: MetricCardProps) {
  const c = COLORS[variant];
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export const AIHeader = memo(function AIHeader({ metrics }: { metrics: AIOverviewMetrics }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        label="Active Insights"
        value={formatNumber(metrics.activeInsights)}
        icon={<Brain />}
        variant="gold"
      />
      <MetricCard
        label="Critical Anomalies"
        value={formatNumber(metrics.criticalAnomalies)}
        icon={<AlertTriangle />}
        variant={metrics.criticalAnomalies > 0 ? "red" : "emerald"}
      />
      <MetricCard
        label="Pending Recommendations"
        value={formatNumber(metrics.pendingRecommendations)}
        icon={<Lightbulb />}
        variant={metrics.pendingRecommendations > 0 ? "amber" : "emerald"}
      />
      <MetricCard
        label="Health Score"
        value={`${metrics.healthScore}%`}
        icon={<Activity />}
        variant={metrics.healthScore >= 75 ? "emerald" : metrics.healthScore >= 50 ? "amber" : "red"}
      />
      <MetricCard
        label="Active Models"
        value={`${metrics.activeModels}/${metrics.modelCount}`}
        icon={<Layers />}
        variant="blue"
      />
      <MetricCard
        label="Total Forecasts"
        value={formatNumber(metrics.totalForecasts)}
        icon={<TrendingUp />}
        variant="cyan"
      />
      <MetricCard
        label="Avg Confidence"
        value={`${metrics.avgConfidence}%`}
        icon={<Brain />}
        variant="purple"
      />
      <MetricCard
        label="Active Alerts"
        value={formatNumber(metrics.activeAlerts)}
        icon={<AlertTriangle />}
        variant={metrics.activeAlerts > 0 ? "amber" : "emerald"}
      />
    </div>
  );
});

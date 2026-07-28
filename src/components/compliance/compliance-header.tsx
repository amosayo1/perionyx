"use client";

import { memo } from "react";
import { Shield, FileText, AlertTriangle, CheckCircle, BookOpen, Target, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceOverviewMetrics } from "./compliance-types";

function formatPercent(value: number): string {
  return `${value}%`;
}

interface MetricCardProps {
  label: string; value: string; icon: React.ReactNode;
  variant?: "gold" | "emerald" | "amber" | "red" | "blue" | "purple" | "cyan";
  trend?: { value: string; up: boolean };
}

const COLORS = {
  gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function MetricCard({ label, value, icon, variant = "gold", trend }: MetricCardProps) {
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

export const ComplianceHeader = memo(function ComplianceHeader({ metrics }: { metrics: ComplianceOverviewMetrics }) {
  const complianceRate = metrics.totalObligations > 0
    ? Math.round((metrics.compliantObligations / metrics.totalObligations) * 100)
    : 0;

  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        label="Frameworks"
        value={metrics.totalFrameworks.toLocaleString()}
        icon={<Shield />}
        variant="gold"
      />
      <MetricCard
        label="Obligations"
        value={`${metrics.compliantObligations}/${metrics.totalObligations}`}
        icon={<FileText />}
        variant="blue"
        trend={metrics.nonCompliantObligations > 0 ? { value: `${metrics.nonCompliantObligations} non-compliant`, up: false } : undefined}
      />
      <MetricCard
        label="Policies"
        value={`${metrics.activePolicies}/${metrics.totalPolicies}`}
        icon={<BookOpen />}
        variant="purple"
      />
      <MetricCard
        label="Controls"
        value={`${metrics.totalControls - metrics.failedControls}/${metrics.totalControls}`}
        icon={<Target />}
        variant={metrics.failedControls > 0 ? "red" : "emerald"}
        trend={metrics.failedControls > 0 ? { value: `${metrics.failedControls} failed`, up: false } : undefined}
      />
      <MetricCard
        label="Compliance Rate"
        value={formatPercent(complianceRate)}
        icon={<CheckCircle />}
        variant={complianceRate >= 80 ? "emerald" : complianceRate >= 60 ? "amber" : "red"}
      />
      <MetricCard
        label="Open Remediations"
        value={metrics.openRemediations.toLocaleString()}
        icon={<AlertTriangle />}
        variant={metrics.criticalRemediations > 0 ? "red" : "amber"}
        trend={metrics.criticalRemediations > 0 ? { value: `${metrics.criticalRemediations} critical`, up: false } : undefined}
      />
      <MetricCard
        label="Audits"
        value={`${metrics.totalAudits - metrics.openAudits}/${metrics.totalAudits}`}
        icon={<Users />}
        variant="cyan"
        trend={metrics.openAudits > 0 ? { value: `${metrics.openAudits} open`, up: false } : undefined}
      />
      <MetricCard
        label="Training"
        value={`${metrics.totalTrainings - metrics.overdueTrainings}/${metrics.totalTrainings}`}
        icon={<Clock />}
        variant={metrics.overdueTrainings > 0 ? "red" : "emerald"}
        trend={metrics.overdueTrainings > 0 ? { value: `${metrics.overdueTrainings} overdue`, up: false } : undefined}
      />
    </div>
  );
});

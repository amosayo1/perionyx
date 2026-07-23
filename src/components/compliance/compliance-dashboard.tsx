"use client";

import { memo } from "react";
import { Shield, AlertTriangle, XCircle, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceOverviewMetrics } from "./compliance-types";

interface DashboardSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: DashboardSectionProps) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const c = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    blue: "text-blue-400",
    gold: "text-[#d4af37]",
  }[color] ?? "text-zinc-400";

  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-800/40 px-3 py-2">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={cn("text-sm font-semibold", c)}>{value}</span>
    </div>
  );
}

export const ComplianceDashboard = memo(function ComplianceDashboard({ metrics }: { metrics: ComplianceOverviewMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Section title="Obligations" icon={<Shield className="h-3.5 w-3.5" />}>
        <div className="space-y-1.5">
          <StatCard label="Compliant" value={metrics.compliantObligations.toLocaleString()} color="emerald" />
          <StatCard label="Non-Compliant" value={metrics.nonCompliantObligations.toLocaleString()} color="red" />
          <StatCard label="Total" value={metrics.totalObligations.toLocaleString()} color="blue" />
        </div>
      </Section>

      <Section title="Controls & Policies" icon={<Search className="h-3.5 w-3.5" />}>
        <div className="space-y-1.5">
          <StatCard label="Active Policies" value={metrics.activePolicies.toLocaleString()} color="gold" />
          <StatCard label="Total Controls" value={metrics.totalControls.toLocaleString()} color="blue" />
          <StatCard label="Failed Controls" value={metrics.failedControls.toLocaleString()} color="red" />
        </div>
      </Section>

      <Section title="Remediation Status" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
        <div className="space-y-1.5">
          <StatCard label="Open Remediations" value={metrics.openRemediations.toLocaleString()} color="amber" />
          <StatCard label="Critical" value={metrics.criticalRemediations.toLocaleString()} color="red" />
          <StatCard label="Overdue Training" value={metrics.overdueTrainings.toLocaleString()} color="red" />
        </div>
      </Section>
    </div>
  );
});

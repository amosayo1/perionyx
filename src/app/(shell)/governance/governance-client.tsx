"use client";

import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, Clock, BookCheck } from "lucide-react";
import type { GovernanceHealthScore, ViolationSummary } from "@/modules/governance/types";

interface ViolationRow {
  id: string;
  severity: string;
  title: string;
  description: string | null;
  sourceModule: string;
  status: string;
  createdAt: Date;
}

interface ExceptionRow {
  id: string;
  reason: string;
  scope: string;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
}

interface FrameworkRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  policies: { id: string; mappingType: string }[];
}

export function GovernanceDashboardClient({
  metrics,
  violations,
  exceptions,
  frameworks,
}: {
  metrics: { healthScore: GovernanceHealthScore; violations: ViolationSummary; activePolicies: number; activeFrameworks: number; activeExceptions: number; evaluationsToday: number } | null;
  violations: ViolationRow[];
  exceptions: ExceptionRow[];
  frameworks: FrameworkRow[];
}) {
  const health = metrics?.healthScore;

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="text-emerald-400" size={24} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Governance Dashboard</h1>
        </div>
        <p className="text-sm text-zinc-500 ml-10">
          Policy compliance, violations, exceptions, and framework management.
          {metrics ? `${metrics.violations.open} open violations, ${metrics.activeFrameworks} active frameworks.` : ""}
        </p>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <HealthKpiCard
          label="Governance Health"
          value={health ? `${health.overall}/100` : "—"}
          status={health?.level === "critical" ? "critical" : health?.level === "attention" ? "warning" : "healthy"}
        />
        <HealthKpiCard
          label="Open Violations"
          value={String(metrics?.violations.open ?? 0)}
          status={metrics && metrics.violations.open > 0 ? "warning" : "healthy"}
        />
        <HealthKpiCard
          label="Active Frameworks"
          value={String(metrics?.activeFrameworks ?? 0)}
          status="healthy"
        />
        <HealthKpiCard
          label="Active Exceptions"
          value={String(metrics?.activeExceptions ?? 0)}
          status={metrics && metrics.activeExceptions > 3 ? "warning" : "healthy"}
        />
      </div>

      {health && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Health Score Breakdown */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Health Score Breakdown
            </h2>
            <div className="space-y-2">
              <HealthBar label="Policy Compliance" value={health.categories.policyCompliance} />
              <HealthBar label="Violation Trend" value={health.categories.violationTrend} />
              <HealthBar label="Exception Health" value={health.categories.exceptionHealth} />
              <HealthBar label="Audit Health" value={health.categories.auditHealth} />
              <HealthBar label="Approval Health" value={health.categories.approvalHealth} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={14} className="text-zinc-400" />
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <SummaryRow label="Total Violations" value={String(metrics!.violations.total)} />
              <SummaryRow label="Critical" value={String(metrics!.violations.critical)} status={metrics!.violations.critical > 0 ? "critical" : "healthy"} />
              <SummaryRow label="High" value={String(metrics!.violations.high)} status={metrics!.violations.high > 0 ? "warning" : "healthy"} />
              <SummaryRow label="Medium" value={String(metrics!.violations.medium)} />
              <SummaryRow label="Low" value={String(metrics!.violations.low)} />
              <SummaryRow label="Evaluations Today" value={String(metrics!.evaluationsToday)} />
            </div>
          </div>
        </div>
      )}

      {/* Violations & Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Open Violations */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400" />
              Open Violations ({violations.length})
            </h2>
          </div>
          <div className="divide-y divide-white/[0.06] max-h-80 overflow-y-auto">
            {violations.length === 0 ? (
              <p className="text-sm text-zinc-500 p-4">No open violations</p>
            ) : (
              violations.map((v) => (
                <div key={v.id} className="p-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-2">
                    <SeverityDot severity={v.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{v.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {v.sourceModule} · {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {v.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Exceptions */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookCheck size={14} className="text-amber-400" />
              Active Exceptions ({exceptions.length})
            </h2>
          </div>
          <div className="divide-y divide-white/[0.06] max-h-80 overflow-y-auto">
            {exceptions.length === 0 ? (
              <p className="text-sm text-zinc-500 p-4">No active exceptions</p>
            ) : (
              exceptions.map((e) => (
                <div key={e.id} className="p-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{e.reason}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Scope: {e.scope}
                        {e.expiresAt ? ` · Expires ${new Date(e.expiresAt).toLocaleDateString()}` : " · No expiry"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Frameworks Registry */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText size={14} className="text-blue-400" />
            Governance Frameworks ({frameworks.length})
          </h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {frameworks.length === 0 ? (
            <p className="text-sm text-zinc-500 p-4">No frameworks defined</p>
          ) : (
            frameworks.map((f) => (
              <div key={f.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{f.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {f.description ?? "No description"} · {f.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                      f.status === "ACTIVE" ? "bg-emerald-900/30 text-emerald-400" :
                      f.status === "DRAFT" ? "bg-zinc-800 text-zinc-400" :
                      "bg-zinc-800 text-zinc-500"
                    }`}>
                      {f.status}
                    </span>
                    <span className="text-xs text-zinc-500">{f.policies.length} policies</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function HealthKpiCard({ label, value, status }: { label: string; value: string; status?: "healthy" | "warning" | "critical" }) {
  const colorMap = {
    healthy: "border-emerald-500/20 text-emerald-400",
    warning: "border-amber-500/20 text-amber-400",
    critical: "border-red-500/20 text-red-400",
  };

  return (
    <div className={`rounded-xl border ${status ? colorMap[status] : "border-white/[0.06]"} bg-zinc-900/50 p-3`}>
      <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${status ? colorMap[status]?.split(" ")[1] : "text-white"}`}>{value}</p>
    </div>
  );
}

function HealthBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300 font-medium">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, status }: { label: string; value: string; status?: "healthy" | "warning" | "critical" }) {
  const color = status === "critical" ? "text-red-400" : status === "warning" ? "text-amber-400" : "text-zinc-300";
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const color = severity === "CRITICAL" ? "bg-red-500" : severity === "HIGH" ? "bg-amber-500" : severity === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500";
  return <span className={`w-2 h-2 rounded-full ${color} mt-1.5 shrink-0`} />;
}

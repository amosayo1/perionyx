"use client";

import { memo } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceRule, ComplianceViolation } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface ComplianceDashboardProps {
  rules: ComplianceRule[];
  violations: ComplianceViolation[];
  className?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-red-500/20 bg-red-500/10 text-red-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

const STATUS_STYLES: Record<string, string> = {
  open: "border-red-500/20 bg-red-500/10 text-red-400",
  acknowledged: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  waived: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const ComplianceDashboard = memo(function ComplianceDashboard({ rules, violations, className }: ComplianceDashboardProps) {
  const openViolations = violations.filter((v) => v.status === "open").length;
  const criticalViolations = violations.filter((v) => v.severity === "critical").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Active Rules</p>
              <p className="text-xl font-bold text-white">{rules.filter((r) => r.enabled).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Open Violations</p>
              <p className="text-xl font-bold text-amber-400">{openViolations}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Critical</p>
              <p className="text-xl font-bold text-red-400">{criticalViolations}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Resolved</p>
              <p className="text-xl font-bold text-emerald-400">{violations.filter((v) => v.status === "resolved").length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Compliance Rules</h3>
          <div className="space-y-1">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-md border border-zinc-800/40 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", rule.enabled ? "bg-emerald-500" : "bg-zinc-600")} />
                  <span className="text-xs text-zinc-300">{rule.name}</span>
                </div>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[rule.severity])}>
                  {rule.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Recent Violations</h3>
          <div className="space-y-1">
            {violations.length === 0 && <p className="py-4 text-center text-xs text-zinc-600">No violations</p>}
            {violations.slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-md border border-zinc-800/40 px-2.5 py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-zinc-300">{v.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <span>{formatDate(v.detectedAt)}</span>
                    <span>·</span>
                    <span>{v.actualValue.toFixed(1)}% / {v.limitValue.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[v.severity])}>
                    {v.severity}
                  </span>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", STATUS_STYLES[v.status])}>
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

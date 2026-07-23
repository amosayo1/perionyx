"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KpiCard } from "./kpi-card";
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import type { FinancialScoreData, KPIValueData } from "@/modules/intelligence-platform/types";

interface ComplianceDetailProps {
  score: FinancialScoreData;
  kpis: KPIValueData[];
}

function ViolationCount({ count, label }: { count: number; label: string }) {
  const color = count === 0 ? "text-emerald-400" : count < 5 ? "text-amber-400" : "text-red-400";
  const bg = count === 0 ? "bg-emerald-500/10" : count < 5 ? "bg-amber-500/10" : "bg-red-500/10";
  const Icon = count === 0 ? CheckCircle : AlertTriangle;
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2", bg)}>
      <Icon className={cn("h-4 w-4", color)} />
      <div>
        <span className={cn("text-lg font-bold", color)}>{count}</span>
        <span className="ml-1 text-xs text-zinc-500">{label}</span>
      </div>
    </div>
  );
}

export function ComplianceDetail({ score, kpis }: ComplianceDetailProps) {
  const violationsKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("violation") || k.label.toLowerCase().includes("violation"));
  const segregationKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("segregation") || k.label.toLowerCase().includes("segregation"));
  const auditKpi = kpis.find((k) => k.kpiKey?.toLowerCase().includes("audit") || k.label.toLowerCase().includes("audit readiness"));

  const exceptions = score.metadata?.exceptions && Array.isArray(score.metadata.exceptions)
    ? score.metadata.exceptions as string[]
    : [];
  const taxAnomalies = score.metadata?.taxAnomalies && Array.isArray(score.metadata.taxAnomalies)
    ? score.metadata.taxAnomalies as string[]
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <span className="text-2xl font-bold text-amber-400">{Math.round(score.score)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Compliance</h3>
          <p className="text-xs text-zinc-500">{score.summary ?? "Policy compliance, violations, and audit readiness"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {violationsKpi && <ViolationCount count={violationsKpi.currentValue} label="Policy Violations" />}
        {auditKpi && <ViolationCount count={100 - auditKpi.currentValue} label="Audit Gaps" />}
      </div>

      {segregationKpi && (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Segregation of Duties</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-sm font-medium",
              segregationKpi.status === "critical" ? "text-red-400" : segregationKpi.status === "at_risk" ? "text-amber-400" : "text-emerald-400",
            )}>
              {segregationKpi.currentValue.toFixed(0)}%
            </span>
            {segregationKpi.targetValue != null && (
              <span className="text-[10px] text-zinc-600">/ {segregationKpi.targetValue.toFixed(0)}%</span>
            )}
          </div>
        </div>
      )}

      {exceptions.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            Approval Exceptions
          </h4>
          {exceptions.map((ex, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-2.5">
              <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
              <span className="text-xs text-zinc-400">{ex}</span>
            </div>
          ))}
        </div>
      )}

      {auditKpi && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            <FileText className="h-3 w-3 text-amber-400" />
            Audit Readiness
          </h4>
          <div className="h-2 rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(auditKpi.currentValue, 100)}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className="text-xs text-zinc-500">{Math.min(auditKpi.currentValue, 100).toFixed(0)}% complete</span>
        </div>
      )}

      {taxAnomalies.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3 text-red-400" />
            Tax Anomalies
          </h4>
          {taxAnomalies.map((ta, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.03] p-2.5">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
              <span className="text-xs text-zinc-400">{ta}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {kpis.slice(0, 4).map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}

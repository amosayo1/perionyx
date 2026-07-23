"use client";

import { memo } from "react";
import { Lightbulb, AlertOctagon, Shield, TrendingUp, AlertTriangle, BookOpen, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceRecommendation, ComplianceAlert, ComplianceKPI } from "./compliance-types";

interface ExecutiveInsightsProps {
  complianceRate: number;
  controlPassRate: number;
  openRemediations: number;
  overdueTrainings: number;
  topRecommendations: ComplianceRecommendation[];
  criticalAlerts: ComplianceAlert[];
  topKPIs: ComplianceKPI[];
  className?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "text-red-400 border-red-500/20 bg-red-500/10",
  warning: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  info: "text-blue-400 border-blue-500/20 bg-blue-500/10",
};

export const ExecutiveInsights = memo(function ExecutiveInsights({
  complianceRate, controlPassRate, openRemediations, overdueTrainings,
  topRecommendations, criticalAlerts, topKPIs, className,
}: ExecutiveInsightsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", complianceRate >= 80 ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/10")}>
              <Shield className={cn("h-4 w-4", complianceRate >= 80 ? "text-emerald-400" : "text-amber-400")} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Compliance Rate</p>
              <p className="text-lg font-bold text-white">{complianceRate}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Control Pass Rate</p>
              <p className="text-lg font-bold text-white">{controlPassRate}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-zinc-400">Open Remediations</span>
          </div>
          <p className="mt-1 text-lg font-bold text-red-400">{openRemediations}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-red-400" />
            <span className="text-xs text-zinc-400">Overdue Training</span>
          </div>
          <p className="mt-1 text-lg font-bold text-red-400">{overdueTrainings}</p>
        </div>
      </div>

      {topKPIs.length > 0 && (
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <TrendingUp className="h-3.5 w-3.5" />
            Key Metrics
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {topKPIs.slice(0, 4).map(k => (
              <div key={k.name} className="rounded-md border border-zinc-800/40 px-3 py-2">
                <p className="truncate text-[11px] text-zinc-500">{k.name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={cn("text-sm font-bold", k.status === "good" ? "text-emerald-400" : k.status === "critical" ? "text-red-400" : "text-amber-400")}>
                    {k.value}{k.unit === "%" ? "%" : ""}
                  </span>
                  <span className={cn("text-[10px]", k.trend === "up" ? "text-emerald-500" : k.trend === "down" ? "text-red-500" : "text-zinc-500")}>
                    {k.trend === "up" ? "↑" : k.trend === "down" ? "↓" : "→"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations
          </h3>
          {topRecommendations.length === 0 ? (
            <p className="text-xs text-zinc-600">No recommendations</p>
          ) : (
            <div className="space-y-1.5">
              {topRecommendations.slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-zinc-800/40 px-2.5 py-1.5">
                  <span className="truncate text-xs text-zinc-300">{r.title}</span>
                  <span className="shrink-0 text-[10px] text-zinc-500">{r.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <AlertOctagon className="h-3.5 w-3.5" />
            Critical Alerts
          </h3>
          {criticalAlerts.length === 0 ? (
            <p className="text-xs text-zinc-600">No critical alerts</p>
          ) : (
            <div className="space-y-1.5">
              {criticalAlerts.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-red-500/20 px-2.5 py-1.5">
                  <span className="truncate text-xs text-zinc-300">{a.title}</span>
                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[a.severity])}>
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

"use client";

import { WidgetCard, KpiCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function GovernanceCenterWidget({ data }: { data: CommandCenterData["governance"] }) {
  const health = data.healthScore;
  const violations = data.violations;

  return (
    <WidgetCard
      title="Governance Center"
      description={`${health?.overall ?? "—"} health score`}
      status={health?.level === "critical" ? "critical" : health?.level === "attention" ? "warning" : "healthy"}
    >
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <KpiCard label="Health Score" value={health ? `${health.overall}/100` : "—"} />
          <KpiCard label="Policy Violations" value={String(violations?.open ?? 0)} status={violations && violations.open > 0 ? "warning" : "healthy"} />
          <KpiCard label="Pending Approvals" value={String(data.pendingApprovals)} />
          <KpiCard label="Active Exceptions" value={String(data.activeExceptions)} />
        </div>
        {violations && violations.critical > 0 && (
          <div className="rounded-lg bg-red-950/40 border border-red-500/20 p-2.5">
            <p className="text-[11px] font-semibold text-red-400">{violations.critical} Critical Violation{violations.critical > 1 ? "s" : ""}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Requires immediate attention</p>
          </div>
        )}
        {health && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400 flex-1">Active Policies</span>
            <span className="text-sm font-semibold text-white">{data.activePolicies}</span>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

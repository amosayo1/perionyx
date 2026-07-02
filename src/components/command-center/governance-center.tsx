"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function GovernanceCenterWidget({ data }: { data: CommandCenterData["governance"] }) {
  return (
    <WidgetCard
      title="Governance Center"
      description={`${data.auditEvents} audit events`}
      status={data.overdueApprovals > 0 ? "warning" : data.pendingApprovals > 10 ? "warning" : "healthy"}
    >
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Pending Approvals</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.pendingApprovals}</p>
          </div>
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Approval Value</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.approvalValue}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400">Overdue (&gt;24h)</span>
            <span className={`text-sm font-semibold ${data.overdueApprovals > 0 ? "text-amber-400" : "text-white"}`}>{data.overdueApprovals}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400">High-Severity Audit</span>
            <span className={`text-sm font-semibold ${data.highSeverityAudit > 0 ? "text-red-400" : "text-white"}`}>{data.highSeverityAudit}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400">Total Audit Events</span>
            <span className="text-sm font-semibold text-white">{data.auditEvents}</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

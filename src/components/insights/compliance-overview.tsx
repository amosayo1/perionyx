import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, XCircle } from "lucide-react";
import type { ComplianceOverviewData } from "./types";

function Gauge({ value, label }: { value: number; label: string }) {
  const color = value >= 98 ? "text-[#d4af37]" : value >= 95 ? "text-amber-400" : "text-red-400";
  const barColor = value >= 98 ? "bg-[#d4af37]" : value >= 95 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <span className={cn("text-sm font-semibold", color)}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ComplianceOverview({ data }: { data: ComplianceOverviewData }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Compliance Overview</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Policy adherence, audit readiness, and risk posture
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Gauge value={data.policyCompliance} label="Policy Compliance" />
        <Gauge value={data.auditReadiness} label="Audit Readiness" />
        <Gauge value={data.approvalCompliance} label="Approval Compliance" />

        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="text-[11px] text-zinc-500">Risk Exposure</span>
          </div>
          <span className="text-lg font-semibold text-[#d4af37] mt-1 block">{data.riskExposure}</span>
          <p className="text-[10px] text-zinc-600 mt-1">Low — all metrics nominal</p>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-[11px] text-zinc-500">Critical Incidents</span>
          </div>
          <span className="text-lg font-semibold text-white mt-1 block">{data.criticalIncidents}</span>
          <p className="text-[10px] text-zinc-600 mt-1">No critical incidents</p>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] text-zinc-500">Open Exceptions</span>
          </div>
          <span className="text-lg font-semibold text-white mt-1 block">{data.openExceptions}</span>
          <p className="text-[10px] text-zinc-600 mt-1">Under remediation</p>
        </div>
      </div>
    </div>
  );
}

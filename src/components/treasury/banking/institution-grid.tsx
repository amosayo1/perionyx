"use client";

import { cn } from "@/lib/utils";
import { Building2, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import type { BankInstitution } from "@/server/banking/workspace";

const healthConfig = {
  HEALTHY: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
  DEGRADED: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle },
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
};

const statusConfig = {
  CONNECTED: { label: "Connected", color: "text-emerald-400" },
  DISCONNECTED: { label: "Disconnected", color: "text-red-400" },
  PENDING: { label: "Pending", color: "text-amber-400" },
};

const riskConfig = {
  LOW: { label: "Low Risk", color: "text-emerald-400" },
  MEDIUM: { label: "Medium Risk", color: "text-amber-400" },
  HIGH: { label: "High Risk", color: "text-red-400" },
};

interface InstitutionGridProps {
  institutions: BankInstitution[];
  className?: string;
}

export function InstitutionGrid({ institutions, className }: InstitutionGridProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {institutions.map((inst) => {
        const hc = healthConfig[inst.health];
        const sc = statusConfig[inst.status];
        const rc = riskConfig[inst.riskRating];
        const HealthIcon = hc.icon;

        return (
          <div
            key={inst.id}
            className={cn(
              "rounded-lg border bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60",
              hc.border,
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", hc.bg)}>
                  <Building2 className={cn("h-5 w-5", hc.color)} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white">{inst.name}</p>
                  <p className="text-[11px] text-zinc-500">{inst.country}</p>
                </div>
              </div>
              <HealthIcon className={cn("h-5 w-5", hc.color)} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <span className="text-zinc-500">Provider:</span>
                <span className="ml-1 text-zinc-300">{inst.provider}</span>
              </div>
              <div>
                <span className="text-zinc-500">Accounts:</span>
                <span className="ml-1 text-zinc-300">{inst.connectedAccounts}</span>
              </div>
              <div>
                <span className="text-zinc-500">Status:</span>
                <span className={cn("ml-1", sc.color)}>{sc.label}</span>
              </div>
              <div>
                <span className="text-zinc-500">Risk:</span>
                <span className={cn("ml-1", rc.color)}>{rc.label}</span>
              </div>
            </div>

            {inst.relationshipManager && (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
                <span>RM: {inst.relationshipManager}</span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>Last sync: {new Date(inst.lastSync).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Activity, Clock, RefreshCw, AlertTriangle, Shield, ChevronRight } from "lucide-react";
import { ConnectionStatusBadge } from "./connection-status-badge";
import type { ConnectionHealthData } from "./types";

interface ConnectionHealthCardProps {
  data: ConnectionHealthData;
  onManage?: (id: string) => void;
  className?: string;
}

export const ConnectionHealthCard = memo(function ConnectionHealthCard({
  data,
  onManage,
  className,
}: ConnectionHealthCardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]",
      className,
    )} role="article" aria-label={`Connection health for ${data.institutionName}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-sm font-bold text-white/[0.3]">
            {data.institutionName.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/[0.87]">{data.institutionName}</h3>
            <p className="text-xs text-white/[0.5]">via {data.providerName}</p>
          </div>
        </div>
        <ConnectionStatusBadge status={data.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-md bg-white/[0.03] p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-white/[0.4] mb-1">
            <Activity className="h-3 w-3" aria-hidden="true" />
            <span>Health</span>
          </div>
          <span className={cn(
            "text-lg font-semibold",
            data.healthScore >= 90 ? "text-emerald-400" : data.healthScore >= 70 ? "text-amber-400" : "text-red-400",
          )}>
            {data.healthScore}%
          </span>
        </div>
        <div className="rounded-md bg-white/[0.03] p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-white/[0.4] mb-1">
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            <span>Accounts</span>
          </div>
          <span className="text-lg font-semibold text-white/[0.87]">{data.accountsCount}</span>
        </div>
        <div className="rounded-md bg-white/[0.03] p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-white/[0.4] mb-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Last Sync</span>
          </div>
          <span className="text-xs font-medium text-white/[0.7]">{data.lastSync}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/[0.4]">Next Sync</span>
          <span className="text-white/[0.7]">{data.nextSync}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/[0.4]">Credentials</span>
          <span className={cn(
            data.credentialExpiry.includes("Expires in 45") ? "text-white/[0.7]" : "text-amber-400",
          )}>{data.credentialExpiry}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/[0.4]">Permissions</span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-400 capitalize">{data.permissionStatus}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/[0.4]">Currencies</span>
          <span className="text-white/[0.7]">{data.currencies.join(", ")}</span>
        </div>
      </div>

      {data.status === "degraded" && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-500/5 p-2 text-xs text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Connection is degraded. Some features may be delayed.
        </div>
      )}

      <button
        type="button"
        onClick={() => onManage?.(data.id)}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-white/[0.06] py-2 text-xs text-white/[0.5] transition-colors hover:bg-white/[0.04]"
        aria-label={`Manage ${data.institutionName} connection`}
      >
        Manage Connection
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
});

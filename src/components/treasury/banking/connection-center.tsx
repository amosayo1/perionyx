"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Key, History } from "lucide-react";
import type { ConnectionSummary } from "@/server/banking/workspace";

const statusIcon = {
  CONNECTED: CheckCircle,
  DEGRADED: AlertTriangle,
  DISCONNECTED: XCircle,
  ERROR: XCircle,
};

const statusColor = {
  CONNECTED: "text-emerald-400",
  DEGRADED: "text-amber-400",
  DISCONNECTED: "text-red-400",
  ERROR: "text-red-400",
};

const statusBg = {
  CONNECTED: "bg-emerald-500/10",
  DEGRADED: "bg-amber-500/10",
  DISCONNECTED: "bg-red-500/10",
  ERROR: "bg-red-500/10",
};

const syncStatusColor = {
  IDLE: "text-zinc-400",
  SYNCING: "text-blue-400",
  FAILED: "text-red-400",
};

interface ConnectionCenterProps {
  connections: ConnectionSummary[];
  className?: string;
}

export function ConnectionCenter({ connections, className }: ConnectionCenterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {connections.map((conn) => {
        const Icon = statusIcon[conn.status];
        const color = statusColor[conn.status];
        const bg = statusBg[conn.status];

        return (
          <div
            key={conn.id}
            className={cn(
              "flex items-center justify-between rounded-lg border bg-zinc-900/40 p-4",
              conn.status === "ERROR" ? "border-red-500/20" : "border-white/[0.06]",
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">{conn.institution}</p>
                <p className="text-[11px] text-zinc-500">{conn.provider}</p>
              </div>
            </div>

            <div className="hidden items-center gap-5 md:flex">
              <div className="text-center">
                <p className={cn("text-[13px] font-semibold", color)}>{conn.healthScore}</p>
                <p className="text-[10px] text-zinc-500">Score</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-zinc-300">{conn.retryCount}x</p>
                <p className="text-[10px] text-zinc-500">Retries</p>
              </div>
              <div className="text-center">
                <p className={cn("text-[12px]", syncStatusColor[conn.syncStatus])}>{conn.syncStatus}</p>
                <p className="text-[10px] text-zinc-500">Sync</p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                className="flex items-center gap-1 rounded-md bg-zinc-800/50 px-3 py-1.5 text-[11px] text-zinc-300 transition-colors hover:bg-zinc-700/50"
                aria-label={`Reconnect ${conn.institution}`}
              >
                <RefreshCw className="h-3 w-3" />
                Reconnect
              </button>
              <button
                className="flex items-center gap-1 rounded-md bg-zinc-800/50 px-3 py-1.5 text-[11px] text-zinc-300 transition-colors hover:bg-zinc-700/50"
                aria-label={`Rotate credentials for ${conn.institution}`}
              >
                <Key className="h-3 w-3" />
                Rotate
              </button>
              <button
                className="flex items-center gap-1 rounded-md bg-zinc-800/50 px-3 py-1.5 text-[11px] text-zinc-300 transition-colors hover:bg-zinc-700/50"
                aria-label={`View audit history for ${conn.institution}`}
              >
                <History className="h-3 w-3" />
                Audit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
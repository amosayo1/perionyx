"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, AlertOctagon, Info, CheckCircle } from "lucide-react";
import type { LiquidityAlert } from "./types";

export function LiquidityAlertsPanel({ alerts, className }: { alerts: LiquidityAlert[]; className?: string }) {
  const sorted = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const unacked = sorted.filter((a) => !a.acknowledged);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Liquidity Alerts</h3>
            <p className="text-[12px] text-zinc-500">{unacked.length} unacknowledged of {alerts.length} total</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-zinc-500">
            <CheckCircle className="mr-2 h-5 w-5 text-emerald-400" />
            <span className="text-[13px]">No active alerts</span>
          </div>
        ) : (
          sorted.map((alert) => (
            <div key={alert.id} className={cn("px-5 py-4 transition-colors hover:bg-zinc-800/20",
              !alert.acknowledged && "border-l-2",
              !alert.acknowledged && (alert.severity === "emergency" || alert.severity === "critical") && "border-l-red-500",
              !alert.acknowledged && alert.severity === "warning" && "border-l-amber-500",
              !alert.acknowledged && alert.severity === "info" && "border-l-blue-500")}>
              <div className="flex items-start gap-3">
                {alert.severity === "emergency" ? <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" /> :
                 alert.severity === "critical" ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" /> :
                 alert.severity === "warning" ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" /> :
                 <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-white">{alert.title}</p>
                      <p className="text-[12px] text-zinc-400">{alert.message}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase shrink-0",
                      alert.severity === "emergency" ? "bg-red-500/15 text-red-400" :
                      alert.severity === "critical" ? "bg-red-500/10 text-red-400" :
                      alert.severity === "warning" ? "bg-amber-500/10 text-amber-400" :
                      "bg-blue-500/10 text-blue-400")}>{alert.severity}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{new Date(alert.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span>&bull;</span>
                    <span>{alert.category}</span>
                    <span>&bull;</span>
                    <span>{alert.entity}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gold">→ {alert.suggestedAction}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

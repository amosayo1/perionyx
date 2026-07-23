"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, AlertOctagon, X, Check } from "lucide-react";
import { useState } from "react";
import { MOCK_ALERTS } from "./data";
import type { CommandCenterAlert } from "./types";

const SEVERITY_CONFIG: Record<string, { icon: React.ElementType; border: string; bg: string; text: string }> = {
  critical: { icon: AlertOctagon, border: "border-red-500/30", bg: "bg-red-500/5", text: "text-red-400" },
  high: { icon: AlertTriangle, border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400" },
  medium: { icon: AlertCircle, border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400" },
  low: { icon: Info, border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400" },
};

function AlertRow({ alert, index }: { alert: CommandCenterAlert; index: number }) {
  const [dismissed, setDismissed] = useState(false);
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn("flex items-start gap-3 p-4 border-b border-white/[0.04] last:border-b-0", config.bg)}
      role="alert" aria-label={`${alert.severity} alert: ${alert.title}`}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.text)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider border", config.border, config.text)}>
            {alert.severity}
          </span>
          <span className="text-[11px] text-zinc-500">{alert.module}</span>
          {alert.acknowledged && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-600">
              <Check className="h-3 w-3" aria-hidden="true" /> Acknowledged
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] font-medium text-white">{alert.title}</p>
        <p className="text-[12px] text-zinc-400 mt-0.5 leading-relaxed">{alert.message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
        aria-label={`Dismiss alert: ${alert.title}`}
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ActiveAlerts({ className }: { className?: string }) {
  const active = MOCK_ALERTS.filter((a) => !a.acknowledged);
  const acknowledged = MOCK_ALERTS.filter((a) => a.acknowledged);

  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Active alerts">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Active Alerts</h2>
        {active.length > 0 && (
          <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
            {active.length} active
          </span>
        )}
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 overflow-hidden">
        {active.length === 0 && acknowledged.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-zinc-500">No alerts</p>
          </div>
        ) : (
          <>
            {active.map((alert, i) => (
              <AlertRow key={alert.id} alert={alert} index={i} />
            ))}
            {acknowledged.map((alert, i) => (
              <AlertRow key={alert.id} alert={alert} index={i + active.length} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

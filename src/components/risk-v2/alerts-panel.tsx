"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskAlert } from "./risk-types";

interface AlertsPanelProps {
  alerts: RiskAlert[];
  max?: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const SEVERITY_ICONS: Record<string, string> = {
  critical: "!!",
  warning: "!",
  info: "i",
};

export const AlertsPanel = memo(function AlertsPanel({ alerts, max = 10 }: AlertsPanelProps) {
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  }).slice(0, max);

  if (sorted.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No alerts</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((alert) => (
        <div key={alert.id} className={cn("flex items-start gap-3 rounded-lg border p-3", alert.dismissed ? "border-zinc-800/30 bg-zinc-900/20 opacity-60" : "border-zinc-800/60 bg-zinc-900/40")}>
          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded border text-xs font-bold", SEVERITY_COLORS[alert.severity])}>
            {SEVERITY_ICONS[alert.severity]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">{alert.title}</p>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{alert.type}</span>
            </div>
            <p className="text-xs text-zinc-400">{alert.message}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-600">
              {alert.actionRequired && <span className="text-amber-400">Action required</span>}
              {alert.dismissed && <span className="text-zinc-500">Dismissed</span>}
              <span>{alert.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

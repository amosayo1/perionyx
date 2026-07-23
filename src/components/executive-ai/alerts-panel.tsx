"use client";

import { useState, memo } from "react";
import { AlertOctagon, AlertTriangle, Info, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIAlert } from "./ai-types";

interface AlertsPanelProps {
  alerts: AIAlert[];
  onDismiss?: (id: string) => void;
  className?: string;
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertOctagon, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10", dot: "bg-red-500" },
  warning: { icon: AlertTriangle, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", dot: "bg-amber-500" },
  info: { icon: Info, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10", dot: "bg-blue-500" },
};

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export const AIAlertsPanel = memo(function AIAlertsPanel({ alerts, onDismiss, className }: AlertsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...alerts]
    .filter(a => !a.dismissed)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  if (sorted.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-8", className)}>
        <p className="text-sm text-zinc-500">No active AI alerts</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        AI Alerts ({sorted.length})
      </h2>

      {sorted.map(alert => {
        const config = SEVERITY_CONFIG[alert.severity];
        const SeverityIcon = config.icon;
        const isExpanded = expanded === alert.id;

        return (
          <div
            key={alert.id}
            className={cn("rounded-lg border bg-zinc-900/40 transition-colors hover:bg-zinc-900/60", config.border)}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 flex-shrink-0">
                <SeverityIcon className={cn("h-5 w-5", config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", alert.severity === "critical" ? "text-red-300" : "text-white")}>
                        {alert.title}
                      </span>
                      <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", config.bg, config.border, config.color)}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {alert.actionRequired && (
                      <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                        Action
                      </span>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : alert.id)}
                      className="rounded p-0.5 text-zinc-600 hover:text-zinc-400"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => onDismiss?.(alert.id)}
                      className="rounded p-0.5 text-zinc-600 hover:text-zinc-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {!isExpanded && (
                  <p className="mt-1 truncate text-xs text-zinc-500">{alert.message}</p>
                )}
                {alert.type && (
                  <p className="mt-1 text-[11px] text-zinc-600">{alert.type.replace(/-/g, " ")}</p>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-zinc-800/40 px-4 pb-3 pt-2">
                <p className="text-sm text-zinc-400">{alert.message}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-600">
                  <span>Type: {alert.type.replace(/-/g, " ")}</span>
                  <span>·</span>
                  <span>{new Date(alert.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

"use client";

import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description?: string;
  timestamp: Date;
  owner?: string;
  suggestedAction?: string;
  category?: string;
}

interface AlertCenterProps {
  alerts: Alert[];
  maxAlerts?: number;
  className?: string;
  onAlertClick?: (alert: Alert) => void;
}

const severityConfig = {
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    border: "border-l-red-500",
    bg: "bg-red-500/5",
    text: "text-red-400",
    icon: "●",
  },
  high: {
    label: "High",
    dot: "bg-orange-500",
    border: "border-l-orange-500",
    bg: "bg-orange-500/5",
    text: "text-orange-400",
    icon: "●",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-500",
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    icon: "●",
  },
  low: {
    label: "Low",
    dot: "bg-zinc-500",
    border: "border-l-zinc-500",
    bg: "bg-zinc-500/5",
    text: "text-zinc-400",
    icon: "●",
  },
};

function formatTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AlertCenter({ alerts, maxAlerts = 10, className, onAlertClick }: AlertCenterProps) {
  const sorted = [...alerts]
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, maxAlerts);

  if (sorted.length === 0) {
    return (
      <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5", className)}>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            Alerts
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
            All Clear
          </span>
        </div>
        <p className="text-[13px] text-zinc-500">No active alerts. All systems operating normally.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/30", className)}>
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-zinc-300 uppercase">
            Alerts
          </span>
          {sorted.filter((a) => a.severity === "critical" || a.severity === "high").length > 0 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] text-red-400">
              {sorted.filter((a) => a.severity === "critical" || a.severity === "high").length} requiring action
            </span>
          )}
        </div>
      </div>
      <div className="divide-y divide-zinc-800/40">
        {sorted.map((alert) => {
          const sc = severityConfig[alert.severity];
          return (
            <div
              key={alert.id}
              className={cn(
                "border-l-2 px-5 py-3 transition-colors hover:bg-zinc-800/30",
                sc.border,
                onAlertClick && "cursor-pointer",
              )}
              onClick={() => onAlertClick?.(alert)}
              role={onAlertClick ? "button" : undefined}
              tabIndex={onAlertClick ? 0 : undefined}
              onKeyDown={onAlertClick ? (e) => { if (e.key === "Enter") onAlertClick(alert); } : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px]", sc.text)}>{sc.icon}</span>
                    <span className={cn("text-[11px] font-medium", sc.text)}>{sc.label}</span>
                    {alert.category && (
                      <span className="text-[11px] text-zinc-500">{alert.category}</span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-zinc-200">{alert.title}</p>
                  {alert.description && (
                    <p className="text-[12px] text-zinc-500">{alert.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right text-[11px] text-zinc-500">
                  <p>{formatTime(alert.timestamp)}</p>
                </div>
              </div>
              {(alert.owner || alert.suggestedAction) && (
                <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                  {alert.owner && <span>Owner: {alert.owner}</span>}
                  {alert.suggestedAction && (
                    <span className="text-zinc-400">Suggested: {alert.suggestedAction}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { memo } from "react";
import { AlertOctagon, AlertTriangle, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "./tax-types";

interface AuditTimelineProps {
  events: AuditEvent[];
  className?: string;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertOctagon, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10", dot: "bg-red-500" },
  warning: { icon: AlertTriangle, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", dot: "bg-amber-500" },
  info: { icon: Info, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10", dot: "bg-blue-500" },
};

export const AuditTimeline = memo(function AuditTimeline({ events, className }: AuditTimelineProps) {
  const criticalCount = events.filter((e) => e.severity === "critical").length;
  const warningCount = events.filter((e) => e.severity === "warning").length;
  const infoCount = events.filter((e) => e.severity === "info").length;

  if (events.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-8", className)}>
        <p className="text-sm text-zinc-500">No audit events recorded</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
          <p className="text-[11px] text-red-400/70">Critical</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
          <p className="text-[11px] text-amber-400/70">Warning</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{infoCount}</p>
          <p className="text-[11px] text-blue-400/70">Info</p>
        </div>
      </div>

      <div className="space-y-2">
        {[...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50).map((event) => {
          const config = SEVERITY_CONFIG[event.severity] ?? SEVERITY_CONFIG.info;
          const Icon = config.icon;

          return (
            <div key={event.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 transition-colors hover:border-zinc-700/60">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", config.border, config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">{event.description}</p>
                    <span className="shrink-0 text-[11px] text-zinc-500">{formatDate(event.timestamp)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="capitalize">{event.eventType.replace(/-/g, " ")}</span>
                    <span>·</span>
                    <span className="capitalize">{event.entityType}</span>
                    {event.userName && (
                      <>
                        <span>·</span>
                        <span>{event.userName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

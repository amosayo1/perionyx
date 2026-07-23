"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ActivityEvent {
  id: string;
  icon: LucideIcon;
  iconColor?: string;
  actor: string;
  action: string;
  timestamp: Date;
  workflow?: string;
  status?: "completed" | "running" | "failed" | "pending" | "warning";
  onClick?: () => void;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  maxEvents?: number;
  className?: string;
  title?: string;
}

const statusConfig = {
  completed: { dot: "bg-emerald-500", text: "text-emerald-400", label: "Completed" },
  running: { dot: "bg-blue-500", text: "text-blue-400", label: "Running" },
  failed: { dot: "bg-red-500", text: "text-red-400", label: "Failed" },
  pending: { dot: "bg-amber-500", text: "text-amber-400", label: "Pending" },
  warning: { dot: "bg-orange-500", text: "text-orange-400", label: "Warning" },
};

function formatTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function ActivityTimeline({ events, maxEvents = 10, className, title = "Recent Activity" }: ActivityTimelineProps) {
  const display = events.slice(0, maxEvents);

  if (display.length === 0) {
    return (
      <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5", className)}>
        <div className="mb-3">
          <span className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            {title}
          </span>
        </div>
        <p className="text-[13px] text-zinc-500">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/30", className)}>
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <span className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-zinc-300 uppercase">
          {title}
        </span>
      </div>
      <div className="relative px-5 py-3">
        <div className="absolute bottom-0 left-[37px] top-0 w-px bg-zinc-800" />
        <div className="space-y-0">
          {display.map((event, i) => {
            const sc = event.status ? statusConfig[event.status] : null;
            const Icon = event.icon;
            return (
              <div
                key={event.id}
                className={cn(
                  "group relative flex gap-4 py-3",
                  event.onClick && "cursor-pointer",
                )}
                onClick={event.onClick}
                role={event.onClick ? "button" : undefined}
                tabIndex={event.onClick ? 0 : undefined}
                onKeyDown={event.onClick ? (e) => { if (e.key === "Enter" && event.onClick) event.onClick(); } : undefined}
              >
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                  <Icon className={cn("h-3.5 w-3.5", event.iconColor ?? "text-zinc-400")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-zinc-200">
                        <span className="font-medium text-white">{event.actor}</span>
                        {" "}{event.action}
                      </p>
                      {event.workflow && (
                        <p className="mt-0.5 text-[12px] text-zinc-500">{event.workflow}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {sc && (
                        <span className={cn("flex items-center gap-1 text-[11px]", sc.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                          {sc.label}
                        </span>
                      )}
                      <span className="shrink-0 text-[11px] text-zinc-600">{formatTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { WidgetCard } from "./widget-card";
import { cn } from "@/lib/utils";
import type { EnterpriseEvent } from "@/modules/command-center/command-center.service";

const CATEGORY_COLORS: Record<string, string> = {
  treasury: "border-l-emerald-500",
  governance: "border-l-blue-500",
  risk: "border-l-red-500",
  intelligence: "border-l-amber-500",
  operations: "border-l-purple-500",
};

const CATEGORY_ICONS: Record<string, string> = {
  treasury: "◆",
  governance: "▲",
  risk: "●",
  intelligence: "■",
  operations: "◆",
};

export function EnterpriseTimelineWidget({ events }: { events: EnterpriseEvent[] }) {
  const recent = events.slice(0, 15);

  return (
    <WidgetCard title="Enterprise Timeline" description={`${events.length} recent events`}>
      {recent.length === 0 ? (
        <p className="text-sm text-zinc-500">No events recorded yet.</p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {recent.map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-white/[0.06] border-l-2 bg-black/20 px-3 py-2",
                CATEGORY_COLORS[event.category ?? ""] ?? "border-l-zinc-500",
              )}
            >
              <span className="text-xs mt-0.5 shrink-0 opacity-50">{CATEGORY_ICONS[event.category ?? ""] ?? "·"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white truncate">{event.label}</span>
                  {event.severity && (
                    <span className={cn(
                      "text-[9px] px-1 rounded font-medium",
                      event.severity === "CRITICAL" && "bg-red-500/20 text-red-400",
                      event.severity === "HIGH" && "bg-amber-500/20 text-amber-400",
                    )}>{event.severity}</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">{event.description}</p>
              </div>
              <span className="text-[10px] text-zinc-600 shrink-0">
                {formatTimeAgo(event.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

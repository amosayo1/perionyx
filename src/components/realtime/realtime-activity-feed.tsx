"use client";

// ---------------------------------------------------------------------------
// Real-Time Activity Feed — Live stream of system events
// ---------------------------------------------------------------------------
// Shows the latest workflow, approval, and notification events
// as they arrive via SSE.

import { useState, useEffect, useCallback } from "react";
import { useRealtime } from "@/hooks/use-realtime";

interface Activity {
  id: string;
  event: string;
  data: unknown;
  timestamp: string;
}

export function RealtimeActivityFeed({ maxItems = 50 }: { maxItems?: number }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = useCallback(
    (event: string, data: unknown) => {
      setActivities((prev) => {
        const next = [
          {
            id: crypto.randomUUID(),
            event,
            data,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ];
        return next.slice(0, maxItems);
      });
    },
    [maxItems],
  );

  useRealtime({
    channels: ["workflow", "approval", "notification", "queue", "connector"],
    onEvent: addActivity,
  });

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Waiting for events...
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b text-sm font-medium">Live Activity</div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {activities.map((a) => (
          <div key={a.id} className="px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <EventBadge event={a.event} />
              <span className="font-mono text-muted-foreground">
                {formatTime(a.timestamp)}
              </span>
            </div>
            <div className="mt-0.5 text-muted-foreground truncate">
              {formatEventData(a.event, a.data)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventBadge({ event }: { event: string }) {
  const colors: Record<string, string> = {
    "workflow:completed": "bg-green-500",
    "workflow:failed": "bg-red-500",
    "workflow:started": "bg-blue-500",
    "approval:granted": "bg-emerald-500",
    "approval:rejected": "bg-rose-500",
    "approval:requested": "bg-amber-500",
    "notification:new": "bg-violet-500",
    "queue:job:completed": "bg-green-500",
    "queue:job:failed": "bg-red-500",
    "connector:sync:completed": "bg-cyan-500",
    "connector:sync:failed": "bg-orange-500",
  };

  const color = colors[event] ?? "bg-gray-500";
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString();
}

function formatEventData(event: string, data: unknown): string {
  const d = data as Record<string, unknown>;
  if (d?.title) return String(d.title);
  if (d?.definitionName) return String(d.definitionName);
  if (d?.status) return `${event.split(":")[0]}: ${String(d.status)}`;
  return event;
}

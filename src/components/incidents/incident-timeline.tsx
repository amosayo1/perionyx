"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  UserPlus,
  ArrowUpRight,
  RotateCcw,
  Send,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncidentEvent } from "./types";
import { getIncidentEvents } from "./data";
import { useEffect, useState } from "react";

const eventConfig: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  created: {
    icon: <Activity className="h-3.5 w-3.5" />,
    color: "text-blue-400",
  },
  assigned: {
    icon: <UserPlus className="h-3.5 w-3.5" />,
    color: "text-purple-400",
  },
  comment: {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    color: "text-zinc-400",
  },
  escalated: {
    icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    color: "text-orange-400",
  },
  sla_warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: "text-amber-400",
  },
  workflow_updated: {
    icon: <Activity className="h-3.5 w-3.5" />,
    color: "text-blue-400",
  },
  resolved: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-[#d4af37]",
  },
  closed: {
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-zinc-500",
  },
  reopened: {
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    color: "text-amber-400",
  },
  transferred: {
    icon: <Send className="h-3.5 w-3.5" />,
    color: "text-purple-400",
  },
};

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function IncidentTimeline({ incidentId }: { incidentId: string }) {
  const [events, setEvents] = useState<IncidentEvent[]>([]);

  useEffect(() => {
    setEvents(getIncidentEvents(incidentId));
  }, [incidentId]);

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const cfg = eventConfig[event.type] ?? {
          icon: <Activity className="h-3.5 w-3.5" />,
          color: "text-zinc-500",
        };
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="flex items-start gap-3 pb-1">
            {/* Timeline line + icon */}
            <div className="relative flex flex-col items-center">
              <div className={cn("relative z-10 flex h-6 w-6 items-center justify-center", cfg.color)}>
                {cfg.icon}
              </div>
              {!isLast && (
                <div className="absolute top-6 h-full w-px bg-zinc-800" />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-4">
              <p className="text-xs font-medium text-zinc-300">{event.actor}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                {event.description}
              </p>
              <p className="text-[10px] text-zinc-700 mt-1">{formatTime(event.timestamp)}</p>
            </div>
          </div>
        );
      })}
      {events.length === 0 && (
        <p className="text-xs text-zinc-600 py-4 text-center">No timeline events found.</p>
      )}
    </div>
  );
}

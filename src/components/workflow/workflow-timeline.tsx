"use client";

import { cn } from "@/lib/utils";
import type { WorkflowEvent } from "./types";
import { formatDateTime } from "@/lib/format";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  FileText,
  UserPlus,
  MessageSquare,
  ArrowUpCircle,
  Activity,
} from "lucide-react";
import React from "react";

interface Props {
  events: WorkflowEvent[];
  compact?: boolean;
}

function EventIcon({ type }: { type: string }) {
  const size = "h-3.5 w-3.5";
  switch (type) {
    case "created":
      return <Send className={cn(size, "text-gold")} />;
    case "approved":
      return <CheckCircle2 className={cn(size, "text-gold")} />;
    case "rejected":
      return <XCircle className={cn(size, "text-red-400")} />;
    case "escalated":
      return <ArrowUpCircle className={cn(size, "text-amber-400")} />;
    case "pending":
      return <Clock className={cn(size, "text-zinc-500")} />;
    case "reminder":
      return <AlertTriangle className={cn(size, "text-amber-400")} />;
    case "comment":
      return <MessageSquare className={cn(size, "text-blue-400")} />;
    case "document-request":
      return <FileText className={cn(size, "text-amber-400")} />;
    case "reassign":
      return <UserPlus className={cn(size, "text-purple-400")} />;
    default:
      return <Activity className={cn(size, "text-zinc-500")} />;
  }
}

export function WorkflowTimeline({ events, compact = false }: Props) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-zinc-600 text-center py-4">No workflow events recorded.</p>
    );
  }

  // Sort chronologically
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div className="relative">
      {sorted.map((event, idx) => {
        const isLast = idx === sorted.length - 1;
        const isRejection = event.type === "rejected";
        const isEscalation = event.type === "escalated";
        const isActive = event.type === "pending";

        return (
          <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[7px] top-5 h-full w-px",
                  isRejection ? "bg-red-500/20" : "bg-zinc-700/50",
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-[15px] w-[15px] items-center justify-center shrink-0 mt-0.5",
              )}
            >
              <EventIcon type={event.type} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isRejection && "text-red-400",
                    isEscalation && "text-amber-400",
                    isActive && "text-zinc-500",
                    !isRejection && !isEscalation && !isActive && "text-zinc-300",
                  )}
                >
                  {event.label}
                </p>
                <span className="text-[10px] text-zinc-600 shrink-0">{formatDateTime(event.timestamp)}</span>
              </div>
              {event.description && (
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{event.description}</p>
              )}
              {event.actor && (
                <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">{event.actor}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

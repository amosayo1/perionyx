"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp, AlertTriangle, Lightbulb, Shield, Flag, ChevronDown, Circle,
} from "lucide-react";
import type { InsightEventData } from "@/modules/intelligence-platform/types";

interface InsightTimelineProps {
  events: InsightEventData[];
  onMarkRead: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const EVENT_ICONS: Record<string, typeof Lightbulb> = {
  score_change: TrendingUp,
  kpi_threshold: AlertTriangle,
  recommendation: Lightbulb,
  alert: Shield,
  milestone: Flag,
};

const SEVERITY_COLORS: Record<string, { dot: string; line: string; bg: string }> = {
  critical: { dot: "bg-red-500", line: "bg-red-500/30", bg: "bg-red-500/10" },
  warning: { dot: "bg-amber-500", line: "bg-amber-500/30", bg: "bg-amber-500/10" },
  normal: { dot: "bg-blue-500", line: "bg-blue-500/30", bg: "bg-blue-500/10" },
  good: { dot: "bg-emerald-500", line: "bg-emerald-500/30", bg: "bg-emerald-500/10" },
};

export function InsightTimeline({ events, onMarkRead, onLoadMore, hasMore }: InsightTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lightbulb className="mb-2 h-8 w-8 text-zinc-700" />
        <p className="text-sm font-medium text-zinc-500">No insights yet</p>
        <p className="mt-1 text-xs text-zinc-600">New insights will appear here as they are generated.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-800" />
      <AnimatePresence>
        {events.map((event, i) => {
          const Icon = EVENT_ICONS[event.eventType] ?? Lightbulb;
          const colors = SEVERITY_COLORS[event.severity] ?? SEVERITY_COLORS.normal;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "relative ml-8 pb-5 pl-4",
                i === events.length - 1 && "pb-0",
              )}
            >
              <div className={cn(
                "absolute -left-[23px] top-1 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-zinc-900",
                colors.dot,
              )}>
                <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
              </div>
              <div
                className={cn(
                  "cursor-pointer rounded-lg border border-white/[0.06] bg-zinc-900/60 p-3 transition-colors hover:border-white/[0.12]",
                  !event.isRead && "border-amber-500/20 bg-amber-500/[0.02]",
                )}
                onClick={() => { if (!event.isRead) onMarkRead(event.id); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" && !event.isRead) onMarkRead(event.id); }}
              >
                <div className="flex items-start gap-2">
                  <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", colors.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", colors.dot.replace("bg-", "text-"))} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-xs font-medium", event.isRead ? "text-zinc-400" : "text-white")}>
                        {event.title}
                      </p>
                      {!event.isRead && <Circle className="h-1.5 w-1.5 fill-amber-400 text-amber-400" />}
                    </div>
                    {event.description && (
                      <p className="mt-0.5 text-xs text-zinc-500">{event.description}</p>
                    )}
                    {event.impact && (
                      <p className="mt-1 text-[10px] text-zinc-600">Impact: {event.impact}</p>
                    )}
                    <p className="mt-1 text-[10px] text-zinc-700">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {hasMore && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLoadMore}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-900/40 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Load more
        </motion.button>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimelineEventData {
  id: string;
  stage: string;
  module: string;
  summary: string;
  timestamp: string;
  status: string;
  actor?: string;
  reason?: string;
  linkedRecords?: { label: string; href: string }[];
}

interface TimelineViewProps {
  events: TimelineEventData[];
  title?: string;
  duration?: string;
  status?: string;
  className?: string;
  stepMode?: boolean;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-500",
  APPROVED: "bg-emerald-500",
  POSTED: "bg-emerald-500",
  CREATED: "bg-blue-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
  REJECTED: "bg-red-500",
  BLOCKED: "bg-red-500",
  INFO: "bg-zinc-500",
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-zinc-500",
  EXCEPTION: "bg-red-500",
  default: "bg-zinc-500",
};

export function TimelineView({
  events,
  title,
  duration,
  status,
  className,
  stepMode,
  currentStep,
  onStepChange,
}: TimelineViewProps) {
  if (events.length === 0) return null;

  const displayEvents = stepMode && currentStep !== undefined
    ? events.slice(0, currentStep + 1)
    : events;

  return (
    <div className={cn("space-y-3", className)}>
      {(title || duration || status) && (
        <div className="flex items-center gap-3">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {duration && (
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">
              {duration}
            </span>
          )}
          {status && (
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-300">
              {status}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.08]" />

        <div className="space-y-0">
          {displayEvents.map((event, i) => {
            const isActive = stepMode && currentStep !== undefined && i === currentStep;
            const color = statusColors[event.status] ?? statusColors.default;

            return (
              <motion.div
                key={event.id}
                initial={stepMode ? { opacity: 0, x: -8 } : undefined}
                animate={stepMode ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.2, delay: 0.05 }}
                className={cn(
                  "group relative flex gap-4 px-2 py-2.5 rounded-lg transition-colors",
                  isActive ? "bg-gold/5" : "hover:bg-white/[0.02]",
                  stepMode && onStepChange ? "cursor-pointer" : "",
                )}
                onClick={() => stepMode && onStepChange?.(i)}
              >
                {/* Dot */}
                <div className="relative z-10 mt-1">
                  <div className={cn(
                    "h-[10px] w-[10px] rounded-full border-2 border-zinc-900",
                    isActive ? "ring-2 ring-gold/40" : "",
                    color,
                  )} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{event.stage}</span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">
                      {event.module}
                    </span>
                    <span className="text-[10px] text-zinc-600 ml-auto">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{event.summary}</p>
                  {(event.actor || event.reason) && (
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-600">
                      {event.actor && <span>By: {event.actor}</span>}
                      {event.reason && <span>Reason: {event.reason}</span>}
                    </div>
                  )}
                  {event.linkedRecords && event.linkedRecords.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      {event.linkedRecords.map((lr) => (
                        <a
                          key={lr.href}
                          href={lr.href}
                          className="text-[10px] text-gold underline decoration-dotted underline-offset-2 hover:text-gold/80"
                        >
                          {lr.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {stepMode && onStepChange && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onStepChange(Math.max(0, (currentStep ?? 0) - 1))}
            disabled={currentStep === 0}
            className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[10px] text-zinc-600">
            Step {(currentStep ?? 0) + 1} of {events.length}
          </span>
          <button
            onClick={() => onStepChange(Math.min(events.length - 1, (currentStep ?? 0) + 1))}
            disabled={currentStep === events.length - 1}
            className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export type { TimelineEventData };

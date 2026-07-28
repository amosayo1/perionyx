"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, listItem } from "@/components/enterprise/motion/tokens";
import {
  Check,
  Clock,
  ArrowDown,
  AlertTriangle,
  Circle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Priority {
  id: string;
  title: string;
  description?: string;
  urgency?: "critical" | "high" | "medium" | "low";
  dueDate?: string;
  status?: "pending" | "in_progress" | "completed" | "deferred";
}

interface PriorityListProps {
  priorities: Priority[];
  onComplete?: (id: string) => void;
  onDefer?: (id: string) => void;
  className?: string;
}

const URGENCY_CONFIG: Record<
  string,
  { icon: typeof AlertTriangle; color: string; bg: string; border: string; sort: number }
> = {
  critical: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", sort: 0 },
  high: { icon: ArrowDown, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", sort: 1 },
  medium: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", sort: 2 },
  low: { icon: Circle, color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20", sort: 3 },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: "text-zinc-400", label: "Pending" },
  in_progress: { color: "text-blue-400", label: "In Progress" },
  completed: { color: "text-emerald-400", label: "Completed" },
  deferred: { color: "text-zinc-500", label: "Deferred" },
};

function formatDueDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days}d left`;
  } catch {
    return "";
  }
}

export function PriorityList({ priorities, onComplete, onDefer, className }: PriorityListProps) {
  const [sortByUrgency, setSortByUrgency] = useState(true);

  const sorted = useMemo(() => {
    if (!sortByUrgency) return priorities;
    return [...priorities].sort((a, b) => {
      const aUrgency = URGENCY_CONFIG[a.urgency ?? "low"].sort;
      const bUrgency = URGENCY_CONFIG[b.urgency ?? "low"].sort;
      return aUrgency - bUrgency;
    });
  }, [priorities, sortByUrgency]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("space-y-2", className)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-500">{priorities.length} priorities</span>
        <button
          onClick={() => setSortByUrgency(!sortByUrgency)}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowDown className={cn("h-3 w-3 transition-transform", sortByUrgency ? "text-gold" : "")} />
          {sortByUrgency ? "By urgency" : "Default"}
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {sorted.map((priority) => {
          const urgency = URGENCY_CONFIG[priority.urgency ?? "low"];
          const UrgencyIcon = urgency.icon;
          const status = STATUS_CONFIG[priority.status ?? "pending"];
          const dueDate = formatDueDate(priority.dueDate);
          const isDone = priority.status === "completed" || priority.status === "deferred";

          return (
            <motion.div
              key={priority.id}
              variants={listItem}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                isDone
                  ? "border-white/[0.06] bg-[#111118]/60 opacity-60"
                  : cn(urgency.border, "bg-[#111118]"),
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    urgency.bg,
                    urgency.color,
                  )}
                >
                  <UrgencyIcon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("truncate text-sm font-medium", isDone ? "text-zinc-500" : "text-white")}>
                      {priority.title}
                    </h4>
                    <span className={cn("text-[10px] font-medium", status.color)}>
                      {status.label}
                    </span>
                  </div>

                  {priority.description && (
                    <p className="mt-1 truncate text-xs text-zinc-500">{priority.description}</p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    {dueDate && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          dueDate.includes("overdue") ? "text-red-400" : "text-zinc-500",
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {dueDate}
                      </span>
                    )}
                    {!dueDate && <span />}

                    {!isDone && (
                      <div className="flex gap-1.5">
                        {onDefer && priority.status !== "deferred" && (
                          <button
                            onClick={() => onDefer(priority.id)}
                            className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 hover:bg-white/10 transition-colors"
                          >
                            Defer
                          </button>
                        )}
                        {onComplete && priority.status !== "completed" && (
                          <button
                            onClick={() => onComplete(priority.id)}
                            className="flex items-center gap-1 rounded border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold hover:bg-gold/20 transition-colors"
                          >
                            <Check className="h-3 w-3" />
                            Done
                          </button>
                        )}
                      </div>
                    )}

                    {priority.status === "completed" && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <Check className="h-3 w-3" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {priorities.length === 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-8 text-center">
          <Check className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
          <p className="text-xs text-zinc-500">No priorities</p>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Clock, Search, Filter, ArrowUpRight, AlertCircle,
  CheckCircle2, DollarSign, FileText, UserPlus, Shield,
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  type: "approval" | "payment" | "alert" | "compliance" | "transfer" | "report";
  title: string;
  description: string;
  timestamp: Date;
  priority?: "high" | "medium" | "low";
  amount?: string;
  deepLink?: string;
}

const typeConfig = {
  approval: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
  payment: { icon: DollarSign, color: "text-[#d4af37]", bg: "bg-[#d4af37]/[0.06]" },
  alert: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/[0.06]" },
  compliance: { icon: Shield, color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
  transfer: { icon: ArrowUpRight, color: "text-purple-400", bg: "bg-purple-500/[0.06]" },
  report: { icon: FileText, color: "text-zinc-400", bg: "bg-zinc-500/[0.06]" },
};

const priorityDot = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-500",
};

function groupEvents(events: TimelineEvent[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const groups: { label: string; items: TimelineEvent[] }[] = [];

  const todayItems = events.filter((e) => e.timestamp >= today);
  const yesterdayItems = events.filter((e) => e.timestamp >= yesterday && e.timestamp < today);
  const earlierItems = events.filter((e) => e.timestamp < yesterday);

  if (todayItems.length) groups.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length) groups.push({ label: "Yesterday", items: yesterdayItems });
  if (earlierItems.length) groups.push({ label: "Earlier", items: earlierItems });

  return groups;
}

export function ExecutiveTimeline({
  events,
  onEventClick,
  className,
}: {
  events: TimelineEvent[];
  onEventClick?: (id: string) => void;
  className?: string;
}) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (priorityFilter !== "all" && e.priority !== priorityFilter) return false;
      return true;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, search, priorityFilter]);

  const groups = groupEvents(filtered);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-zinc-900/60 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search timeline..."
          className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          aria-label="Search timeline"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-zinc-600 active:text-zinc-400" aria-label="Clear search">
            <Filter className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2 flex gap-1.5">
        {(["all", "high", "medium", "low"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors min-h-[28px]",
              priorityFilter === p ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500 active:bg-zinc-800",
            )}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{group.label}</span>
              <span className="text-[10px] text-zinc-700">{group.items.length} events</span>
            </div>
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {group.items.map((event) => {
                  const cfg = typeConfig[event.type];
                  const Icon = cfg.icon;

                  return (
                    <motion.button
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => onEventClick?.(event.id)}
                      className="flex w-full items-start gap-3 rounded-xl p-3 text-left active:bg-zinc-800/50"
                    >
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
                        <Icon className={cn("h-4 w-4", cfg.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-zinc-200">{event.title}</span>
                          {event.priority && (
                            <span className={cn("h-2 w-2 shrink-0 rounded-full", priorityDot[event.priority])} />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{event.description}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[9px] text-zinc-600">
                            {event.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {event.amount && (
                            <span className="text-[10px] font-medium text-zinc-400">{event.amount}</span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-zinc-700" />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Clock className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}

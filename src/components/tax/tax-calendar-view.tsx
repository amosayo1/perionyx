"use client";

import { memo } from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxCalendarEntry } from "./tax-types";

interface TaxCalendarViewProps {
  entries: TaxCalendarEntry[];
  className?: string;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_CONFIG = {
  upcoming: { icon: Calendar, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10", dot: "bg-blue-500" },
  due: { icon: Clock, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", dot: "bg-amber-500" },
  overdue: { icon: AlertTriangle, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10", dot: "bg-red-500" },
  completed: { icon: CheckCircle, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
  waived: { icon: XCircle, color: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-500/10", dot: "bg-zinc-500" },
};

export const TaxCalendarView = memo(function TaxCalendarView({ entries, className }: TaxCalendarViewProps) {
  const upcomingCount = entries.filter((e) => e.status === "upcoming").length;
  const dueCount = entries.filter((e) => e.status === "due").length;
  const overdueCount = entries.filter((e) => e.status === "overdue").length;
  const completedCount = entries.filter((e) => e.status === "completed").length;

  if (entries.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-8", className)}>
        <p className="text-sm text-zinc-500">No calendar entries</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{upcomingCount}</p>
          <p className="text-[11px] text-blue-400/70">Upcoming</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{dueCount}</p>
          <p className="text-[11px] text-amber-400/70">Due</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-[11px] text-red-400/70">Overdue</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
          <p className="text-[11px] text-emerald-400/70">Completed</p>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/40 overflow-hidden rounded-lg border border-zinc-800/60">
        {[...entries]
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 50)
          .map((entry) => {
            const config = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.upcoming;
            const Icon = config.icon;

            return (
              <div key={entry.id} className="flex items-center gap-3 bg-zinc-900/40 px-4 py-3 transition-colors hover:bg-zinc-900/60">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", config.border, config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{entry.jurisdictionId}</span>
                    <span>·</span>
                    <span className="capitalize">{entry.obligationType}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatDate(entry.dueDate)}</p>
                  {entry.estimatedAmount != null && (
                    <p className="text-[11px] text-zinc-500">${(entry.estimatedAmount / 1000).toFixed(0)}K</p>
                  )}
                </div>
                <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", config.border, config.bg, config.color)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                  {entry.status}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
});

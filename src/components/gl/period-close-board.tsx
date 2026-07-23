"use client";

import { memo } from "react";
import { Lock, Unlock, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountingPeriod, ClosingChecklist } from "./gl-types";

interface PeriodCloseBoardProps {
  periods: AccountingPeriod[];
  checklists: Record<string, ClosingChecklist[]>;
  onClose?: (id: string) => void;
  onReopen?: (id: string) => void;
  className?: string;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PERIOD_STATUS_STYLES: Record<string, string> = {
  open: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  "soft-close": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "hard-close": "border-red-500/20 bg-red-500/10 text-red-400",
  locked: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  reopened: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

const CLOSE_STATUS_STYLES: Record<string, string> = {
  "not-started": "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  "in-progress": "border-blue-500/20 bg-blue-500/10 text-blue-400",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  verified: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  exceptions: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const PeriodCloseBoard = memo(function PeriodCloseBoard({ periods, checklists, onClose, onReopen, className }: PeriodCloseBoardProps) {
  if (periods.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <p className="text-sm text-zinc-500">No periods found</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {periods.map((p) => {
        const periodChecklist = checklists[p.id] ?? [];
        const completed = periodChecklist.filter((c) => c.status === "completed" || c.status === "verified").length;
        const total = periodChecklist.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div key={p.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", PERIOD_STATUS_STYLES[p.status] ?? "border-zinc-500/20 bg-zinc-500/10")}>
                  {p.status === "locked" || p.status === "hard-close" ? (
                    <Lock className={cn("h-5 w-5", p.status === "locked" ? "text-zinc-400" : "text-red-400")} />
                  ) : (
                    <Unlock className={cn("h-5 w-5", p.status === "open" ? "text-emerald-400" : p.status === "soft-close" ? "text-amber-400" : "text-blue-400")} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{p.period}</h3>
                    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", PERIOD_STATUS_STYLES[p.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {formatDate(p.startDate)} – {formatDate(p.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Checklist Progress</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-700">
                      <div
                        className={cn("h-full rounded-full transition-all", progress === 100 ? "bg-emerald-500" : "bg-[#d4af37]")}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400">{completed}/{total}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {(p.status === "open" || p.status === "soft-close") && (
                    <button
                      onClick={() => onClose?.(p.id)}
                      className="flex items-center gap-1 rounded-md border border-amber-500/20 px-2.5 py-1.5 text-[11px] font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
                    >
                      <Lock className="h-3 w-3" />
                      Close
                    </button>
                  )}
                  {(p.status === "hard-close" || p.status === "locked") && (
                    <button
                      onClick={() => onReopen?.(p.id)}
                      className="flex items-center gap-1 rounded-md border border-blue-500/20 px-2.5 py-1.5 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                    >
                      <Unlock className="h-3 w-3" />
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>

            {total > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {periodChecklist.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-md bg-zinc-800/30 px-2.5 py-1.5">
                    {item.status === "completed" || item.status === "verified" ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Clock className={cn("h-3 w-3", item.status === "in-progress" ? "text-blue-400" : "text-zinc-500")} />
                    )}
                    <span className="text-[11px] text-zinc-400 truncate">{item.step}</span>
                    <span className={cn("ml-auto rounded border px-1 py-0.5 text-[9px] font-medium capitalize", CLOSE_STATUS_STYLES[item.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {periodChecklist.length > 6 && (
                  <p className="col-span-2 text-center text-[10px] text-zinc-600">+{periodChecklist.length - 6} more items</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

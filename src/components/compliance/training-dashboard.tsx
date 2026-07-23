"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Training } from "./compliance-types";

function formatDate(d: Date | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  required: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  overdue: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const TrainingDashboard = memo(function TrainingDashboard({ trainings }: { trainings: Training[] }) {
  const required = trainings.filter(t => t.status === "required").length;
  const completed = trainings.filter(t => t.status === "completed").length;
  const overdue = trainings.filter(t => t.status === "overdue").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{required}</p>
          <p className="text-[11px] text-blue-400/70">Required</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          <p className="text-[11px] text-emerald-400/70">Completed</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{overdue}</p>
          <p className="text-[11px] text-red-400/70">Overdue</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Title</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Required For</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Due</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {trainings.map(t => (
              <tr key={t.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-white">{t.title}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{t.requiredFor}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(t.dueDate)}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[t.status])}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", t.status === "required" ? "bg-blue-500" : t.status === "completed" ? "bg-emerald-500" : "bg-red-500")} />
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(t.completedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

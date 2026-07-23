"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Remediation } from "./compliance-types";

function formatDate(d: Date | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: "border-red-500/20 bg-red-500/10 text-red-400",
  high: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  medium: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  low: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

const STATUS_STYLES: Record<string, string> = {
  open: "border-red-500/20 bg-red-500/10 text-red-400",
  "in-progress": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  verified: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
};

export const RemediationBoard = memo(function RemediationBoard({ remediations }: { remediations: Remediation[] }) {
  const open = remediations.filter(r => r.status === "open" || r.status === "in-progress").length;
  const resolved = remediations.filter(r => r.status === "resolved" || r.status === "verified").length;
  const critical = remediations.filter(r => r.priority === "critical").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{open}</p>
          <p className="text-[11px] text-red-400/70">Open</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{resolved}</p>
          <p className="text-[11px] text-emerald-400/70">Resolved</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{critical}</p>
          <p className="text-[11px] text-red-400/70">Critical</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Issue</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Priority</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Owner</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Target</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {remediations.map(r => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="max-w-[250px] truncate px-4 py-3 text-sm text-white">{r.issue}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase", PRIORITY_STYLES[r.priority])}>
                    {r.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{r.owner}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[r.status])}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", r.status === "open" ? "bg-red-500" : r.status === "in-progress" ? "bg-amber-500" : r.status === "resolved" ? "bg-emerald-500" : "bg-cyan-500")} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(r.targetDate)}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-zinc-500">{r.resolution ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

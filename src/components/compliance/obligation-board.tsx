"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Obligation } from "./compliance-types";

function formatDate(d: Date | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  compliant: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  "non-compliant": "border-red-500/20 bg-red-500/10 text-red-400",
  "partially-compliant": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "not-assessed": "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  "under-review": "border-blue-500/20 bg-blue-500/10 text-blue-400",
  remediated: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
};

const TYPE_STYLES: Record<string, string> = {
  statutory: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  regulatory: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  contractual: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  internal: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  fiduciary: "border-rose-500/20 bg-rose-500/10 text-rose-400",
};

export const ObligationBoard = memo(function ObligationBoard({ obligations }: { obligations: Obligation[] }) {
  const compliant = obligations.filter(o => o.status === "compliant").length;
  const nonCompliant = obligations.filter(o => o.status === "non-compliant" || o.status === "partially-compliant").length;
  const notAssessed = obligations.filter(o => o.status === "not-assessed" || o.status === "under-review").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{compliant}</p>
          <p className="text-[11px] text-emerald-400/70">Compliant</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{nonCompliant}</p>
          <p className="text-[11px] text-red-400/70">Non-Compliant</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{notAssessed}</p>
          <p className="text-[11px] text-blue-400/70">Not Assessed</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Code</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Frequency</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Owner</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {obligations.map(o => (
              <tr key={o.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{o.code}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-zinc-300">{o.name}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", TYPE_STYLES[o.type] ?? TYPE_STYLES.internal)}>
                    {o.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm capitalize text-zinc-400">{o.frequency}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{o.owner}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[o.status] ?? STATUS_STYLES["not-assessed"])}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", o.status === "compliant" ? "bg-emerald-500" : o.status === "non-compliant" ? "bg-red-500" : o.status === "partially-compliant" ? "bg-amber-500" : "bg-blue-500")} />
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-zinc-400">{formatDate(o.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

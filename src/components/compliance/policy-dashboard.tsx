"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { CompliancePolicy } from "./compliance-types";

function formatDate(d: Date | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  approved: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  archived: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const PolicyDashboard = memo(function PolicyDashboard({ policies }: { policies: CompliancePolicy[] }) {
  const active = policies.filter(p => p.status === "active").length;
  const draft = policies.filter(p => p.status === "draft").length;
  const archived = policies.filter(p => p.status === "archived").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{active}</p>
          <p className="text-[11px] text-emerald-400/70">Active</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{draft}</p>
          <p className="text-[11px] text-blue-400/70">Draft</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{archived}</p>
          <p className="text-[11px] text-red-400/70">Archived</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Code</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Category</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Owner</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Effective</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {policies.map(p => (
              <tr key={p.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{p.code}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-sm text-zinc-300">{p.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{p.category}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[p.status])}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{p.owner}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(p.effectiveDate)}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{p.reviewDate ? formatDate(p.reviewDate) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

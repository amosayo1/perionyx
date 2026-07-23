"use client";

import { memo } from "react";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RegulatoryFramework } from "./compliance-types";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CODE_COLORS: Record<string, string> = {
  sox: "border-red-500/20 bg-red-500/10 text-red-400",
  gdpr: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  "pci-dss": "border-purple-500/20 bg-purple-500/10 text-purple-400",
  "iso-27001": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  "basel-iii": "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

export const FrameworkDashboard = memo(function FrameworkDashboard({ frameworks }: { frameworks: RegulatoryFramework[] }) {
  const active = frameworks.filter(f => f.isActive).length;
  const total = frameworks.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{active}</p>
          <p className="text-[11px] text-emerald-400/70">Active</p>
        </div>
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{total - active}</p>
          <p className="text-[11px] text-zinc-400/70">Inactive</p>
        </div>
        <div className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 p-3 text-center">
          <p className="text-2xl font-bold text-[#d4af37]">{total}</p>
          <p className="text-[11px] text-[#d4af37]/70">Total</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Code</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Jurisdiction</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Version</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Effective</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {frameworks.map(fw => (
              <tr key={fw.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase", CODE_COLORS[fw.code] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {fw.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white">{fw.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{fw.jurisdiction}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{fw.version}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(fw.effectiveFrom)}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", fw.isActive ? "text-emerald-400" : "text-zinc-500")}>
                    {fw.isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {fw.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

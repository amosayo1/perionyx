"use client";

import { memo } from "react";
import { ShieldCheck, AlertTriangle, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceRecord } from "./tax-types";

interface ComplianceDashboardProps {
  records: ComplianceRecord[];
  className?: string;
}

function formatDate(d: Date | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Card({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const c = {
    emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
    blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  }[color] ?? { icon: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-500/10" };

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  compliant: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  "non-compliant": "border-red-500/20 bg-red-500/10 text-red-400",
  "at-risk": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "pending-review": "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

export const ComplianceDashboard = memo(function ComplianceDashboard({ records, className }: ComplianceDashboardProps) {
  const compliant = records.filter((r) => r.status === "compliant").length;
  const atRisk = records.filter((r) => r.status === "at-risk").length;
  const nonCompliant = records.filter((r) => r.status === "non-compliant").length;
  const pendingReview = records.filter((r) => r.status === "pending-review").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <Card label="Compliant" value={compliant.toLocaleString()} icon={<ShieldCheck />} color="emerald" />
        <Card label="At Risk" value={atRisk.toLocaleString()} icon={<AlertTriangle />} color="amber" />
        <Card label="Non-Compliant" value={nonCompliant.toLocaleString()} icon={<XCircle />} color="red" />
        <Card label="Under Review" value={pendingReview.toLocaleString()} icon={<Search />} color="blue" />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Jurisdiction</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Compliance Score</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Risk Level</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Next Filing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {records.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm text-white">{r.jurisdictionId}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{r.period}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[r.status] ?? STATUS_STYLES["pending-review"])}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", r.status === "compliant" ? "bg-emerald-500" : r.status === "non-compliant" ? "bg-red-500" : r.status === "at-risk" ? "bg-amber-500" : "bg-blue-500")} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-700">
                      <div
                        className={cn("h-full rounded-full transition-all", r.complianceScore >= 80 ? "bg-emerald-500" : r.complianceScore >= 60 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${r.complianceScore}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-medium", r.complianceScore >= 80 ? "text-emerald-400" : r.complianceScore >= 60 ? "text-amber-400" : "text-red-400")}>
                      {r.complianceScore}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">{r.riskLevel}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-400">{formatDate(r.nextFilingDue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

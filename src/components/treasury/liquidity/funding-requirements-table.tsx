"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { MOCK_FUNDING_REQUESTS } from "./data";

export function FundingRequirementsTable({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Funding Requirements</h3>
        <p className="text-[12px] text-zinc-500">5 active funding requests requiring attention</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Funding requirements">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 text-center font-medium">Priority</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 text-right font-medium">Need By</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 text-center font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 text-center font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FUNDING_REQUESTS.map((fr) => (
              <tr key={fr.id} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                <td className="px-5 py-3 text-white">{fr.entity}</td>
                <td className="px-5 py-3 text-zinc-400">{fr.businessUnit}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    fr.priority === "critical" ? "bg-red-500/10 text-red-400" :
                    fr.priority === "high" ? "bg-amber-500/10 text-amber-400" :
                    fr.priority === "medium" ? "bg-blue-500/10 text-blue-400" :
                    "bg-zinc-500/10 text-zinc-400")}>
                    {fr.priority}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium text-white">{fmt(fr.amountRequired)}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{fr.needDate}</td>
                <td className="px-5 py-3 text-zinc-400">{fr.fundingSource}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    fr.approvalStatus === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                    fr.approvalStatus === "approved" ? "bg-blue-500/10 text-blue-400" :
                    fr.approvalStatus === "executing" ? "bg-violet-500/10 text-violet-400" :
                    fr.approvalStatus === "rejected" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400")}>
                    {fr.approvalStatus}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-400">{fr.fundingMethod}</td>
                <td className="px-5 py-3 text-center">
                  {fr.risk === "high" ? <AlertTriangle className="mx-auto h-4 w-4 text-red-400" /> :
                   fr.risk === "medium" ? <AlertTriangle className="mx-auto h-4 w-4 text-amber-400" /> :
                   <span className="text-emerald-400 text-[11px]">Low</span>}
                </td>
                <td className="px-5 py-3 text-[12px] text-zinc-400 max-w-[200px] truncate">{fr.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}

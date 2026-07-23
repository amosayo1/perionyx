"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { MOCK_INTERCOMPANY_FUNDING } from "./data";

export function IntercompanyFundingMatrix({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Intercompany Funding Matrix</h3>
        <p className="text-[12px] text-zinc-500">Active intercompany loans and transfers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Intercompany funding matrix">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium" colSpan={2}>Direction</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 text-right font-medium">Rate</th>
              <th className="px-5 py-3 text-right font-medium">Settlement</th>
              <th className="px-5 py-3 text-center font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Approval</th>
              <th className="px-5 py-3 text-right font-medium">Expected</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INTERCOMPANY_FUNDING.map((row, i) => (
              <tr key={i} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                <td className="px-5 py-3 text-white">{row.fromEntity}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-[#c9a84c]" />
                    <span className="text-zinc-300">{row.toEntity}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-medium text-white">{fmt(row.amount)}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{row.interestRate.toFixed(1)}%</td>
                <td className="px-5 py-3 text-right text-zinc-400">{row.settlementDate}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    row.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                    row.status === "approved" ? "bg-blue-500/10 text-blue-400" :
                    row.status === "executing" ? "bg-violet-500/10 text-violet-400" :
                    "bg-amber-500/10 text-amber-400")}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-400">{row.approval}</td>
                <td className="px-5 py-3 text-right text-zinc-400">{row.expectedCompletion}</td>
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

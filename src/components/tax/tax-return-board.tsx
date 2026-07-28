"use client";

import { memo } from "react";
import { FileText, Eye, CheckCircle, Send, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxReturn } from "./tax-types";

interface TaxReturnBoardProps {
  returns: TaxReturn[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  reviewed: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  submitted: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  amended: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  cancelled: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const TaxReturnBoard = memo(function TaxReturnBoard({ returns, className }: TaxReturnBoardProps) {
  const draftCount = returns.filter((r) => r.status === "draft").length;
  const reviewedCount = returns.filter((r) => r.status === "reviewed").length;
  const approvedCount = returns.filter((r) => r.status === "approved").length;
  const submittedCount = returns.filter((r) => r.status === "submitted").length;
  const amendedCount = returns.filter((r) => r.status === "amended").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{draftCount}</p>
          <p className="text-[11px] text-zinc-400/70">Draft</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{reviewedCount}</p>
          <p className="text-[11px] text-blue-400/70">Reviewed</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{approvedCount}</p>
          <p className="text-[11px] text-emerald-400/70">Approved</p>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{submittedCount}</p>
          <p className="text-[11px] text-purple-400/70">Submitted</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{amendedCount}</p>
          <p className="text-[11px] text-amber-400/70">Amended</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Return</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Jurisdiction</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Liability</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Paid</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {returns.slice(0, 50).map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{r.returnNumber}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{r.jurisdictionId}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{r.period} {r.fiscalYear}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[r.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", r.status === "draft" ? "bg-zinc-500" : r.status === "reviewed" ? "bg-blue-500" : r.status === "approved" ? "bg-emerald-500" : r.status === "submitted" ? "bg-purple-500" : r.status === "amended" ? "bg-amber-500" : "bg-red-500")} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gold">{formatCurrency(r.totalLiability)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(r.totalPaid)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{r.submittedDate ? formatDate(r.submittedDate) : formatDate(r.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

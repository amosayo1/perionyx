"use client";

import { useState, memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Journal, JournalEntry } from "./gl-types";

interface JournalEntryBoardProps {
  journals: Journal[];
  entries: JournalEntry[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  approved: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  posted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  reversed: "border-red-500/20 bg-red-500/10 text-red-400",
  error: "border-red-500/20 bg-red-500/10 text-red-400",
};

const SOURCE_COLORS: Record<string, string> = {
  manual: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  recurring: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  accrual: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  reversing: "border-red-500/20 bg-red-500/10 text-red-400",
  adjustment: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  allocation: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  intercompany: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  system: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

export const JournalEntryBoard = memo(function JournalEntryBoard({ journals, entries, className }: JournalEntryBoardProps) {
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)}>
      <div className="border-b border-zinc-800/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-300">Journal Entries ({journals.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Journal #</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Description</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Source</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Debit Total</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Credit Total</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {journals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-500">No journals found</td>
              </tr>
            ) : (
              journals.map((j) => {
                const isExpanded = expandedJournal === j.id;
                return (
                  <tr key={j.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="px-2 py-3">
                      <button
                        onClick={() => setExpandedJournal(isExpanded ? null : j.id)}
                        className="rounded p-0.5 text-zinc-600 hover:text-zinc-400"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">{j.journalNumber}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-zinc-400">{j.description}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", SOURCE_COLORS[j.source] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                        {j.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[j.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", j.status === "draft" ? "bg-zinc-500" : j.status === "approved" ? "bg-blue-500" : j.status === "posted" ? "bg-emerald-500" : "bg-red-500")} />
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-gold">{formatCurrency(j.totalDebit)}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-zinc-300">{formatCurrency(j.totalCredit)}</td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-500">{formatDate(j.postingDate ?? j.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

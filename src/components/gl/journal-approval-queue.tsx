"use client";

import { useState, memo } from "react";
import { Check, X, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Journal, JournalEntry } from "./gl-types";

interface JournalApprovalQueueProps {
  journals: Journal[];
  entries?: JournalEntry[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
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

const SOURCE_COLORS: Record<string, string> = {
  manual: "text-zinc-400",
  recurring: "text-purple-400",
  accrual: "text-amber-400",
  adjustment: "text-blue-400",
  intercompany: "text-emerald-400",
  allocation: "text-cyan-400",
  system: "text-zinc-400",
};

export const JournalApprovalQueue = memo(function JournalApprovalQueue({ journals, entries, onApprove, onReject, className }: JournalApprovalQueueProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const pendingJournals = journals.filter((j) => j.status === "draft" || j.status === "approved");

  if (pendingJournals.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <p className="text-sm text-zinc-500">No pending approvals</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <FileText className="h-4 w-4 text-gold" />
        Approval Queue ({pendingJournals.length})
      </h3>
      {pendingJournals.map((j) => {
        const isExpanded = expanded === j.id;
        return (
          <div key={j.id} className={cn("rounded-lg border bg-zinc-900/40 transition-colors", isExpanded ? "border-gold/20" : "border-zinc-800/60", "hover:border-zinc-700/60")}>
            <div className="flex items-start justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{j.journalNumber}</span>
                  <span className={cn("text-xs capitalize", SOURCE_COLORS[j.source] ?? "text-zinc-400")}>{j.source}</span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 truncate">{j.description}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                  <span>Debit: {formatCurrency(j.totalDebit)}</span>
                  <span>Credit: {formatCurrency(j.totalCredit)}</span>
                  <span>{formatDate(j.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApprove?.(j.id)}
                  className="flex items-center gap-1 rounded-md border border-emerald-500/20 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                >
                  <Check className="h-3 w-3" />
                  Approve
                </button>
                <button
                  onClick={() => onReject?.(j.id)}
                  className="flex items-center gap-1 rounded-md border border-red-500/20 px-2.5 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <X className="h-3 w-3" />
                  Reject
                </button>
                <button
                  onClick={() => setExpanded(isExpanded ? null : j.id)}
                  className="rounded p-0.5 text-zinc-600 hover:text-zinc-400"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {isExpanded && entries && (
              <div className="border-t border-zinc-800/40 px-4 pb-3 pt-2">
                <p className="mb-2 text-[11px] font-semibold text-zinc-500">Entry Preview</p>
                <div className="space-y-1">
                  {entries.filter((e) => e.journalId === j.id).map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-1.5">
                      <span className="text-xs text-zinc-300">{e.description ?? "No description"}</span>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        {e.debit > 0 && <span className="text-gold">{formatCurrency(e.debit)} dr</span>}
                        {e.credit > 0 && <span className="text-zinc-400">{formatCurrency(e.credit)} cr</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

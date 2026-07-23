"use client";

import { useState, memo } from "react";
import { Plus, Check, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostingBatch } from "./gl-types";

interface PostingCenterProps {
  batches: PostingBatch[];
  onApprove?: (id: string) => void;
  onPost?: (id: string) => void;
  onReverse?: (id: string) => void;
  onCreate?: () => void;
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

export const PostingCenter = memo(function PostingCenter({ batches, onApprove, onPost, onReverse, onCreate, className }: PostingCenterProps) {
  const draftBatches = batches.filter((b) => b.status === "draft").length;
  const approvedBatches = batches.filter((b) => b.status === "approved").length;
  const postedBatches = batches.filter((b) => b.status === "posted").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          Posting Batches ({batches.length})
        </h3>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-md bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#c49f2e]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Batch
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{draftBatches}</p>
          <p className="text-[11px] text-zinc-400/70">Draft</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{approvedBatches}</p>
          <p className="text-[11px] text-blue-400/70">Approved</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{postedBatches}</p>
          <p className="text-[11px] text-emerald-400/70">Posted</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Batch #</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Description</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Entries</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Total Debit</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Total Credit</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">No batches found</td>
              </tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-zinc-800/40">
                  <td className="px-4 py-3 text-sm font-medium text-white">{b.batchNumber}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-zinc-400">{b.description}</td>
                  <td className="px-4 py-3 text-center text-sm text-zinc-400">{b.entriesCount}</td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-[#d4af37]">{formatCurrency(b.totalDebit)}</td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-zinc-300">{formatCurrency(b.totalCredit)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[b.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "draft" && (
                        <button
                          onClick={() => onApprove?.(b.id)}
                          className="rounded-md border border-blue-500/20 px-2 py-1 text-[10px] font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      {b.status === "approved" && (
                        <button
                          onClick={() => onPost?.(b.id)}
                          className="rounded-md border border-emerald-500/20 px-2 py-1 text-[10px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                        >
                          Post
                        </button>
                      )}
                      {(b.status === "draft" || b.status === "approved") && (
                        <button
                          onClick={() => onReverse?.(b.id)}
                          className="rounded-md border border-red-500/20 px-2 py-1 text-[10px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      )}
                      {b.status === "posted" && (
                        <button
                          onClick={() => onReverse?.(b.id)}
                          className="flex items-center gap-1 rounded-md border border-red-500/20 px-2 py-1 text-[10px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reverse
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

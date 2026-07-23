"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Account, JournalEntry } from "./gl-types";

interface AccountActivityGridProps {
  account: Account;
  entries: JournalEntry[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORY_COLORS: Record<string, string> = {
  assets: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  liabilities: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  equity: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  revenue: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  expense: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const AccountActivityGrid = memo(function AccountActivityGrid({ account, entries, className }: AccountActivityGridProps) {
  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{account.name}</h3>
              <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", CATEGORY_COLORS[account.category] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                {account.category.replace(/-/g, " ")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">{account.accountNumber} · {account.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Natural Balance</p>
            <p className={cn("text-sm font-semibold capitalize", account.naturalBalance === "debit" ? "text-[#d4af37]" : "text-zinc-300")}>
              {account.naturalBalance}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 p-3">
            <p className="text-[11px] text-zinc-500">Total Debits</p>
            <p className="text-lg font-bold text-[#d4af37]">{formatCurrency(totalDebit)}</p>
          </div>
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
            <p className="text-[11px] text-zinc-500">Total Credits</p>
            <p className="text-lg font-bold text-zinc-300">{formatCurrency(totalCredit)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-900/40">
        <div className="border-b border-zinc-800/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-300">Entry History ({entries.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Description</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Debit</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Credit</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">No entries found</td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{e.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-[#d4af37]">{e.debit > 0 ? formatCurrency(e.debit) : "—"}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-zinc-400">{e.credit > 0 ? formatCurrency(e.credit) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{e.reference ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

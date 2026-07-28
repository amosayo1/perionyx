"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { TrialBalance } from "./gl-types";

interface TrialBalanceTableProps {
  trialBalance: TrialBalance[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const TrialBalanceTable = memo(function TrialBalanceTable({ trialBalance, className }: TrialBalanceTableProps) {
  const totals = trialBalance.reduce(
    (acc, tb) => ({
      beginningDebit: acc.beginningDebit + tb.beginningDebit,
      beginningCredit: acc.beginningCredit + tb.beginningCredit,
      periodDebit: acc.periodDebit + tb.periodDebit,
      periodCredit: acc.periodCredit + tb.periodCredit,
      endingDebit: acc.endingDebit + tb.endingDebit,
      endingCredit: acc.endingCredit + tb.endingCredit,
      netMovement: acc.netMovement + tb.netMovement,
    }),
    { beginningDebit: 0, beginningCredit: 0, periodDebit: 0, periodCredit: 0, endingDebit: 0, endingCredit: 0, netMovement: 0 }
  );

  if (trialBalance.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <p className="text-sm text-zinc-500">No trial balance data</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)}>
      <div className="border-b border-zinc-800/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-300">Trial Balance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Account #</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Account Name</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Category</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Beg. Debit</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Beg. Credit</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period Debit</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period Credit</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">End. Debit</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">End. Credit</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Net Movement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {trialBalance.map((tb) => (
              <tr key={tb.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-3 py-2.5 text-xs font-mono text-zinc-500">{tb.accountNumber}</td>
                <td className="px-3 py-2.5 text-sm text-white">{tb.accountName}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded-md border border-zinc-700/50 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-medium capitalize text-zinc-400">
                    {tb.category.replace(/-/g, " ")}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-gold">{tb.beginningDebit > 0 ? formatCurrency(tb.beginningDebit) : "—"}</td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-zinc-400">{tb.beginningCredit > 0 ? formatCurrency(tb.beginningCredit) : "—"}</td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-gold">{tb.periodDebit > 0 ? formatCurrency(tb.periodDebit) : "—"}</td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-zinc-400">{tb.periodCredit > 0 ? formatCurrency(tb.periodCredit) : "—"}</td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-gold">{tb.endingDebit > 0 ? formatCurrency(tb.endingDebit) : "—"}</td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-zinc-400">{tb.endingCredit > 0 ? formatCurrency(tb.endingCredit) : "—"}</td>
                <td className={cn("px-3 py-2.5 text-right text-xs font-mono", tb.netMovement >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {formatCurrency(Math.abs(tb.netMovement))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-800/60 bg-zinc-900/80">
              <td colSpan={3} className="px-3 py-3 text-xs font-semibold text-zinc-400">Totals</td>
              <td className="px-3 py-3 text-right text-xs font-mono font-semibold text-gold">{formatCurrency(totals.beginningDebit)}</td>
              <td className="px-3 py-3 text-right text-xs font-mono font-semibold text-zinc-400">{formatCurrency(totals.beginningCredit)}</td>
              <td className="px-3 py-3 text-right text-xs font-mono font-semibold text-gold">{formatCurrency(totals.periodDebit)}</td>
              <td className="px-3 py-3 text-right text-xs font-mono font-semibold text-zinc-400">{formatCurrency(totals.periodCredit)}</td>
              <td className="px-3 py-3 text-right text-xs font-mono font-semibold text-gold">{formatCurrency(totals.endingDebit)}</td>
              <td className="px-3 py-3 text-right text-xs font-mono font-semibold text-zinc-400">{formatCurrency(totals.endingCredit)}</td>
              <td className={cn("px-3 py-3 text-right text-xs font-mono font-semibold", totals.netMovement >= 0 ? "text-emerald-400" : "text-red-400")}>
                {formatCurrency(Math.abs(totals.netMovement))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
});

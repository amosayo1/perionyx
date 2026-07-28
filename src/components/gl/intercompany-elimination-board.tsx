"use client";

import { memo } from "react";
import { ArrowLeftRight, ArrowUp, ArrowDown, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntercompanyAccount } from "./gl-types";

interface IntercompanyEliminationBoardProps {
  icAccounts: IntercompanyAccount[];
  eliminations: { id: string; fromEntity: string; toEntity: string; amount: number; status: string; date: Date }[];
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

const SETTLEMENT_STYLES: Record<string, string> = {
  unsettled: "border-red-500/20 bg-red-500/10 text-red-400",
  partial: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  settled: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const ELIMINATION_STATUS: Record<string, string> = {
  draft: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  posted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  reversed: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const IntercompanyEliminationBoard = memo(function IntercompanyEliminationBoard({ icAccounts, eliminations, className }: IntercompanyEliminationBoardProps) {
  const totalDueTo = icAccounts.reduce((sum, a) => sum + a.dueTo, 0);
  const totalDueFrom = icAccounts.reduce((sum, a) => sum + a.dueFrom, 0);
  const unsettled = icAccounts.filter((a) => a.settlementStatus !== "settled").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{icAccounts.length}</p>
          <p className="text-[11px] text-zinc-400/70">IC Accounts</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{unsettled}</p>
          <p className="text-[11px] text-amber-400/70">Unsettled</p>
        </div>
        <div className={cn("rounded-lg border p-3 text-center", (totalDueTo - totalDueFrom) >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5")}>
          <p className="text-[11px] text-zinc-500">Net Balance</p>
          <p className={cn("text-xl font-bold", (totalDueTo - totalDueFrom) >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(Math.abs(totalDueTo - totalDueFrom))}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
        <div className="border-b border-zinc-800/60 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <ArrowLeftRight className="h-4 w-4 text-gold" />
            Intercompany Accounts
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Entity</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Counterparty</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Due To</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Due From</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Last Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {icAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">No intercompany accounts found</td>
                </tr>
              ) : (
                icAccounts.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="px-4 py-3 text-sm text-white">{a.fromCompanyId}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{a.toCompanyId}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-gold">{formatCurrency(a.dueTo)}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-zinc-300">{formatCurrency(a.dueFrom)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", SETTLEMENT_STYLES[a.settlementStatus] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                        {a.settlementStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-500">
                      {a.lastSettlementDate ? formatDate(a.lastSettlementDate) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
        <div className="border-b border-zinc-800/60 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            Elimination Entries
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">From</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">To</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Amount</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {eliminations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No eliminations recorded</td>
                </tr>
              ) : (
                eliminations.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="px-4 py-3 text-sm text-white">{e.fromEntity}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{e.toEntity}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-gold">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", ELIMINATION_STATUS[e.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-500">{formatDate(e.date)}</td>
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

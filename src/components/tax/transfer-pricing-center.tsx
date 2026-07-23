"use client";

import { memo } from "react";
import { GitBranch, ArrowLeftRight, FileCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransferPricingRecord } from "./tax-types";

interface TransferPricingCenterProps {
  records: TransferPricingRecord[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

const RISK_STYLES: Record<string, string> = {
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  high: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const TransferPricingCenter = memo(function TransferPricingCenter({ records, className }: TransferPricingCenterProps) {
  const totalControlled = records.reduce((s, r) => s + r.controlledAmount, 0);
  const totalArmLength = records.reduce((s, r) => s + r.armLengthAmount, 0);
  const totalAdjustment = records.reduce((s, r) => s + r.adjustment, 0);
  const docsReady = records.filter((r) => r.documentationStatus === "complete" || r.documentationStatus === "ready").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10">
              <GitBranch className="h-5 w-5 text-[#d4af37]" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Controlled Transactions</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalControlled)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <ArrowLeftRight className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Arm's Length Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalArmLength)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
              <ArrowLeftRight className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Adjustment</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalAdjustment)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
              <FileCheck className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Documentation Ready</p>
              <p className="text-xl font-bold text-white">{docsReady}/{records.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Related Party</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Method</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Controlled</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Arm's Length</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {records.slice(0, 50).map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{r.relatedPartyName}</td>
                <td className="px-4 py-3 text-sm capitalize text-zinc-300">{r.transactionType}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{r.method}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(r.controlledAmount)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-[#d4af37]">{formatCurrency(r.armLengthAmount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", RISK_STYLES[r.riskRating] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {r.riskRating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

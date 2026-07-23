"use client";

import { memo } from "react";
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncomeEntry } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface IncomeDashboardProps {
  income: IncomeEntry[];
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  coupon: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  dividend: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  interest: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "capital-gain": "border-purple-500/20 bg-purple-500/10 text-purple-400",
  "capital-loss": "border-red-500/20 bg-red-500/10 text-red-400",
  "fx-gain": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  "fx-loss": "border-red-500/20 bg-red-500/10 text-red-400",
};

const STATUS_STYLES: Record<string, string> = {
  projected: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  accrued: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  received: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  reinvested: "border-purple-500/20 bg-purple-500/10 text-purple-400",
};

export const IncomeDashboard = memo(function IncomeDashboard({ income, className }: IncomeDashboardProps) {
  const totalCoupon = income.filter((i) => i.type === "coupon").reduce((s, i) => s + i.amount, 0);
  const totalDividend = income.filter((i) => i.type === "dividend").reduce((s, i) => s + i.amount, 0);
  const totalInterest = income.filter((i) => i.type === "interest").reduce((s, i) => s + i.amount, 0);
  const totalCapitalGain = income.filter((i) => i.type === "capital-gain").reduce((s, i) => s + i.amount, 0);
  const totalFxGain = income.filter((i) => i.type === "fx-gain").reduce((s, i) => s + i.amount, 0);
  const totalReceived = income.filter((i) => i.status === "received").reduce((s, i) => s + i.amount, 0);
  const totalProjected = income.filter((i) => i.status === "projected").reduce((s, i) => s + i.amount, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Coupon Income</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalCoupon)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Dividend Income</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalDividend)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Interest Income</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalInterest)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-zinc-400">Received</span>
          </div>
          <p className="mt-1 text-lg font-bold text-emerald-400">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Projected</span>
          </div>
          <p className="mt-1 text-lg font-bold text-blue-400">{formatCurrency(totalProjected)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Amount</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Pay Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {income.map((entry) => (
              <tr key={entry.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium", TYPE_COLORS[entry.type] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {entry.type.replace(/-/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-white">{formatCurrency(entry.amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[entry.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-zinc-400">{formatDate(entry.payDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

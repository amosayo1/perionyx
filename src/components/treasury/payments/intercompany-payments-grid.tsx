"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Building2, Calendar, Percent, Banknote, BarChart3 } from "lucide-react";
import { MOCK_INTERCOMPANY } from "./data";
import type { IntercompanyPayment } from "./types";

interface IntercompanyPaymentsGridProps {
  className?: string;
}

const STATUS_STYLES: Record<IntercompanyPayment["status"], string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  pending_approval: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  settled: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

const APPROVAL_STYLES: Record<IntercompanyPayment["approvalStatus"], string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  pending_approval: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  settled: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function IntercompanyPaymentsGrid({ className }: IntercompanyPaymentsGridProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-white">Intercompany Payments</h3>
          <p className="text-[12px] text-zinc-500">{MOCK_INTERCOMPANY.length} total intercompany transfers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_INTERCOMPANY.map((ic) => {
          const maxLoanDays = Math.max(...MOCK_INTERCOMPANY.map((x) => x.loanTermDays));
          const barWidth = (ic.loanTermDays / maxLoanDays) * 100;

          return (
            <div
              key={ic.id}
              className="rounded-lg border border-white/[0.06] bg-zinc-800/30 p-4 transition-colors hover:border-zinc-700"
              role="article"
              aria-label={`Intercompany payment ${ic.id}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                  {ic.id}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[ic.status])}>
                  {ic.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <span className="truncate text-[13px] font-medium text-white">{ic.fromEntity}</span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <span className="truncate text-[13px] font-medium text-white">{ic.toEntity}</span>
                </div>
              </div>

              <div className="mb-3 flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-white">{formatCurrency(ic.amount)}</span>
                <span className="text-[12px] font-medium text-zinc-400">{ic.currency}</span>
              </div>

              <div className="mb-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                  <Banknote className="h-3 w-3" />
                  <span className="text-zinc-400">{ic.purpose}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                  <Percent className="h-3 w-3" />
                  <span className="text-zinc-400">{ic.interestRate.toFixed(2)}% interest</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  <span className="text-zinc-400">Settlement {formatDate(ic.settlementDate)}</span>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", APPROVAL_STYLES[ic.approvalStatus])}>
                  {ic.approvalStatus.replace(/_/g, " ")}
                </span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] font-medium text-zinc-300">
                  {ic.settlementMethod}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <BarChart3 className="h-3 w-3" />
                    Loan Timeline
                  </span>
                  <span className="text-zinc-400">{ic.loanTermDays} days</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800" role="progressbar" aria-valuenow={ic.loanTermDays} aria-valuemin={0} aria-valuemax={maxLoanDays} aria-label={`${ic.loanTermDays} day loan term`}>
                  <div
                    className="h-full rounded-full bg-zinc-600 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

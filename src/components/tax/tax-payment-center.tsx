"use client";

import { memo } from "react";
import { Calendar, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxPayment } from "./tax-types";

interface TaxPaymentCenterProps {
  payments: TaxPayment[];
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
  scheduled: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  partial: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  refunded: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
};

export const TaxPaymentCenter = memo(function TaxPaymentCenter({ payments, className }: TaxPaymentCenterProps) {
  const now = new Date();
  const scheduledCount = payments.filter((p) => p.status === "scheduled").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const overpaidCount = payments.filter((p) => p.status === "overpaid").length;
  const refundedCount = payments.filter((p) => p.status === "refunded").length;
  const overdueCount = payments.filter((p) => (p.status === "scheduled" || p.status === "pending") && new Date(p.dueDate) < now).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{scheduledCount}</p>
          <p className="text-[11px] text-blue-400/70">Scheduled</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-[11px] text-amber-400/70">Pending</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{paidCount}</p>
          <p className="text-[11px] text-emerald-400/70">Paid</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-[11px] text-red-400/70">Overdue</p>
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400">{refundedCount}</p>
          <p className="text-[11px] text-cyan-400/70">Refunded</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Jurisdiction</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Amount</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Due Date</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Paid Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {payments.slice(0, 50).map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm text-white">{p.jurisdictionId}</td>
                <td className="px-4 py-3 text-sm capitalize text-zinc-300">{p.paymentType}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gold">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[p.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", p.status === "paid" ? "bg-emerald-500" : p.status === "scheduled" ? "bg-blue-500" : p.status === "pending" ? "bg-amber-500" : "bg-zinc-500")} />
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatDate(p.dueDate)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{p.paidDate ? formatDate(p.paidDate) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

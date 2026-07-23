"use client";

import { memo } from "react";
import { UserCircle, Building2, Landmark, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WithholdingTaxRecord } from "./tax-types";

interface WithholdingDashboardProps {
  records: WithholdingTaxRecord[];
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

const TYPE_LABELS: Record<string, string> = {
  supplier: "Supplier W/H",
  customer: "Customer W/H",
  interest: "Interest W/H",
  dividends: "Dividends W/H",
  royalties: "Royalties W/H",
  services: "Services W/H",
};

const STATUS_STYLES: Record<string, string> = {
  certified: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  cancelled: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const WithholdingDashboard = memo(function WithholdingDashboard({ records, className }: WithholdingDashboardProps) {
  const supplierSum = records.filter((r) => r.withholdingType === "supplier").reduce((s, r) => s + r.withholdingAmount, 0);
  const customerSum = records.filter((r) => r.withholdingType === "customer").reduce((s, r) => s + r.withholdingAmount, 0);
  const interestSum = records.filter((r) => r.withholdingType === "interest").reduce((s, r) => s + r.withholdingAmount, 0);
  const dividendSum = records.filter((r) => r.withholdingType === "dividends").reduce((s, r) => s + r.withholdingAmount, 0);
  const totalRecoverable = records.filter((r) => r.isRecoverable).reduce((s, r) => s + r.recoveredAmount, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Supplier W/H</p>
              <p className="text-xl font-bold text-white">{formatCurrency(supplierSum)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
              <UserCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Customer W/H</p>
              <p className="text-xl font-bold text-white">{formatCurrency(customerSum)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
              <Landmark className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Interest W/H</p>
              <p className="text-xl font-bold text-white">{formatCurrency(interestSum)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <PiggyBank className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Dividends W/H</p>
              <p className="text-xl font-bold text-white">{formatCurrency(dividendSum)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
              <PiggyBank className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Recoverable</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalRecoverable)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Payee</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Gross Amount</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Rate</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">W/H Amount</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {records.slice(0, 50).map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{r.payeeName}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{r.withholdingType}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(r.grossAmount)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{r.withholdingRate}%</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-[#d4af37]">{formatCurrency(r.withholdingAmount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[r.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatDate(r.transactionDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

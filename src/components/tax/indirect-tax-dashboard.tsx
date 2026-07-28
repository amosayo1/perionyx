"use client";

import { memo } from "react";
import { DollarSign, Landmark, ArrowLeftRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndirectTaxTransaction } from "./tax-types";

interface IndirectTaxDashboardProps {
  transactions: IndirectTaxTransaction[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const c = {
    gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
    emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
    blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  }[color] ?? { icon: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-500/10" };

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const TYPE_STYLES: Record<string, string> = {
  sale: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  purchase: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  import: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  export: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

export const IndirectTaxDashboard = memo(function IndirectTaxDashboard({ transactions, className }: IndirectTaxDashboardProps) {
  const totalCollected = transactions.reduce((s, t) => s + t.outputTax, 0);
  const totalPaid = transactions.reduce((s, t) => s + t.inputTax, 0);
  const netVat = totalCollected - totalPaid;
  const reverseChargeCount = transactions.filter((t) => t.isReverseCharge).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard label="Total VAT Collected" value={formatCurrency(totalCollected)} icon={<DollarSign />} color="emerald" />
        <SummaryCard label="Total VAT Paid" value={formatCurrency(totalPaid)} icon={<Landmark />} color="red" />
        <SummaryCard label="Net VAT" value={formatCurrency(netVat)} icon={<ArrowLeftRight />} color={netVat >= 0 ? "gold" : "red"} />
        <SummaryCard label="Reverse Charge Count" value={reverseChargeCount.toLocaleString()} icon={<RefreshCw />} color="blue" />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Description</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Taxable Amount</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">VAT</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Net Tax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {transactions.slice(0, 50).map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm text-zinc-300">{formatDate(t.transactionDate)}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium", TYPE_STYLES[t.transactionType] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {t.transactionType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">{t.description || "—"}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-white">{formatCurrency(t.taxableAmount)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gold">{formatCurrency(t.outputTax)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-zinc-300">{formatCurrency(t.netTax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

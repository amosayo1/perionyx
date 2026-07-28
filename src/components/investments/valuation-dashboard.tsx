"use client";

import { memo } from "react";
import { DollarSign, TrendingUp, Building2, PiggyBank, FileText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Valuation } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface ValuationDashboardProps {
  valuations: Valuation[];
  className?: string;
}

function ValCard({ label, value, icon, variant }: { label: string; value: string; icon: React.ReactNode; variant: "gold" | "emerald" | "blue" | "amber" | "purple" }) {
  const COLORS = {
    gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
    emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
    amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  };
  const c = COLORS[variant];
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

export const ValuationDashboard = memo(function ValuationDashboard({ valuations, className }: ValuationDashboardProps) {
  const totalBookValue = valuations.reduce((s, v) => s + v.bookValue, 0);
  const totalMarketValue = valuations.reduce((s, v) => s + v.marketValue, 0);
  const totalNav = valuations.reduce((s, v) => s + v.nav, 0);
  const totalCash = valuations.reduce((s, v) => s + v.cashHeld, 0);
  const totalAccrued = valuations.reduce((s, v) => s + v.accruedIncome, 0);
  const totalInvestments = valuations.reduce((s, v) => s + v.totalInvestments, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        <ValCard label="Total Market Value" value={formatCurrency(totalMarketValue)} icon={<DollarSign />} variant="gold" />
        <ValCard label="Total Book Value" value={formatCurrency(totalBookValue)} icon={<FileText />} variant="blue" />
        <ValCard label="Net Asset Value" value={formatCurrency(totalNav)} icon={<TrendingUp />} variant="emerald" />
        <ValCard label="Cash Held" value={formatCurrency(totalCash)} icon={<PiggyBank />} variant="amber" />
        <ValCard label="Accrued Income" value={formatCurrency(totalAccrued)} icon={<RefreshCw />} variant="purple" />
        <ValCard label="Total Investments" value={totalInvestments.toLocaleString()} icon={<Building2 />} variant="blue" />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Portfolio</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Book Value</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Market Value</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">NAV</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Cash</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {valuations.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm text-white">{v.portfolioId}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(v.bookValue)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(v.marketValue)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(v.nav)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(v.cashHeld)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium", v.status === "final" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400")}>
                    {v.status}
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

"use client";

import { memo } from "react";
import { Building2, Calendar, Target, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectTaxProvision } from "./tax-types";

interface CorporateTaxDashboardProps {
  provisions: DirectTaxProvision[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function Card({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const c = {
    amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
    emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    gold: { icon: "text-[#d4af37]", border: "border-[#d4af37]/20", bg: "bg-[#d4af37]/10" },
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

export const CorporateTaxDashboard = memo(function CorporateTaxDashboard({ provisions, className }: CorporateTaxDashboardProps) {
  const totalCurrent = provisions.filter(p => p.provisionType === "current").reduce((s, p) => s + p.taxPayable, 0);
  const totalDeferred = provisions.filter(p => p.provisionType === "deferred").reduce((s, p) => s + p.deferredTaxLiability, 0);
  const totalEstimated = provisions.filter(p => p.provisionType === "estimated").reduce((s, p) => s + p.taxPayable, 0);
  const totalProvision = provisions.reduce((s, p) => s + p.taxPayable + p.deferredTaxLiability, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <Card label="Current Tax" value={formatCurrency(totalCurrent)} icon={<Building2 />} color="amber" />
        <Card label="Deferred Tax" value={formatCurrency(totalDeferred)} icon={<Calendar />} color="blue" />
        <Card label="Estimated Tax" value={formatCurrency(totalEstimated)} icon={<Target />} color="emerald" />
        <Card label="Total Provision" value={formatCurrency(totalProvision)} icon={<Calculator />} color="gold" />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Jurisdiction</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Taxable Income</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Tax Payable</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Deferred Liability</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {provisions.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm text-white">{p.jurisdictionId}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{p.period}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(p.taxableIncome)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-[#d4af37]">{formatCurrency(p.taxPayable)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(p.deferredTaxLiability)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-400">{p.taxRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

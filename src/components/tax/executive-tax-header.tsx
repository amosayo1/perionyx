"use client";

import { memo } from "react";
import { DollarSign, Percent, Landmark, Building2, Calendar, ShieldCheck, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutiveTaxHeaderProps } from "./tax-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

interface KpiCardProps {
  label: string; value: string; icon: React.ReactNode; color: string; gold?: boolean;
}

function KpiCard({ label, value, icon, color, gold }: KpiCardProps) {
  return (
    <div className={cn(
      "rounded-lg border p-4 transition-colors duration-200",
      gold ? "border-gold/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black/40" : "border-zinc-800/60 bg-zinc-900/40",
      "hover:border-zinc-700/60 hover:bg-zinc-900/60",
    )}>
      {gold && <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/5 blur-3xl" />}
      <div className="relative space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", color === "gold" ? "border-gold/20 bg-gold/10" : `border-${color}-500/20 bg-${color}-500/10`)}>
            {icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</span>
        </div>
        <p className={cn("text-2xl font-bold tracking-tight", gold ? "text-gold" : "text-white")}>{value}</p>
      </div>
    </div>
  );
}

export const ExecutiveTaxHeader = memo(function ExecutiveTaxHeader(props: ExecutiveTaxHeaderProps) {
  const cards = [
    { label: "Total Tax Liability", value: formatCurrency(props.totalTaxLiability), icon: <DollarSign className="h-4 w-4 text-gold" />, color: "gold" as const, gold: true },
    { label: "Effective Tax Rate", value: `${props.effectiveTaxRate.toFixed(1)}%`, icon: <Percent className="h-4 w-4 text-gold" />, color: "gold" as const, gold: true },
    { label: "VAT Collected", value: formatCurrency(props.vatCollected), icon: <Landmark className="h-4 w-4 text-emerald-400" />, color: "emerald" as const },
    { label: "VAT Paid", value: formatCurrency(props.vatPaid), icon: <Landmark className="h-4 w-4 text-red-400" />, color: "red" as const },
    { label: "Corporate Tax", value: formatCurrency(props.corporateTax), icon: <Building2 className="h-4 w-4 text-amber-400" />, color: "amber" as const },
    { label: "Deferred Tax", value: formatCurrency(props.deferredTax), icon: <Calendar className="h-4 w-4 text-blue-400" />, color: "blue" as const },
    { label: "Compliance Score", value: `${props.complianceScore}%`, icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, color: "emerald" as const },
    { label: "Upcoming Deadlines", value: `${props.upcomingDeadlines}`, icon: <Bell className="h-4 w-4 text-amber-400" />, color: "amber" as const },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
});

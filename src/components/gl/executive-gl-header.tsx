"use client";

import { memo } from "react";
import { BookOpen, FileText, CheckSquare, Calendar, Layers, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutiveGLHeaderProps } from "./gl-types";

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
      gold ? "border-[#d4af37]/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black/40" : "border-zinc-800/60 bg-zinc-900/40",
      "hover:border-zinc-700/60 hover:bg-zinc-900/60",
    )}>
      {gold && <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#d4af37]/5 blur-3xl" />}
      <div className="relative space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", color === "gold" ? "border-[#d4af37]/20 bg-[#d4af37]/10" : `border-${color}-500/20 bg-${color}-500/10`)}>
            {icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</span>
        </div>
        <p className={cn("text-2xl font-bold tracking-tight", gold ? "text-[#d4af37]" : "text-white")}>{value}</p>
      </div>
    </div>
  );
}

export const ExecutiveGLHeader = memo(function ExecutiveGLHeader(props: ExecutiveGLHeaderProps) {
  const cards = [
    { label: "Total Accounts", value: props.totalAccounts.toLocaleString(), icon: <BookOpen className="h-4 w-4 text-[#d4af37]" />, color: "gold" as const, gold: true },
    { label: "Total Journals", value: props.totalJournals.toLocaleString(), icon: <FileText className="h-4 w-4 text-emerald-400" />, color: "emerald" as const },
    { label: "Posted Journals", value: props.totalPostedJournals.toLocaleString(), icon: <CheckSquare className="h-4 w-4 text-blue-400" />, color: "blue" as const },
    { label: "Open Periods", value: props.totalOpenPeriods.toLocaleString(), icon: <Calendar className="h-4 w-4 text-amber-400" />, color: "amber" as const },
    { label: "Total Ledgers", value: props.totalLedgers.toLocaleString(), icon: <Layers className="h-4 w-4 text-purple-400" />, color: "purple" as const },
    { label: "Active Alerts", value: `${props.activeAlerts}`, icon: <Bell className="h-4 w-4 text-red-400" />, color: "red" as const },
  ];

  return (
    <div className="grid grid-cols-6 gap-3">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
});

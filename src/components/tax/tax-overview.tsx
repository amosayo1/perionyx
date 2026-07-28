"use client";

import { memo } from "react";
import { Globe, FileText, ArrowLeftRight, DollarSign, Building2, FileCheck, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxOverviewMetrics } from "./tax-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface MetricCardProps {
  label: string; value: string; icon: React.ReactNode;
  variant?: "gold" | "emerald" | "amber" | "red" | "blue" | "purple" | "cyan";
  trend?: { value: string; up: boolean };
}

const COLORS = {
  gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function MetricCard({ label, value, icon, variant = "gold", trend }: MetricCardProps) {
  const c = COLORS[variant];
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <span className={cn("text-xs", trend.up ? "text-emerald-400" : "text-red-400")}>
                {trend.up ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TaxOverview = memo(function TaxOverview({ metrics }: { metrics: TaxOverviewMetrics }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        label="Jurisdictions"
        value={metrics.totalJurisdictions.toLocaleString()}
        icon={<Globe />}
        variant="gold"
        trend={metrics.atRiskJurisdictions > 0 ? { value: `${metrics.atRiskJurisdictions} at risk`, up: false } : undefined}
      />
      <MetricCard
        label="Active Rules"
        value={metrics.activeRules.toLocaleString()}
        icon={<FileText />}
        variant="blue"
      />
      <MetricCard
        label="Total Transactions"
        value={metrics.totalTransactions.toLocaleString()}
        icon={<ArrowLeftRight />}
        variant="cyan"
      />
      <MetricCard
        label="Net VAT"
        value={formatCurrency(metrics.netVat)}
        icon={<DollarSign />}
        variant={metrics.netVat >= 0 ? "emerald" : "red"}
      />
      <MetricCard
        label="Corporate Tax"
        value={formatCurrency(metrics.totalCorporateTax)}
        icon={<Building2 />}
        variant="amber"
      />
      <MetricCard
        label="Returns"
        value={`${metrics.returnsSubmitted}/${metrics.totalReturns}`}
        icon={<FileCheck />}
        variant="purple"
        trend={{ value: `${metrics.returnsDraft} draft`, up: true }}
      />
      <MetricCard
        label="Payments"
        value={`${metrics.paymentsPaid}/${metrics.totalPayments}`}
        icon={<CreditCard />}
        variant="emerald"
        trend={metrics.paymentsOverdue > 0 ? { value: `${metrics.paymentsOverdue} overdue`, up: false } : undefined}
      />
      <MetricCard
        label="Compliance Score"
        value={`${metrics.complianceScore}%`}
        icon={<ShieldCheck />}
        variant={metrics.complianceScore >= 80 ? "emerald" : metrics.complianceScore >= 60 ? "amber" : "red"}
      />
    </div>
  );
});

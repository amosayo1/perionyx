"use client";

import { cn } from "@/lib/utils";
import {
  PiggyBank, ShieldCheck, Clock, AlertTriangle, DollarSign, Activity,
  TrendingUp, TrendingDown, Users, FileText, BarChart3, Landmark,
} from "lucide-react";
import { MOCK_EBAM_METRICS } from "./data";

interface BankAccountOverviewProps {
  className?: string;
}

export function BankAccountOverview({ className }: BankAccountOverviewProps) {
  const m = MOCK_EBAM_METRICS;

  const cards = [
    { icon: PiggyBank, label: "Total Accounts", value: m.totalAccounts.toLocaleString(), change: 4.2, trend: "up" as const, color: "default" as const },
    { icon: ShieldCheck, label: "Active Accounts", value: m.activeAccounts.toLocaleString(), change: 2.1, trend: "up" as const, color: "green" as const },
    { icon: Clock, label: "Dormant Accounts", value: m.dormantAccounts.toLocaleString(), change: -0.8, trend: "up" as const, color: "amber" as const },
    { icon: AlertTriangle, label: "Restricted Accounts", value: m.restrictedAccounts.toLocaleString(), change: 0.3, trend: "up" as const, color: "red" as const },
    { icon: DollarSign, label: "Average Balance", value: formatCurrency(m.averageBalance), change: 3.7, trend: "up" as const, color: "green" as const },
    { icon: Activity, label: "Average Utilization", value: `${m.averageUtilization}%`, change: -1.2, trend: "down" as const, color: "default" as const },
    { icon: TrendingUp, label: "Compliance Score", value: `${m.complianceScore}%`, change: 0.5, trend: "up" as const, color: "green" as const },
    { icon: Users, label: "Relationship Health", value: `${m.relationshipHealth}%`, change: 1.8, trend: "up" as const, color: "green" as const },
    { icon: ShieldCheck, label: "KYC Completion", value: `${m.kycCompletion}%`, change: 2.3, trend: "up" as const, color: "green" as const },
    { icon: FileText, label: "Mandate Coverage", value: `${m.mandateCoverage}%`, change: -0.5, trend: "down" as const, color: "default" as const },
    { icon: BarChart3, label: "Policy Compliance", value: `${m.policyCompliance}%`, change: 1.1, trend: "up" as const, color: "green" as const },
    { icon: Landmark, label: "Total Balance", value: formatCurrency(m.totalBalance), change: 5.4, trend: "up" as const, color: "green" as const },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, change, trend, color,
}: {
  icon: React.ElementType; label: string; value: string; change: number; trend: "up" | "down"; color: "green" | "amber" | "red" | "default";
}) {
  const colorMap = {
    green: "border-emerald-500/20 bg-emerald-500/[0.04]",
    amber: "border-amber-500/20 bg-amber-500/[0.04]",
    red: "border-red-500/20 bg-red-500/[0.04]",
    default: "border-white/[0.06] bg-zinc-900/50",
  };

  const textMap = {
    green: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    default: "text-white",
  };

  const barMap = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    default: "bg-zinc-500",
  };

  return (
    <div className={cn("rounded-lg border p-4 transition-colors hover:border-zinc-700", colorMap[color])}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <Icon className={cn("h-4 w-4", color === "default" ? "text-zinc-500" : `${textMap[color]}/70`)} />
      </div>
      <p className={cn("mt-2 text-xl font-semibold", textMap[color])}>{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {trend === "up" ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        )}
        <span className={cn(
          "text-[12px] font-medium",
          trend === "up" ? "text-emerald-400" : "text-red-400",
        )}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
        <span className="text-[11px] text-zinc-500">vs last period</span>
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all", barMap[color])}
          style={{ width: `${Math.min(Math.abs(change) * 10, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

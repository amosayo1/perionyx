"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Lock, Banknote, LayoutDashboard } from "lucide-react";
import { MOCK_TREASURY_KPIS } from "./data";

interface CashPositionOverviewProps {
  className?: string;
}

export function CashPositionOverview({ className }: CashPositionOverviewProps) {
  const kpis = MOCK_TREASURY_KPIS;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      <KpiCard icon={DollarSign} label="Total Cash" value={formatCurrency(kpis.totalCash.value)} change={kpis.totalCash.changePercent} direction={kpis.totalCash.direction} />
      <KpiCard icon={Banknote} label="Available Cash" value={formatCurrency(kpis.availableCash.value)} change={kpis.availableCash.changePercent} direction={kpis.availableCash.direction} />
      <KpiCard icon={Lock} label="Restricted Cash" value={formatCurrency(kpis.restrictedCash.value)} change={kpis.restrictedCash.changePercent} direction={kpis.restrictedCash.direction} />
      <KpiCard icon={DollarSign} label="Idle Cash" value={formatCurrency(kpis.idleCash.value)} change={kpis.idleCash.changePercent} direction={kpis.idleCash.direction} />
      <KpiCard icon={LayoutDashboard} label="Working Capital" value={formatCurrency(kpis.workingCapital.value)} change={kpis.workingCapital.changePercent} direction={kpis.workingCapital.direction} />
      <KpiCard icon={TrendingUp} label="Net Liquidity" value={formatCurrency(kpis.netLiquidity.value)} change={kpis.netLiquidity.changePercent} direction={kpis.netLiquidity.direction} />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, direction }: { icon: React.ElementType; label: string; value: string; change: number; direction: "up" | "down" | "flat" }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {direction === "up" ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : direction === "down" ? (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        ) : null}
        <span className={cn(
          "text-[12px] font-medium",
          direction === "up" ? "text-emerald-400" :
          direction === "down" ? "text-red-400" :
          "text-zinc-400",
        )}>
          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
        </span>
        <span className="text-[11px] text-zinc-500">vs yesterday</span>
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

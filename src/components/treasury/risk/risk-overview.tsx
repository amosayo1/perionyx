"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Globe, Shield, Percent, Droplets, Users, Building2, Activity, AlertTriangle, Target, Gauge } from "lucide-react";
import { MOCK_METRICS } from "./data";

export function RiskOverview({ className }: { className?: string }) {
  const m = MOCK_METRICS;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <KpiCard icon={DollarSign} label="Total Exposure" value={fmt(m.totalExposure)} change={2.8} direction="up" status="info" />
      <KpiCard icon={Globe} label="Net FX" value={fmt(m.netFXExposure)} change={8.2} direction="up" status={m.netFXExposure > 350000000 ? "warning" : "healthy"} />
      <KpiCard icon={Globe} label="Gross FX" value={fmt(m.grossFXExposure)} change={-1.2} direction="down" status="healthy" />
      <KpiCard icon={Percent} label="Interest Exposure" value={fmt(m.interestExposure)} change={3.5} direction="up" status="warning" />
      <KpiCard icon={Droplets} label="Liquidity Risk" value={fmt(m.liquidityRisk)} change={-4.1} direction="down" status="healthy" />
      <KpiCard icon={Users} label="Counterparty Risk" value={fmt(m.counterpartyRisk)} change={2.3} direction="up" status="warning" />
      <KpiCard icon={Building2} label="Country Risk" value={fmt(m.countryRisk)} change={1.8} direction="up" status="info" />
      <KpiCard icon={Activity} label="Concentration" value={fmt(m.concentrationRisk)} change={5.2} direction="up" status={m.concentrationRisk > 1500000000 ? "critical" : "warning"} />
      <KpiCard icon={Target} label="VaR (95%)" value={fmt(m.var1d95)} change={1.6} direction="up" status={m.var1d95 < 50000000 ? "healthy" : "warning"} />
      <KpiCard icon={AlertTriangle} label="Policy Breaches" value={`${m.policyBreaches}`} change={m.policyBreaches * 14.3} direction="up" status={m.policyBreaches > 5 ? "critical" : "warning"} />
      <KpiCard icon={Shield} label="Hedge Ratio" value={`${m.hedgeRatio}%`} change={3.2} direction="up" status={m.hedgeRatio > 60 ? "healthy" : "warning"} />
      <KpiCard icon={Gauge} label="Risk Score" value={`${m.overallRiskScore}`} change={-2.1} direction="down" status={m.overallRiskScore > 75 ? "critical" : m.overallRiskScore > 50 ? "warning" : "healthy"} />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, direction, status }: { icon: React.ElementType; label: string; value: string; change: number; direction: "up" | "down" | "stable"; status: string }) {
  const barColor = status === "healthy" ? "bg-emerald-500/50" : status === "warning" ? "bg-amber-500/50" : status === "critical" ? "bg-red-500/50" : "bg-zinc-500/50";
  const dotColor = status === "healthy" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : status === "critical" ? "bg-red-500" : "bg-zinc-500";

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <span className={cn("flex h-2 w-2 rounded-full", dotColor)} />
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {direction === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : direction === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> : null}
        <span className={cn("text-[12px] font-medium", direction === "up" ? "text-emerald-400" : direction === "down" ? "text-red-400" : "text-zinc-400")}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
        <span className="text-[11px] text-zinc-500">vs last month</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-zinc-800">
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${Math.min(100, Math.abs(50 + change * 2))}%` }} role="progressbar" aria-valuenow={Math.round(50 + change * 2)} aria-valuemin={0} aria-valuemax={100} />
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

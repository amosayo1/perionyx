"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Droplets, Lock, DollarSign, LayoutDashboard, Activity, Gauge } from "lucide-react";
import { MOCK_LIQUIDITY_SUMMARY } from "./data";

export function LiquidityOverview({ className }: { className?: string }) {
  const s = MOCK_LIQUIDITY_SUMMARY;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <KpiCard icon={Droplets} label="Current Liquidity" value={fmt(s.currentLiquidity)} change={s.dailyDeltaPercent} direction={s.trend} status={s.status} />
      <KpiCard icon={DollarSign} label="Available Liquidity" value={fmt(s.availableLiquidity)} change={s.dailyDeltaPercent} direction={s.trend} status="healthy" />
      <KpiCard icon={Lock} label="Restricted Liquidity" value={fmt(s.restrictedLiquidity)} change={-2.44} direction="down" status="warning" />
      <KpiCard icon={DollarSign} label="Idle Cash" value={fmt(s.idleCash)} change={2.24} direction="up" status="watch" />
      <KpiCard icon={Activity} label="Net Liquidity" value={fmt(s.netLiquidity)} change={1.75} direction="up" status="healthy" />
      <KpiCard icon={LayoutDashboard} label="Working Capital" value={fmt(s.workingCapital)} change={1.69} direction="up" status="healthy" />
      <KpiCard icon={Gauge} label="Coverage Ratio" value={`${s.coverageRatio}x`} change={-0.1} direction="down" status={s.coverageRatio >= 2 ? "healthy" : "warning"} />
      <KpiCard icon={Droplets} label="Liquidity Buffer" value={`${s.liquidityBuffer}%`} change={0.5} direction="up" status={s.liquidityBuffer >= 25 ? "healthy" : "warning"} />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, direction, status }: { icon: React.ElementType; label: string; value: string; change: number; direction: "up" | "down" | "stable"; status: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <span className={cn("flex h-2 w-2 rounded-full", status === "healthy" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-red-500")} />
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {direction === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : direction === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> : null}
        <span className={cn("text-[12px] font-medium", direction === "up" ? "text-emerald-400" : direction === "down" ? "text-red-400" : "text-zinc-400")}>
          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
        </span>
        <span className="text-[11px] text-zinc-500">daily</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-zinc-800">
        <div className={cn("h-full rounded-full", status === "healthy" ? "bg-emerald-500/50" : status === "warning" ? "bg-amber-500/50" : "bg-red-500/50")} style={{ width: `${Math.min(100, Math.abs(50 + change * 5))}%` }} role="progressbar" aria-valuenow={50 + change * 5} aria-valuemin={0} aria-valuemax={100} />
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}

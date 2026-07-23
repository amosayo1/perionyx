"use client";

import { cn } from "@/lib/utils";
import { RefreshCw, Download, Printer, Droplets, Building2, Globe, PiggyBank, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_LIQUIDITY_SUMMARY } from "./data";

export function ExecutiveLiquidityHeader({ className }: { className?: string }) {
  const s = MOCK_LIQUIDITY_SUMMARY;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Enterprise Liquidity Center</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            Enterprise-wide liquidity intelligence &bull; Updated {new Date(s.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white" aria-label="Export"><Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span></button>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white" aria-label="Print"><Printer className="h-4 w-4" /><span className="hidden sm:inline">Print</span></button>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white" aria-label="Refresh"><RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <HeaderStat icon={Droplets} label="Current Liquidity" value={fmt(s.currentLiquidity)} sub={`${s.dailyDeltaPercent >= 0 ? "+" : ""}${s.dailyDeltaPercent.toFixed(2)}%`} subColor={s.dailyDeltaPercent >= 0 ? "text-emerald-400" : "text-red-400"} />
        <HeaderStat icon={Droplets} label="Liquidity Buffer" value={`${s.liquidityBuffer}%`} sub={s.status === "healthy" ? "Healthy" : s.status === "watch" ? "Watch" : "Critical"} subColor={s.status === "healthy" ? "text-emerald-400" : s.status === "watch" ? "text-amber-400" : "text-red-400"} />
        <HeaderStat icon={TrendingUp} label="Coverage Ratio" value={`${s.coverageRatio}x`} sub={`${s.daysCashRemaining} days`} subColor="text-zinc-400" />
        <HeaderStat icon={PiggyBank} label="Days Cash Left" value={`${s.daysCashRemaining}`} sub={`${s.forecastConfidence}% confidence`} subColor="text-zinc-400" />
        <HeaderStat icon={TrendingUp} label="Working Capital" value={fmt(s.workingCapital)} sub="2.4x current ratio" subColor="text-emerald-400" />
        <HeaderStat icon={Globe} label="Regions" value={`${s.regions}`} sub={`${s.entities} entities`} subColor="text-zinc-400" />
        <HeaderStat icon={PiggyBank} label="Currencies" value={`${s.currencies}`} sub={`${s.fundingRequests} funding requests`} subColor="text-amber-400" />
        <HeaderStat icon={AlertTriangle} label="Alerts" value={`${s.treasuryAlerts}`} sub={s.treasuryAlerts > 0 ? `${s.treasuryAlerts} active` : "All clear"} subColor={s.treasuryAlerts > 0 ? "text-amber-400" : "text-emerald-400"} highlight={s.treasuryAlerts > 0} />
      </div>
    </div>
  );
}

function HeaderStat({ icon: Icon, label, value, sub, subColor, highlight }: { icon: React.ElementType; label: string; value: string; sub: string; subColor: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-3 py-3">
      <Icon className={cn("h-5 w-5 shrink-0", highlight ? "text-amber-400" : "text-zinc-500")} />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 truncate">{label}</p>
        <p className={cn("text-base font-semibold", highlight ? "text-amber-400" : "text-white")}>{value}</p>
        <p className={cn("text-[10px] truncate", subColor)}>{sub}</p>
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}

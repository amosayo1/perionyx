"use client";

import { cn } from "@/lib/utils";
import { RefreshCw, Download, Printer, Globe, DollarSign, Shield, TrendingUp, AlertTriangle, Users, Building2, FileText, Beaker } from "lucide-react";
import { MOCK_METRICS } from "./data";

export function ExecutiveRiskHeader({ className }: { className?: string }) {
  const m = MOCK_METRICS;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Treasury Risk &amp; FX Management</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            Enterprise-wide risk intelligence &bull; Updated {new Date(m.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white" aria-label="Export"><Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span></button>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white" aria-label="Print"><Printer className="h-4 w-4" /><span className="hidden sm:inline">Print</span></button>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white" aria-label="Refresh"><RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        <HeaderStat icon={DollarSign} label="Total Exposure" value={fmt(m.totalExposure)} sub={pct(m.totalExposure, m.totalExposure)} subColor="text-zinc-400" />
        <HeaderStat icon={Globe} label="Net FX Exposure" value={fmt(m.netFXExposure)} sub={m.trend === "up" ? "Rising" : "Stable"} subColor={m.netFXExposure > 0 ? "text-amber-400" : "text-emerald-400"} />
        <HeaderStat icon={Shield} label="Open Hedges" value={`${m.openHedges}`} sub={`${m.hedgeRatio}% coverage`} subColor="text-zinc-400" />
        <HeaderStat icon={TrendingUp} label="VaR (95%)" value={fmt(m.var1d95)} sub="1-day limit" subColor={m.var1d95 < 50000000 ? "text-emerald-400" : "text-red-400"} />
        <HeaderStat icon={AlertTriangle} label="Breaches" value={`${m.policyBreaches}`} sub={`${m.alerts} alerts`} subColor={m.policyBreaches > 5 ? "text-red-400" : "text-amber-400"} highlight={m.policyBreaches > 0} />
        <HeaderStat icon={Users} label="Counterparties" value={`${m.counterparties}`} sub={`${m.openHedges} positions`} subColor="text-zinc-400" />
        <HeaderStat icon={Building2} label="Countries" value={`${m.countries}`} sub={`${m.stressScenarios} scenarios`} subColor="text-zinc-400" />
        <HeaderStat icon={FileText} label="Policies" value={`${m.policies}`} sub={`${m.policyBreaches} breached`} subColor={m.policyBreaches > 0 ? "text-red-400" : "text-emerald-400"} />
        <HeaderStat icon={Beaker} label="Stress Scenarios" value={`${m.stressScenarios}`} sub={`Score: ${m.overallRiskScore}/100`} subColor={m.overallRiskScore > 70 ? "text-red-400" : "text-zinc-400"} />
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
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function pct(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)}%`;
}

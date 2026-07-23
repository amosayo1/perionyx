"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Gauge } from "lucide-react";
import { MOCK_SCENARIOS } from "./data";
import type { ScenarioResult } from "./types";

export function LiquidityScenarioSimulator({ className }: { className?: string }) {
  const [selected, setSelected] = useState<ScenarioResult>(MOCK_SCENARIOS[0]);

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-white">Scenario Simulator</h3>
        <p className="mb-4 text-[12px] text-zinc-500">Select a scenario to simulate liquidity impact</p>
        <div className="space-y-2">
          {MOCK_SCENARIOS.map((s) => (
            <button key={s.name} onClick={() => setSelected(s)}
              className={cn("w-full rounded-lg border px-4 py-3 text-left text-[13px] transition-colors",
                selected.name === s.name ? "border-[#c9a84c]/50 bg-[#c9a84c]/5 text-white" : "border-white/[0.06] bg-zinc-800/30 text-zinc-300 hover:border-zinc-600")}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.name}</span>
                <span className={cn("rounded px-2 py-0.5 text-[10px] font-medium uppercase",
                  s.riskRating === "critical" ? "bg-red-500/10 text-red-400" :
                  s.riskRating === "high" ? "bg-amber-500/10 text-amber-400" :
                  s.riskRating === "medium" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400")}>
                  {s.riskRating}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-zinc-500">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-white">{selected.name} — Impact Analysis</h3>
        <p className="mb-4 text-[12px] text-zinc-500">{selected.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <ImpactMetric icon={TrendingDown} label="Liquidity Impact" value={fmt(Math.abs(selected.liquidityImpact))} color="text-red-400" />
          <ImpactMetric icon={TrendingUp} label="Funding Impact" value={fmt(selected.fundingImpact)} color="text-amber-400" />
          <ImpactMetric icon={Gauge} label="Coverage Ratio" value={`${selected.coverageRatio.toFixed(1)}x`} color={selected.coverageRatio >= 2 ? "text-emerald-400" : "text-red-400"} />
          <ImpactMetric icon={TrendingUp} label="Working Capital" value={fmt(selected.workingCapital)} color="text-white" />
          <ImpactMetric icon={AlertTriangle} label="Liquidity Score" value={`${selected.liquidityScore}`} color={selected.liquidityScore >= 70 ? "text-emerald-400" : "text-red-400"} />
        </div>

        <div>
          <p className="text-[13px] font-medium text-white mb-2">Recommended Actions</p>
          <ul className="space-y-1.5">
            {selected.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px] text-zinc-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a84c]/10 text-[11px] text-[#c9a84c]">{i + 1}</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ImpactMetric({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-800/30 p-3 text-center">
      <Icon className={cn("mx-auto h-4 w-4 mb-1", color)} />
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={cn("text-sm font-semibold", color)}>{value}</p>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}

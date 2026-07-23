"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskScenario } from "./risk-types";

interface ScenarioDashboardProps {
  scenarios: RiskScenario[];
}

function ImpactBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : pct >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="h-2 rounded-full bg-zinc-800">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const ScenarioDashboard = memo(function ScenarioDashboard({ scenarios }: ScenarioDashboardProps) {
  if (scenarios.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No scenarios defined</p>;
  }

  const maxImpact = Math.max(...scenarios.map(s => s.impact), 1);

  return (
    <div className="space-y-3">
      {scenarios.map((s) => {
        let stressFactors: Record<string, unknown> = {};
        try { stressFactors = JSON.parse(s.stressFactors) as Record<string, unknown>; } catch { /* ignore */ }
        return (
          <div key={s.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs text-zinc-500">{s.description}</p>
              </div>
              <span className="rounded border border-zinc-700/60 px-2 py-0.5 text-xs text-zinc-400">{s.category}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Likelihood</span>
                  <span className="text-zinc-300">{(s.likelihood * 100).toFixed(0)}%</span>
                </div>
                <ImpactBar value={s.likelihood * 100} max={100} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Impact</span>
                  <span className="text-zinc-300">${(s.impact / 1_000_000).toFixed(1)}M</span>
                </div>
                <ImpactBar value={s.impact} max={maxImpact} />
              </div>
            </div>
            {Object.keys(stressFactors).length > 0 && (
              <div className="mt-2 rounded-md bg-zinc-800/40 p-2">
                <p className="text-xs font-medium text-zinc-400">Stress Factors</p>
                <p className="text-xs text-zinc-500">{JSON.stringify(stressFactors)}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

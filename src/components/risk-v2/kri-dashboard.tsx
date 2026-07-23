"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskIndicator } from "./risk-types";

const STATUS_COLORS: Record<string, string> = {
  normal: "text-emerald-400",
  warning: "text-amber-400",
  breach: "text-red-400",
};

interface KRIDashboardProps {
  indicators: RiskIndicator[];
  max?: number;
}

function KRIBars({ indicators }: { indicators: RiskIndicator[] }) {
  return (
    <div className="space-y-2">
      {indicators.map((kri) => {
        const pct = kri.threshold > 0 ? Math.min((kri.value / kri.threshold) * 100, 100) : 0;
        const barColor = kri.status === "breach" ? "bg-red-500" : kri.status === "warning" ? "bg-amber-500" : "bg-emerald-500";
        return (
          <div key={kri.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{kri.name}</p>
                <p className="text-xs text-zinc-500">{kri.description}</p>
              </div>
              <span className={cn("ml-3 text-sm font-bold", STATUS_COLORS[kri.status])}>{kri.value.toFixed(1)}</span>
            </div>
            <div className="relative h-2 rounded-full bg-zinc-800">
              <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-zinc-600">
              <span>Warning: {kri.warningThreshold.toFixed(1)}</span>
              <span>Threshold: {kri.threshold.toFixed(1)}</span>
            </div>
          </div>
        );
      })}
      {indicators.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No KRIs configured</p>
      )}
    </div>
  );
}

export const KRIDashboard = memo(function KRIDashboard({ indicators, max = 15 }: KRIDashboardProps) {
  const sorted = [...indicators].sort((a, b) => {
    const order = { breach: 0, warning: 1, normal: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  }).slice(0, max);

  const breaches = indicators.filter(i => i.status === "breach").length;
  const warnings = indicators.filter(i => i.status === "warning").length;
  const normal = indicators.filter(i => i.status === "normal").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-red-500/20 bg-red-500/10 p-2 text-center">
          <p className="text-lg font-bold text-red-400">{breaches}</p>
          <p className="text-xs text-red-400/80">Breaches</p>
        </div>
        <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2 text-center">
          <p className="text-lg font-bold text-amber-400">{warnings}</p>
          <p className="text-xs text-amber-400/80">Warnings</p>
        </div>
        <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-2 text-center">
          <p className="text-lg font-bold text-emerald-400">{normal}</p>
          <p className="text-xs text-emerald-400/80">Normal</p>
        </div>
      </div>
      <KRIBars indicators={sorted} />
    </div>
  );
});

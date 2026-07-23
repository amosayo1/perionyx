"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskHeatmap, RiskCategory } from "./risk-types";

interface HeatmapChartProps {
  heatmaps: RiskHeatmap[];
}

interface HeatmapCell {
  category: string;
  likelihood: number;
  impact: number;
  count: number;
}

function getHeatColor(value: number): string {
  if (value >= 5) return "bg-red-500/80 border-red-500/40";
  if (value >= 4) return "bg-orange-500/70 border-orange-500/30";
  if (value >= 3) return "bg-amber-500/60 border-amber-500/30";
  if (value >= 2) return "bg-yellow-500/50 border-yellow-500/20";
  return "bg-emerald-500/40 border-emerald-500/20";
}

function getTextColor(value: number): string {
  if (value >= 4) return "text-white";
  if (value >= 3) return "text-zinc-100";
  if (value >= 2) return "text-zinc-300";
  return "text-zinc-400";
}

export const HeatmapChart = memo(function HeatmapChart({ heatmaps }: HeatmapChartProps) {
  const latest = heatmaps.length > 0 ? heatmaps.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b) : null;

  if (!latest) {
    return <p className="py-8 text-center text-sm text-zinc-500">No heatmap data available</p>;
  }

  let cells: HeatmapCell[] = [];
  try {
    cells = JSON.parse(latest.data) as HeatmapCell[];
  } catch {
    return <p className="py-8 text-center text-sm text-zinc-500">Invalid heatmap data</p>;
  }

  const likelihoodLabels = ["", "Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
  const impactLabels = ["", "Negligible", "Minor", "Moderate", "Major", "Severe"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">Period: {latest.period}</p>
        <p className="text-xs text-zinc-500">Generated: {latest.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-zinc-500">Likelihood \ Impact</th>
              {impactLabels.slice(1).map((l, i) => (
                <th key={i} className="px-2 py-1 text-center text-zinc-500">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {likelihoodLabels.slice(1).reverse().map((lLab, li) => {
              const likelihood = 5 - li;
              return (
                <tr key={likelihood}>
                  <td className="px-2 py-1 text-right text-zinc-500">{lLab}</td>
                  {impactLabels.slice(1).map((_, ii) => {
                    const impact = ii + 1;
                    const cell = cells.find(c => Math.round(c.likelihood) === likelihood && Math.round(c.impact) === impact);
                    const value = cell ? Math.max(cell.likelihood, cell.impact) : 0;
                    const count = cell?.count ?? 0;
                    return (
                      <td key={impact} className="px-1 py-1">
                        <div className={cn("flex h-10 w-full items-center justify-center rounded border text-xs font-medium", getHeatColor(value), getTextColor(value))}>
                          {count > 0 ? count : "-"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(v => (
            <div key={v} className={cn("h-3 w-6 rounded", getHeatColor(v))} />
          ))}
        </div>
        <span>Extreme</span>
      </div>
    </div>
  );
});

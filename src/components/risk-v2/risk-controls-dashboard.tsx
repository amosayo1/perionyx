"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskControl } from "./risk-types";

const TYPE_COLORS: Record<string, string> = {
  preventive: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  detective: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  corrective: "text-red-400 bg-red-500/10 border-red-500/20",
  directive: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const EFF_COLORS: Record<string, string> = {
  strong: "text-emerald-400",
  satisfactory: "text-amber-400",
  weak: "text-red-400",
  ineffective: "text-red-400",
  "not-tested": "text-zinc-400",
};

interface RiskControlsDashboardProps {
  controls: RiskControl[];
}

export const RiskControlsDashboard = memo(function RiskControlsDashboard({ controls }: RiskControlsDashboardProps) {
  const byType = {
    preventive: controls.filter(c => c.type === "preventive"),
    detective: controls.filter(c => c.type === "detective"),
    corrective: controls.filter(c => c.type === "corrective"),
    directive: controls.filter(c => c.type === "directive"),
  };

  const byEff = {
    strong: controls.filter(c => c.effectiveness === "strong"),
    satisfactory: controls.filter(c => c.effectiveness === "satisfactory"),
    weak: controls.filter(c => c.effectiveness === "weak"),
    ineffective: controls.filter(c => c.effectiveness === "ineffective"),
    "not-tested": controls.filter(c => c.effectiveness === "not-tested"),
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-xs font-medium text-zinc-500">By Type</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(byType).map(([type, items]) => (
            <div key={type} className={cn("rounded border p-2 text-center", TYPE_COLORS[type])}>
              <p className="text-lg font-bold">{items.length}</p>
              <p className="text-xs capitalize">{type}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium text-zinc-500">By Effectiveness</h4>
        <div className="space-y-1">
          {Object.entries(byEff).map(([eff, items]) => (
            <div key={eff} className="flex items-center justify-between rounded bg-zinc-800/40 px-3 py-2">
              <span className={cn("text-sm", EFF_COLORS[eff])}>{eff.replace("-", " ")}</span>
              <span className="text-sm font-medium text-white">{items.length}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium text-zinc-500">Recent Controls</h4>
        <div className="space-y-2">
          {controls.slice(0, 5).map((c) => (
            <div key={c.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
              <div className="flex items-center gap-2">
                <span className={cn("rounded border px-1.5 py-0.5 text-xs", TYPE_COLORS[c.type])}>{c.type}</span>
                <span className="text-sm font-medium text-white">{c.name}</span>
                <span className={cn("ml-auto text-xs", EFF_COLORS[c.effectiveness])}>{c.effectiveness}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">Owner: {c.owner} • Frequency: {c.frequency}</p>
            </div>
          ))}
          {controls.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-500">No controls defined</p>
          )}
        </div>
      </div>
    </div>
  );
});

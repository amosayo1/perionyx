"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskResponse } from "./risk-types";

const STRATEGY_COLORS: Record<string, string> = {
  avoid: "text-red-400 bg-red-500/10 border-red-500/20",
  reduce: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  transfer: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  accept: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  escalate: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "text-zinc-400",
  "in-progress": "text-blue-400",
  completed: "text-emerald-400",
  overdue: "text-red-400",
};

interface RiskResponsePanelProps {
  responses: RiskResponse[];
  max?: number;
}

export const RiskResponsePanel = memo(function RiskResponsePanel({ responses, max = 10 }: RiskResponsePanelProps) {
  const sorted = [...responses].sort((a, b) => a.timeline.getTime() - b.timeline.getTime()).slice(0, max);

  return (
    <div className="space-y-2">
      {sorted.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("rounded border px-2 py-0.5 text-xs font-medium", STRATEGY_COLORS[r.strategy])}>{r.strategy}</span>
              <span className={cn("text-xs", STATUS_COLORS[r.status])}>{r.status}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400 line-clamp-1">{r.description}</p>
            <p className="mt-0.5 text-xs text-zinc-600">Party: {r.responsibleParty} • Due: {r.timeline.toLocaleDateString()}</p>
          </div>
          {r.cost !== undefined && (
            <div className="ml-3 text-right">
              <p className="text-sm font-medium text-white">${(r.cost / 1000).toFixed(0)}K</p>
              <p className="text-xs text-zinc-500">cost</p>
            </div>
          )}
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No response strategies found</p>
      )}
    </div>
  );
});

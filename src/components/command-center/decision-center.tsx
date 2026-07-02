"use client";

import { WidgetCard, StatusBadge } from "./widget-card";
import type { Decision } from "@/modules/decision-intelligence/types";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<number, string> = {
  5: "text-red-400 border-red-500/30 bg-red-500/10",
  4: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  3: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  2: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10",
  1: "text-zinc-500 border-zinc-600/30 bg-zinc-600/10",
};

const CATEGORY_LABELS: Record<string, string> = {
  treasury: "Treasury", payment: "Payment", approval: "Approval",
  reconciliation: "Reconciliation", operational: "Operational", risk: "Risk",
};

export function DecisionCenterWidget({ decisions, criticalCount }: { decisions: Decision[]; criticalCount: number }) {
  const sorted = [...decisions].sort((a, b) => b.score.overall - a.score.overall).slice(0, 10);

  return (
    <WidgetCard
      title="Decision Center"
      description={`${decisions.length} active · ${criticalCount} critical`}
      status={criticalCount > 0 ? "warning" : "healthy"}
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500">No decisions generated yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((d) => (
            <div key={d.id} className="rounded-lg border border-white/[0.06] bg-black/20 p-3 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", PRIORITY_COLORS[d.priority])}>P{d.priority}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{CATEGORY_LABELS[d.type] ?? d.type}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white truncate">{d.title}</p>
                </div>
                <span className="text-xs font-mono text-zinc-400 shrink-0">{d.score.overall.toFixed(1)}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{d.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {d.suggestedActions.slice(0, 2).map((a, i) => (
                  <span key={i} className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{a}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

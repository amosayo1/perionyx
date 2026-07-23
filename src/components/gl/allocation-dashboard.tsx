"use client";

import { memo } from "react";
import { Play, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AllocationRule, AllocationRun } from "./gl-types";

interface AllocationDashboardProps {
  rules: AllocationRule[];
  runs: AllocationRun[];
  onExecute?: (ruleId: string) => void;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const METHOD_COLORS: Record<string, string> = {
  "driver-based": "border-blue-500/20 bg-blue-500/10 text-blue-400",
  percentage: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  headcount: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  revenue: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "square-footage": "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  manual: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

export const AllocationDashboard = memo(function AllocationDashboard({ rules, runs, onExecute, className }: AllocationDashboardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{rules.length}</p>
          <p className="text-[11px] text-zinc-400/70">Total Rules</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{runs.filter((r) => r.status === "posted").length}</p>
          <p className="text-[11px] text-emerald-400/70">Posted Runs</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{rules.filter((r) => r.isActive).length}</p>
          <p className="text-[11px] text-amber-400/70">Active Rules</p>
        </div>
      </div>

      {rules.map((rule) => {
        const ruleRuns = runs.filter((r) => r.ruleId === rule.id);
        const latestRun = ruleRuns[0];

        return (
          <div key={rule.id} className={cn("rounded-lg border bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60", rule.isActive ? "border-zinc-800/60" : "border-zinc-800/40 opacity-60")}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                  <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", METHOD_COLORS[rule.method] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {rule.method}
                  </span>
                  {!rule.isActive && <span className="rounded-md border border-zinc-500/20 px-1.5 py-0.5 text-[10px] text-zinc-500">Inactive</span>}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{rule.description}</p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
                  <span>{rule.sourceAccountId.length} source account(s)</span>
                  <span>{rule.targetAccountId.length} target account(s)</span>
                  {rule.schedule && <span>Schedule: {rule.schedule}</span>}
                </div>
                {latestRun && (
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="text-zinc-600">Last run: {formatDate(latestRun.createdAt)}</span>
                    <span className={cn("rounded border px-1 py-0.5 font-medium capitalize", latestRun.status === "posted" ? "border-emerald-500/20 text-emerald-400" : "border-amber-500/20 text-amber-400")}>
                      {latestRun.status}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => onExecute?.(rule.id)}
                disabled={!rule.isActive}
                className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-3.5 w-3.5" />
                Execute
              </button>
            </div>

            {ruleRuns.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Recent Runs</p>
                {ruleRuns.slice(0, 3).map((run) => (
                  <div key={run.id} className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      {run.status === "posted" ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Clock className="h-3 w-3 text-amber-500" />
                      )}
                      <span className="text-xs text-zinc-400">{formatDate(run.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#d4af37]">{formatCurrency(run.totalAmount)}</span>
                      <span className={cn("rounded border px-1 py-0.5 text-[9px] font-medium capitalize", run.status === "posted" ? "border-emerald-500/20 text-emerald-400" : "border-amber-500/20 text-amber-400")}>
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {rules.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-zinc-500">No allocation rules configured</p>
        </div>
      )}
    </div>
  );
});

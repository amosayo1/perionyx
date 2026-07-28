"use client";

import type { AllocationRule, AllocationRun } from "./accounting-types";
import { Play, CheckCircle, Clock, BarChart3 } from "lucide-react";

interface AllocationManagerProps {
  rules: AllocationRule[];
  runs: AllocationRun[];
}

export function AllocationManager({ rules, runs }: AllocationManagerProps) {
  const activeRules = rules.filter((r) => r.isActive);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24]">
        <div className="border-b border-gray-800 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-200">Allocation Rules</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {activeRules.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">No active allocation rules</div>
          ) : (
            activeRules.slice(0, 8).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-200">{rule.name}</p>
                    <p className="text-xs text-gray-500">{rule.method.replace(/-/g, " ")} • {rule.targetAccountIds.length} targets • {rule.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <Clock className="h-2.5 w-2.5" />
                    {rule.lastRun ? rule.lastRun.toLocaleDateString() : "Never"}
                  </span>
                  <Play className="h-3 w-3 text-gray-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a24]">
        <div className="border-b border-gray-800 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-200">Recent Allocation Runs</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {runs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">No allocation runs</div>
          ) : (
            runs.slice(0, 5).map((run) => (
              <div key={run.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
                <div className="flex items-center gap-3">
                  {run.status === "posted" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Clock className="h-4 w-4 text-amber-400" />}
                  <div>
                    <p className="text-sm text-gray-200">${run.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{run.allocations.length} allocations • {run.executedBy}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{run.executedAt.toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

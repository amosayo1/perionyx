"use client";

import type { WorkflowAnalyticsData } from "@/modules/orchestration";

interface WorkflowAnalyticsChartProps {
  data: WorkflowAnalyticsData;
}

export function WorkflowAnalyticsChart({ data }: WorkflowAnalyticsChartProps) {
  const maxHourly = Math.max(...data.hourlyDistribution, 1);
  const maxTrigger = Math.max(...Object.values(data.byTrigger), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Executions</p>
          <p className="text-2xl font-bold text-white">{data.totalExecutions}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Completed</p>
          <p className="text-2xl font-bold text-green-400">{data.completed}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Failed</p>
          <p className="text-2xl font-bold text-red-400">{data.failed}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hourly Distribution</h3>
        <div className="flex items-end gap-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4" style={{ height: 120 }}>
          {data.hourlyDistribution.map((val, i) => (
            <div key={i} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t bg-amber-400/60 transition-all"
                style={{ height: `${(val / maxHourly) * 80}px` }}
                title={`${i}:00 — ${val} executions`}
              />
            </div>
          ))}
        </div>
      </div>

      {Object.keys(data.byTrigger).length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">By Trigger Type</h3>
          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            {Object.entries(data.byTrigger).map(([trigger, count]) => (
              <div key={trigger} className="flex items-center gap-2">
                <span className="w-20 text-xs text-zinc-400">{trigger}</span>
                <div className="flex-1 rounded-full bg-zinc-800">
                  <div className="h-4 rounded-full bg-amber-400/60" style={{ width: `${(count / maxTrigger) * 100}%` }} />
                </div>
                <span className="text-xs text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

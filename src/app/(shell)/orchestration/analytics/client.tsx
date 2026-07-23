"use client";

import { useState, useEffect } from "react";
import { WorkflowAnalyticsChart } from "@/components/orchestration/workflow-analytics-chart";
import type { WorkflowAnalyticsData } from "@/modules/orchestration";

export function OrchestrationAnalyticsClient() {
  const [data, setData] = useState<WorkflowAnalyticsData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - days * 86400000).toISOString();
    fetch(`/api/v1/orchestration/analytics?periodStart=${start}&periodEnd=${end}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              days === d
                ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {data ? <WorkflowAnalyticsChart data={data} /> : (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 text-center">
          <p className="text-sm text-zinc-500">Loading analytics...</p>
        </div>
      )}
    </div>
  );
}

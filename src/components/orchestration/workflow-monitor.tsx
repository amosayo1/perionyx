"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface MonitorData {
  summary: { totalWorkflows: number; activeWorkflows: number; runningExecutions: number; pendingExecutions: number; failedToday: number; completedToday: number; avgDurationMs: number; retryRate: number };
  running: Array<{ id: string; workflowId: string; status: string; trigger: string; createdAt: string }>;
  failed: Array<{ id: string; workflowId: string; status: string; error?: string; createdAt: string }>;
}

export function WorkflowMonitor() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/orchestration/monitoring")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse rounded-xl bg-zinc-900/40 p-6"><div className="h-24 bg-zinc-800 rounded" /></div>;

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" /><span className="text-xs text-zinc-500">Avg Duration</span></div>
          <p className="mt-1 text-xl font-bold text-white">{(s?.avgDurationMs ?? 0) / 1000}s</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /><span className="text-xs text-zinc-500">Completed Today</span></div>
          <p className="mt-1 text-xl font-bold text-white">{s?.completedToday ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /><span className="text-xs text-zinc-500">Failed Today</span></div>
          <p className="mt-1 text-xl font-bold text-white">{s?.failedToday ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-xs text-zinc-500">Retry Rate</span></div>
          <p className="mt-1 text-xl font-bold text-white">{(s?.retryRate ?? 0 * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Running</h3>
          {data?.running.length === 0 ? <p className="text-sm text-zinc-500">No running executions</p> : (
            <div className="space-y-2">
              {data?.running.map((e) => (
                <div key={e.id} className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs text-zinc-400">{e.workflowId.slice(0, 8)}</span>
                    <span className="text-[10px] text-zinc-600">{e.trigger}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-600">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Recent Failures</h3>
          {data?.failed.length === 0 ? <p className="text-sm text-zinc-500">No recent failures</p> : (
            <div className="space-y-2">
              {data?.failed.map((e) => (
                <div key={e.id} className="rounded-lg border border-red-500/20 bg-red-900/10 p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-xs text-zinc-400">{e.workflowId.slice(0, 8)}</span>
                  </div>
                  {e.error && <p className="mt-1 text-xs text-red-400" role="alert">{e.error}</p>}
                  <p className="mt-0.5 text-[10px] text-zinc-600">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

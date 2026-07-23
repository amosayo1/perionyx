"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, FileText, Clock, AlertTriangle, CheckCircle, Play, ArrowRight } from "lucide-react";

interface DashboardData {
  summary: { totalWorkflows: number; activeWorkflows: number; runningExecutions: number; pendingExecutions: number; failedToday: number; completedToday: number; avgDurationMs: number; p95DurationMs: number };
  running: unknown[];
  failed: unknown[];
}

export function WorkflowDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/v1/orchestration/monitoring").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Orchestration Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<Activity className="h-5 w-5 text-amber-400" />} label="Total Workflows" value={s?.totalWorkflows ?? 0} />
        <MetricCard icon={<Play className="h-5 w-5 text-green-400" />} label="Active" value={s?.activeWorkflows ?? 0} />
        <MetricCard icon={<Clock className="h-5 w-5 text-blue-400" />} label="Running" value={s?.runningExecutions ?? 0} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5 text-red-400" />} label="Failed Today" value={s?.failedToday ?? 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/orchestration/builder" className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30">
          <FileText className="mb-2 h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Workflow Builder</h3>
          <p className="mt-1 text-xs text-zinc-500">Create and manage workflows</p>
          <ArrowRight className="mt-2 h-4 w-4 text-zinc-500" />
        </Link>
        <Link href="/orchestration/templates" className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30">
          <CheckCircle className="mb-2 h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Templates</h3>
          <p className="mt-1 text-xs text-zinc-500">Pre-built workflow templates</p>
          <ArrowRight className="mt-2 h-4 w-4 text-zinc-500" />
        </Link>
        <Link href="/orchestration/executions" className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30">
          <Activity className="mb-2 h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Executions</h3>
          <p className="mt-1 text-xs text-zinc-500">Track run history</p>
          <ArrowRight className="mt-2 h-4 w-4 text-zinc-500" />
        </Link>
        <Link href="/orchestration/monitoring" className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30">
          <Clock className="mb-2 h-5 w-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Monitoring</h3>
          <p className="mt-1 text-xs text-zinc-500">System health and metrics</p>
          <ArrowRight className="mt-2 h-4 w-4 text-zinc-500" />
        </Link>
      </div>

      {data?.failed && data.failed.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-4">
          <h3 className="text-sm font-semibold text-red-400">Recent Failures</h3>
          <p className="mt-1 text-xs text-zinc-500">{data.failed.length} failed executions</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

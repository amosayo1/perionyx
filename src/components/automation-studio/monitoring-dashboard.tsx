"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity, Play, Clock, AlertTriangle, CheckCircle2, XCircle, PauseCircle,
  ArrowRight, Filter, RefreshCw, Search,
} from "lucide-react";
import type { WorkflowMetricsSummary, WorkflowInstanceSummary, WorkflowDefinitionSummary } from "@/modules/workflow/types";
import { STATUS_CONFIG, STEP_TYPE_LABELS } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/format";
import { cancelWorkflowInstance, pauseWorkflowInstance, resumeWorkflowInstance } from "./actions";

interface Props {
  metrics: WorkflowMetricsSummary | null;
  running: WorkflowInstanceSummary[];
  waiting: WorkflowInstanceSummary[];
  failed: WorkflowInstanceSummary[];
  completed: WorkflowInstanceSummary[];
  definitions: WorkflowDefinitionSummary[];
}

type TabType = "running" | "waiting" | "failed" | "completed";

function InstanceRow({ instance }: { instance: WorkflowInstanceSummary }) {
  const cfg = STATUS_CONFIG[instance.status];
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this workflow execution?")) return;
    setIsPending(true);
    try {
      await cancelWorkflowInstance(instance.id, "Cancelled by operator");
    } finally {
      setIsPending(false);
    }
  };

  const handlePause = async () => {
    setIsPending(true);
    try {
      await pauseWorkflowInstance(instance.id);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Link
      href={`/automation-studio/workflows/${instance.id}`}
      className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.03]"
    >
      <div className={`h-2.5 w-2.5 rounded-full ${cfg.dot} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{instance.definitionName}</p>
          <Badge variant={instance.status === "COMPLETED" ? "success" : instance.status === "FAILED" ? "danger" : instance.status === "RUNNING" ? "default" : "secondary"} className={cfg.color}>
            {cfg.label}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          {instance.currentStep ? STEP_TYPE_LABELS[instance.currentStep] ?? instance.currentStep : "—"}
          {instance.startedAt && ` · Started ${formatDateTime(instance.startedAt)}`}
          {instance.lastError && ` · Error: ${instance.lastError}`}
        </p>
      </div>
      {instance.status === "RUNNING" && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-400" onClick={handlePause} disabled={isPending}>
            <PauseCircle className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={handleCancel} disabled={isPending}>
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      {instance.status === "WAITING" && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={handleCancel} disabled={isPending}>
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <ArrowRight className="h-4 w-4 text-zinc-600 shrink-0" />
    </Link>
  );
}

export function MonitoringDashboardClient({ metrics, running, waiting, failed, completed, definitions }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("running");
  const [search, setSearch] = useState("");

  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: "running", label: "Running", icon: Play, count: running.length },
    { key: "waiting", label: "Waiting", icon: Clock, count: waiting.length },
    { key: "failed", label: "Failed", icon: AlertTriangle, count: failed.length },
    { key: "completed", label: "Completed", icon: CheckCircle2, count: completed.length },
  ];

  const instances: Record<TabType, WorkflowInstanceSummary[]> = {
    running, waiting, failed, completed,
  };

  const currentInstances = instances[activeTab].filter((i) =>
    i.definitionName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitoring</h1>
          <p className="mt-1 text-sm text-zinc-400">Track running, pending, and completed workflow executions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/automation-studio">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Running</p>
            <p className="text-2xl font-bold text-emerald-400">{metrics.runningInstances}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Waiting</p>
            <p className="text-2xl font-bold text-amber-400">{metrics.waitingInstances}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Failed</p>
            <p className="text-2xl font-bold text-red-400">{metrics.failedInstances}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Completed</p>
            <p className="text-2xl font-bold text-[#d4af37]">{metrics.completedInstances}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Success Rate</p>
            <p className="text-2xl font-bold text-white">{metrics.successRate}%</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Avg Duration</p>
            <p className="text-2xl font-bold text-white">
              {metrics.averageDurationMs > 60000
                ? `${Math.round(metrics.averageDurationMs / 60000)}m`
                : metrics.averageDurationMs > 1000
                  ? `${Math.round(metrics.averageDurationMs / 1000)}s`
                  : `${metrics.averageDurationMs}ms`}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#d4af37]/10 text-[#d4af37] shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      isActive ? "bg-[#d4af37]/20 text-[#d4af37]" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="h-8 w-48 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {currentInstances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-600">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-white">No {activeTab} workflows</h3>
              <p className="text-sm text-zinc-500">
                {activeTab === "running" && "Run a workflow to see it appear here."}
                {activeTab === "waiting" && "Workflows waiting for approval or input will appear here."}
                {activeTab === "failed" && "No workflows have failed."}
                {activeTab === "completed" && "Completed workflow executions will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {currentInstances.map((inst) => (
                <InstanceRow key={inst.id} instance={inst} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

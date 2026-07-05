"use client";

import {
  Activity, Clock, AlertTriangle, CheckCircle2, TrendingUp,
  BarChart3, Timer, Gauge, ListTree, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { WorkflowAnalytics } from "@/modules/automation-studio/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  analytics: WorkflowAnalytics | null;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-white/[0.1]">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}/10 border ${color}/20`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms >= 86400000) return `${Math.round(ms / 86400000)}d`;
  if (ms >= 3600000) return `${Math.round(ms / 3600000)}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  if (ms >= 1000) return `${Math.round(ms / 1000)}s`;
  return `${ms}ms`;
}

function formatWaitTime(ms: number): string {
  if (ms >= 3600000) {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.round((ms % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  }
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 1000)}s`;
}

export function AnalyticsDashboardClient({ analytics }: Props) {
  if (!analytics) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="mt-1 text-sm text-zinc-400">Workflow performance metrics and insights</p>
          </div>
          <Link href="/automation-studio">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Dashboard
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-600">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">No analytics data</h3>
            <p className="text-sm text-zinc-500">Run workflows to see analytics here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bottleneckCount = analytics.approvalBottlenecks.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-400">Workflow performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          Last updated: {new Date(analytics.computedAt).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Running" value={analytics.running} icon={Activity} color="text-emerald-400" />
        <StatCard label="Completed" value={analytics.completed} icon={CheckCircle2} color="text-[#d4af37]" />
        <StatCard label="Failed" value={analytics.failed} icon={AlertTriangle} color="text-red-400" />
        <StatCard label="Waiting" value={analytics.waiting} icon={Clock} color="text-amber-400" />
        <StatCard label="Success Rate" value={`${analytics.successRate}%`} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Avg Duration" value={formatDuration(analytics.averageExecutionTimeMs)} icon={Timer} color="text-[#d4af37]" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Step Duration by Type</CardTitle>
            <CardDescription>Average, min, and max execution time per step type</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.stepDuration.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No completed steps to analyze.</p>
            ) : (
              <div className="space-y-3">
                {analytics.stepDuration.slice(0, 10).map((step) => {
                  const maxRef = Math.max(...analytics.stepDuration.map((s) => s.maxDurationMs), 1);
                  const width = Math.round((step.maxDurationMs / maxRef) * 100);
                  return (
                    <div key={step.stepType}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-white capitalize">
                          {step.stepType.replace(/_/g, " ")}
                        </span>
                        <span className="text-zinc-500">
                          {formatDuration(step.averageDurationMs)} avg &middot; {step.executionCount} runs
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-zinc-800">
                        <div
                          className="absolute left-0 top-0 h-2 rounded-full bg-[#d4af37]/60"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <div className="mt-0.5 flex justify-between text-[10px] text-zinc-600">
                        <span>min {formatDuration(step.minDurationMs)}</span>
                        <span>max {formatDuration(step.maxDurationMs)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Approval Bottlenecks</CardTitle>
                <CardDescription>Steps waiting for approval</CardDescription>
              </div>
              {bottleneckCount > 0 && (
                <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {bottleneckCount}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {analytics.approvalBottlenecks.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-zinc-500">No approval bottlenecks</p>
                <p className="text-xs text-zinc-600 mt-1">All approvals are within expected timeframes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.approvalBottlenecks.slice(0, 5).map((b, idx) => (
                  <Link
                    key={`${b.instanceId}-${b.stepLabel}-${idx}`}
                    href={`/automation-studio/workflows/${b.instanceId}`}
                    className="block rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">{b.stepLabel}</p>
                      <Badge variant="warning" className="text-[9px]">
                        {formatWaitTime(b.waitTimeMs)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {b.definitionName ?? "Unknown workflow"}
                    </p>
                  </Link>
                ))}
                {analytics.approvalBottlenecks.length > 5 && (
                  <p className="text-center text-xs text-zinc-600">
                    +{analytics.approvalBottlenecks.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Step Failure Rate</CardTitle>
            <CardDescription>Failure percentage broken down by step type</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.stepFailureRate.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No completed steps to analyze.</p>
            ) : (
              <div className="space-y-2">
                {analytics.stepFailureRate.slice(0, 8).map((s) => (
                  <div key={s.stepType} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-white capitalize">{s.stepType.replace(/_/g, " ")}</p>
                      <span className="text-xs text-zinc-600">
                        {s.completedCount} ok / {s.failedCount} failed
                      </span>
                    </div>
                    <Badge variant={s.failureRate > 10 ? "danger" : s.failureRate > 0 ? "warning" : "success"}>
                      {s.failureRate}% fail
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Metrics</CardTitle>
            <CardDescription>Background job queue status</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.queueMetrics.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900/60 text-zinc-600">
                  <ListTree className="h-5 w-5" />
                </div>
                <p className="text-sm text-zinc-500">No queue data available</p>
                <p className="text-xs text-zinc-600 mt-1">Queue worker may not be running</p>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.queueMetrics.map((q) => (
                  <div key={q.queueName} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2.5">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-white truncate">{q.queueName}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-400">{q.active} active</span>
                      <span className="text-amber-400">{q.queued} queued</span>
                      <span className="text-zinc-500">{q.scheduled} scheduled</span>
                      {q.failed > 0 && <span className="text-red-400">{q.failed} failed</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Templates</CardTitle>
            <CardDescription>Best performing workflow templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topTemplates.map((t) => (
                <div key={t.templateId} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.executionCount} executions</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-400">{formatDuration(t.averageDurationMs)}</span>
                    <Badge variant={t.successRate > 90 ? "success" : t.successRate > 70 ? "warning" : "danger"}>
                      {t.successRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Workflows</CardTitle>
            <CardDescription>Frequently executed workflow definitions</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.mostUsedWorkflows.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No workflow executions recorded.</p>
            ) : (
              <div className="space-y-1 divide-y divide-white/[0.06]">
                {analytics.mostUsedWorkflows.map((w) => (
                  <div key={w.definitionId} className="flex items-center justify-between py-2.5">
                    <p className="text-sm text-white truncate">{w.name}</p>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-3.5 w-3.5 text-zinc-600" />
                      <span className="text-sm font-medium text-[#d4af37]">{w.executionCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

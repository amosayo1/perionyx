"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Play, Plus, Clock, AlertTriangle, CheckCircle2,
  FileText, LayoutTemplate, Activity, Workflow, TrendingUp,
  ShieldCheck, Bell, BarChart3, CalendarClock, FileCheck, Search,
  Layers,
} from "lucide-react";
import type { WorkflowMetricsSummary, WorkflowDefinitionSummary, WorkflowInstanceSummary } from "@/modules/workflow/types";
import type { WorkflowAnalytics } from "@/modules/automation-studio/types";
import { STATUS_CONFIG, STEP_TYPE_LABELS } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

interface Props {
  metrics: WorkflowMetricsSummary | null;
  definitions: WorkflowDefinitionSummary[];
  recentInstances: WorkflowInstanceSummary[];
  workflowAnalytics: WorkflowAnalytics | null;
}

const FEATURE_TILES = [
  { href: "/automation-studio/analytics", icon: BarChart3, label: "Analytics", desc: "Performance metrics, step durations, bottlenecks", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { href: "/automation-studio/templates", icon: LayoutTemplate, label: "Templates", desc: "Pre-built workflow templates", color: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20" },
  { href: "/automation-studio/designer", icon: Workflow, label: "Designer", desc: "Visual workflow builder", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { href: "/automation-studio/approval-matrix", icon: ShieldCheck, label: "Approval Matrix", desc: "Role-based approval rules", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { href: "/automation-studio/business-rules", icon: FileCheck, label: "Business Rules", desc: "Policy & threshold rules", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { href: "/automation-studio/scheduler", icon: CalendarClock, label: "Scheduler", desc: "Cron, events, triggers", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { href: "/automation-studio/monitoring", icon: Activity, label: "Monitor", desc: "Execution history & search", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
];

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
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

export function AutomationDashboardClient({ metrics, definitions, recentInstances, workflowAnalytics }: Props) {
  const [showAllDefinitions] = useState(false);
  const displayDefinitions = showAllDefinitions ? definitions : definitions.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Studio</h1>
          <p className="mt-1 text-sm text-zinc-400">Design, deploy, and monitor financial workflow automations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/automation-studio/templates">
            <Button variant="outline" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/automation-studio/designer">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </Link>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <MetricCard label="Active Workflows" value={metrics.activeDefinitions} icon={FileText} color="text-[#d4af37]" />
          <MetricCard label="Running" value={metrics.runningInstances} icon={Play} color="text-emerald-400" />
          <MetricCard label="Waiting" value={metrics.waitingInstances} icon={Clock} color="text-amber-400" />
          <MetricCard label="Failed" value={metrics.failedInstances} icon={AlertTriangle} color="text-red-400" />
          <MetricCard label="Success Rate" value={`${metrics.successRate}%`} icon={TrendingUp} color="text-emerald-400" />
          <MetricCard label="Completed" value={metrics.completedInstances} icon={CheckCircle2} color="text-[#d4af37]" />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Features</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {FEATURE_TILES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link key={feat.href} href={feat.href}>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 text-center transition-all hover:bg-zinc-900/60 hover:border-white/[0.1] hover:scale-[1.02]">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-white">{feat.label}</p>
                  <p className="text-[10px] text-zinc-500 leading-tight">{feat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Definitions</CardTitle>
                <CardDescription>{definitions.length} total workflows</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/automation-studio/monitoring">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                    <Search className="h-3 w-3" />
                    Search
                  </Button>
                </Link>
                <Link href="/automation-studio/designer">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {definitions.length === 0 ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-zinc-900/20 p-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
                    <Workflow className="h-7 w-7" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-white">No workflows yet</h3>
                  <p className="mb-4 max-w-md text-sm text-zinc-500">Create your first automation to start streamlining financial operations.</p>
                  <Link href="/automation-studio/designer">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Workflow
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {displayDefinitions.map((def) => (
                  <Link key={def.id} href={`/automation-studio/designer/${def.id}`} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]/10 text-[#d4af37]">
                      <Workflow className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{def.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {def.stepCount} steps &middot; v{def.version} &middot; {def.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={def.status === "ACTIVE" ? "success" : "secondary"}>{def.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-zinc-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {definitions.length > 5 && !showAllDefinitions && (
              <Link
                href="/automation-studio/monitoring"
                className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] px-6 py-3 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                View all {definitions.length} workflows
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest workflow executions</CardDescription>
              </div>
              <Link href="/automation-studio/monitoring">
                <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentInstances.length === 0 ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-zinc-900/20 p-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-600">
                    <Activity className="h-7 w-7" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-white">No executions yet</h3>
                  <p className="mb-4 max-w-md text-sm text-zinc-500">Run a workflow to see execution history here.</p>
                  <Link href="/automation-studio/monitoring">
                    <Button variant="outline" className="gap-2">
                      <Activity className="h-4 w-4" />
                      Monitoring
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {recentInstances.map((inst) => {
                  const cfg = STATUS_CONFIG[inst.status];
                  return (
                    <Link key={inst.id} href={`/automation-studio/workflows/${inst.id}`} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.03]">
                      <div className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{inst.definitionName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {inst.currentStep ? STEP_TYPE_LABELS[inst.currentStep] ?? inst.currentStep : "—"}
                          {inst.startedAt && ` · ${formatDateTime(inst.startedAt)}`}
                        </p>
                      </div>
                      <Badge variant={inst.status === "COMPLETED" ? "success" : inst.status === "FAILED" ? "danger" : "default"} className={cfg.color}>
                        {cfg.label}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {workflowAnalytics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/automation-studio/templates">
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3 transition-colors hover:bg-zinc-900/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10 text-[#d4af37]">
                    <LayoutTemplate className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Browse Templates</p>
                    <p className="text-xs text-zinc-500">Start from a pre-built template</p>
                  </div>
                </div>
              </Link>
              <Link href="/automation-studio/monitoring">
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3 transition-colors hover:bg-zinc-900/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Monitor Workflows</p>
                    <p className="text-xs text-zinc-500">Track running and pending executions</p>
                  </div>
                </div>
              </Link>
              <Link href="/automation-studio/designer">
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3 transition-colors hover:bg-zinc-900/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Create Workflow</p>
                    <p className="text-xs text-zinc-500">Build a custom automation</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approval Bottlenecks</CardTitle>
                  <CardDescription>Steps waiting for approval</CardDescription>
                </div>
                {workflowAnalytics.approvalBottlenecks.length > 0 && (
                  <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                    {workflowAnalytics.approvalBottlenecks.length}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {workflowAnalytics.approvalBottlenecks.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-sm text-zinc-400">No approval bottlenecks</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflowAnalytics.approvalBottlenecks.slice(0, 3).map((b, idx) => (
                    <Link
                      key={`${b.instanceId}-${idx}`}
                      href={`/automation-studio/workflows/${b.instanceId}`}
                      className="block rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">{b.stepLabel}</span>
                        <span className="text-xs text-amber-400 shrink-0">{Math.round(b.waitTimeMinutes)}m</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{b.definitionName}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queue Status</CardTitle>
              <CardDescription>Background job queues</CardDescription>
            </CardHeader>
            <CardContent>
              {workflowAnalytics.queueMetrics.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3">
                  <Activity className="h-5 w-5 text-zinc-600 shrink-0" />
                  <p className="text-sm text-zinc-500">No queue data</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflowAnalytics.queueMetrics.slice(0, 4).map((q) => (
                    <div key={q.queueName} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3 py-2">
                      <span className="text-xs text-white truncate">{q.queueName}</span>
                      <span className="text-xs text-emerald-400">{q.active} / {q.queued}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Platform Integrations</CardTitle>
            <CardDescription>Connected systems available for workflow steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: ShieldCheck, label: "Governance", desc: "Policy violations, frameworks", color: "text-amber-400" },
                { icon: FileText, label: "Treasury", desc: "Accounts, balances, transfers", color: "text-emerald-400" },
                { icon: Activity, label: "Operations", desc: "Incidents, health checks", color: "text-blue-400" },
                { icon: Bell, label: "Notifications", desc: "In-app, email, channels", color: "text-purple-400" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color.replace("text", "bg")}/10 border ${item.color.replace("text", "border")}/20`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step Performance</CardTitle>
            <CardDescription>Avg duration by step type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {workflowAnalytics?.stepDuration.slice(0, 5).map((s) => {
              const maxRef = Math.max(...workflowAnalytics.stepDuration.map((x) => x.maxDurationMs), 1);
              const width = Math.round((s.maxDurationMs / maxRef) * 100);
              return (
                <div key={s.stepType}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white capitalize">{s.stepType.replace(/_/g, " ")}</span>
                    <span className="text-zinc-500">
                      {s.averageDurationMs >= 60000
                        ? `${Math.round(s.averageDurationMs / 60000)}m`
                        : `${Math.round(s.averageDurationMs / 1000)}s`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800">
                    <div className="h-1.5 rounded-full bg-[#d4af37]/50" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
            {(!workflowAnalytics || workflowAnalytics.stepDuration.length === 0) && (
              <p className="py-6 text-center text-sm text-zinc-500">No step duration data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Workflows</CardTitle>
            <CardDescription>By execution count</CardDescription>
          </CardHeader>
          <CardContent>
            {workflowAnalytics && workflowAnalytics.mostUsedWorkflows.length > 0 ? (
              <div className="space-y-1 divide-y divide-white/[0.06]">
                {workflowAnalytics.mostUsedWorkflows.slice(0, 5).map((w) => (
                  <div key={w.definitionId} className="flex items-center justify-between py-2">
                    <span className="text-sm text-white truncate">{w.name}</span>
                    <span className="text-sm font-medium text-[#d4af37]">{w.executionCount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-zinc-500">No workflow usage data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

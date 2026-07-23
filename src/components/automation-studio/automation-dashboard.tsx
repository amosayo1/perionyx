"use client";

import Link from "next/link";
import { memo } from "react";
import {
  ArrowRight, Play, Plus, Clock, AlertTriangle, CheckCircle2,
  FileText, LayoutTemplate, Activity, Workflow, TrendingUp,
  ShieldCheck, Bell, BarChart3, CalendarClock, FileCheck,
  Layers, Zap, Settings, Search,
} from "lucide-react";
import type { WorkflowMetricsSummary, WorkflowDefinitionSummary, WorkflowInstanceSummary } from "@/modules/workflow/types";
import type { WorkflowAnalytics } from "@/modules/automation-studio/types";
import { RealtimeDashboard } from "@/components/realtime/realtime-dashboard";
import { STATUS_CONFIG, STEP_TYPE_LABELS } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { ExecutiveHeader } from "@/components/enterprise/executive-header";
import { ExecutiveMetricCard } from "@/components/enterprise/executive-metric-card";
import { ExecutiveSummaryPanel } from "@/components/enterprise/executive-summary-panel";
import { ActivityTimeline } from "@/components/enterprise/activity-timeline";
import { QuickActionGroup } from "@/components/enterprise/quick-action-group";
import { DashboardSection } from "@/components/enterprise/dashboard-section";
import { DashboardDivider } from "@/components/enterprise/dashboard-divider";
import { StatusChip } from "@/components/enterprise/status-chip";
import { IntelligencePanel } from "@/components/enterprise/intelligence-panel";

interface Props {
  metrics: WorkflowMetricsSummary | null;
  definitions: WorkflowDefinitionSummary[];
  recentInstances: WorkflowInstanceSummary[];
  workflowAnalytics: WorkflowAnalytics | null;
}

const FEATURE_TILES = [
  { href: "/automation-studio/analytics", icon: BarChart3, label: "Analytics", desc: "Performance metrics, step durations, bottlenecks", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { href: "/automation-studio/templates", icon: LayoutTemplate, label: "Templates", desc: "Pre-built workflow templates", color: "text-[#c9a84c] bg-gold-500/10 border-gold-500/20" },
  { href: "/automation-studio/designer", icon: Workflow, label: "Designer", desc: "Visual workflow builder", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { href: "/automation-studio/approval-matrix", icon: ShieldCheck, label: "Approval Matrix", desc: "Role-based approval rules", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { href: "/automation-studio/business-rules", icon: FileCheck, label: "Business Rules", desc: "Policy & threshold rules", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { href: "/automation-studio/scheduler", icon: CalendarClock, label: "Scheduler", desc: "Cron, events, triggers", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { href: "/automation-studio/monitoring", icon: Activity, label: "Monitor", desc: "Execution history & search", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
];

const MetricSummaryItem = memo(function MetricSummaryItem({ label, value, status }: { label: string; value: string | number; status?: "positive" | "negative" | "neutral" | "attention" }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", status === "positive" ? "bg-emerald-500" : status === "negative" ? "bg-red-500" : status === "attention" ? "bg-amber-500" : "bg-zinc-500")} />
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{label}</p>
      </div>
      <p className={cn("text-[20px] font-semibold leading-[28px] tracking-[-0.01em]", status === "positive" ? "text-emerald-400" : status === "negative" ? "text-red-400" : status === "attention" ? "text-amber-400" : "text-zinc-200")}>
        {value}
      </p>
    </div>
  );
});

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function StatusDot({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { dot: "bg-zinc-500", color: "text-zinc-400", label: status };
  return <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />;
}

export function AutomationDashboardClient({ metrics, definitions, recentInstances, workflowAnalytics }: Props) {
  const summaryMetrics = metrics ? [
    { label: "Active Workflows", value: metrics.activeDefinitions, status: "positive" as const },
    { label: "Running", value: metrics.runningInstances, status: "positive" as const },
    { label: "Waiting", value: metrics.waitingInstances, status: "attention" as const },
    { label: "Failed", value: metrics.failedInstances, status: "negative" as const },
    { label: "Success Rate", value: `${metrics.successRate}%`, status: metrics.successRate >= 95 ? "positive" as const : metrics.successRate >= 80 ? "attention" as const : "negative" as const },
    { label: "Completed", value: metrics.completedInstances, status: "neutral" as const },
  ] : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <ExecutiveHeader
        badge="Automation Studio"
        title="Command Center"
        description="Design, deploy, and monitor financial workflow automations across your enterprise."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/automation-studio/templates">
              <Button variant="outline" className="gap-2 h-9 text-[13px]">
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </Button>
            </Link>
            <Link href="/automation-studio/designer">
              <Button className="gap-2 h-9 text-[13px]">
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>
            </Link>
          </div>
        }
      />

      <RealtimeDashboard />

      {metrics && (
        <ExecutiveSummaryPanel metrics={summaryMetrics} />
      )}

      <DashboardDivider />

      <DashboardSection title="Platform Features" description="Core modules for building and managing financial automations">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {FEATURE_TILES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link key={feat.href} href={feat.href}>
                <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 text-center transition-all duration-100 hover:border-zinc-700/60 hover:bg-zinc-900/60">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", feat.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-medium text-zinc-200">{feat.label}</p>
                  <p className="text-[10px] text-zinc-500 leading-tight">{feat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardSection>

      <DashboardDivider />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3">
            <div>
              <h3 className="text-[14px] font-semibold text-white">Workflow Definitions</h3>
              <p className="text-[12px] text-zinc-500">{definitions.length} total workflows</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/automation-studio/monitoring">
                <Button size="sm" variant="ghost" className="gap-1.5 text-[11px] h-7">
                  <Search className="h-3 w-3" />
                  Search
                </Button>
              </Link>
              <Link href="/automation-studio/designer">
                <Button size="sm" variant="outline" className="gap-1.5 text-[11px] h-7">
                  <Plus className="h-3.5 w-3.5" />
                  New
                </Button>
              </Link>
            </div>
          </div>
          {definitions.length === 0 ? (
            <div className="p-6">
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700/50 bg-zinc-900/20 p-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gold-500/10">
                  <Workflow className="h-6 w-6 text-[#c9a84c]" />
                </div>
                <h3 className="mb-1 text-[14px] font-semibold text-white">No workflows yet</h3>
                <p className="mb-4 max-w-sm text-[12px] text-zinc-500">Create your first automation to start streamlining financial operations.</p>
                <Link href="/automation-studio/designer">
                  <Button className="gap-2 h-8 text-[12px]">
                    <Plus className="h-3.5 w-3.5" />
                    Create Workflow
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {definitions.slice(0, 5).map((def) => (
                <Link key={def.id} href={`/automation-studio/designer/${def.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-500/10">
                    <Workflow className="h-4 w-4 text-[#c9a84c]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-200">{def.name}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      {def.stepCount} steps &middot; v{def.version} &middot; {def.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={def.status === "ACTIVE" ? "success" : "neutral"} label={def.status} />
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          {definitions.length > 5 && (
            <Link
              href="/automation-studio/monitoring"
              className="flex w-full items-center justify-center gap-2 border-t border-zinc-800/40 px-5 py-3 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              View all {definitions.length} workflows
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <ActivityTimeline
          title="Recent Activity"
          events={recentInstances.slice(0, 10).map((inst) => {
            const cfg = STATUS_CONFIG[inst.status];
            const iconMap: Record<string, typeof Play> = {
              COMPLETED: CheckCircle2,
              FAILED: AlertTriangle,
              RUNNING: Play,
              PENDING: Clock,
            };
            const Icon = iconMap[inst.status] ?? Activity;
            return {
              id: inst.id,
              icon: Icon,
              iconColor: cfg.color,
              actor: inst.definitionName,
              action: inst.currentStep ? `reached ${inst.currentStep}` : "started",
              timestamp: new Date(inst.startedAt ?? Date.now()),
              status: inst.status === "COMPLETED" ? "completed" as const :
                     inst.status === "FAILED" ? "failed" as const :
                     inst.status === "RUNNING" ? "running" as const : "pending" as const,
              workflow: inst.currentStep ? STEP_TYPE_LABELS[inst.currentStep] ?? inst.currentStep : undefined,
              onClick: () => window.location.href = `/automation-studio/workflows/${inst.id}`,
            };
          })}
        />
      </div>

      {workflowAnalytics && (
        <>
          <DashboardDivider />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-white">Quick Actions</h3>
              <div className="space-y-2">
                <QuickActionGroup
                  title="Governance"
                  actions={[
                    { id: "templates", label: "Browse Templates", description: "Start from a pre-built template", icon: LayoutTemplate, href: "/automation-studio/templates" },
                    { id: "monitor", label: "Monitor Workflows", description: "Track running and pending executions", icon: Activity, href: "/automation-studio/monitoring" },
                    { id: "create", label: "Create Workflow", description: "Build a custom automation", icon: Plus, href: "/automation-studio/designer" },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-white">Approval Bottlenecks</h3>
                {workflowAnalytics.approvalBottlenecks.length > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">
                    {workflowAnalytics.approvalBottlenecks.length}
                  </span>
                )}
              </div>
              {workflowAnalytics.approvalBottlenecks.length === 0 ? (
                <div className="flex items-center gap-3 rounded-md border border-emerald-500/10 bg-emerald-500/5 p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-[12px] text-zinc-400">No approval bottlenecks</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflowAnalytics.approvalBottlenecks.slice(0, 3).map((b, idx) => (
                    <Link
                      key={`${b.instanceId}-${idx}`}
                      href={`/automation-studio/workflows/${b.instanceId}`}
                      className="block rounded-md border border-amber-500/10 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-[13px] font-medium text-zinc-200">{b.stepLabel}</span>
                        <span className="shrink-0 text-[11px] text-amber-400">{Math.round(b.waitTimeMinutes)}m</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{b.definitionName}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-white">Queue Status</h3>
              {workflowAnalytics.queueMetrics.length === 0 ? (
                <div className="flex items-center gap-3 rounded-md border border-zinc-800/40 bg-zinc-900/30 p-3">
                  <Activity className="h-4 w-4 shrink-0 text-zinc-600" />
                  <p className="text-[12px] text-zinc-500">No queue data</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflowAnalytics.queueMetrics.slice(0, 4).map((q) => (
                    <div key={q.queueName} className="flex items-center justify-between rounded-md border border-zinc-800/40 bg-zinc-900/30 px-3 py-2">
                      <span className="truncate text-[12px] text-zinc-200">{q.queueName}</span>
                      <span className="shrink-0 text-[11px] text-emerald-400">{q.active} / {q.queued}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DashboardDivider />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-white">Platform Integrations</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: ShieldCheck, label: "Governance", desc: "Policy violations, frameworks", color: "text-amber-400" },
                  { icon: FileText, label: "Treasury", desc: "Accounts, balances, transfers", color: "text-emerald-400" },
                  { icon: Activity, label: "Operations", desc: "Incidents, health checks", color: "text-blue-400" },
                  { icon: Bell, label: "Notifications", desc: "In-app, email, channels", color: "text-purple-400" },
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-zinc-800/40 bg-zinc-900/30 p-3">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", item.color.replace("text", "bg") + "/10")}>
                      <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                    </div>
                    <p className="mt-2 text-[12px] font-medium text-zinc-200">{item.label}</p>
                    <p className="text-[10px] text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-white">Step Performance</h3>
              {workflowAnalytics.stepDuration.length > 0 ? (
                <div className="space-y-2.5">
                  {workflowAnalytics.stepDuration.slice(0, 5).map((s) => {
                    const maxRef = Math.max(...workflowAnalytics.stepDuration.map((x) => x.maxDurationMs), 1);
                    const width = Math.round((s.maxDurationMs / maxRef) * 100);
                    return (
                      <div key={s.stepType}>
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="text-zinc-300 capitalize">{s.stepType.replace(/_/g, " ")}</span>
                          <span className="text-zinc-500">
                            {s.averageDurationMs >= 60000
                              ? `${Math.round(s.averageDurationMs / 60000)}m`
                              : `${Math.round(s.averageDurationMs / 1000)}s`}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800">
                          <div className="h-1.5 rounded-full bg-[#c9a84c]/40" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 text-center text-[12px] text-zinc-500">No step duration data yet.</p>
              )}
            </div>

            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-white">Most Used Workflows</h3>
              {workflowAnalytics.mostUsedWorkflows.length > 0 ? (
                <div className="space-y-1 divide-y divide-zinc-800/40">
                  {workflowAnalytics.mostUsedWorkflows.slice(0, 5).map((w) => (
                    <div key={w.definitionId} className="flex items-center justify-between py-2">
                      <span className="truncate text-[13px] text-zinc-200">{w.name}</span>
                      <span className="shrink-0 text-[13px] font-medium text-[#c9a84c]">{w.executionCount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-[12px] text-zinc-500">No workflow usage data yet.</p>
              )}
            </div>
          </div>
        </>
      )}

      <DashboardDivider />

      <DashboardSection title="Executive Intelligence" description="AI-powered insights, health monitoring, and recommendations">
        <IntelligencePanel />
      </DashboardSection>
    </div>
  );
}

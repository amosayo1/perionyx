"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Play, XCircle, PauseCircle,
  Clock, Activity, AlertTriangle, CheckCircle2, User, FileText,
} from "lucide-react";
import { STATUS_CONFIG, STEP_TYPE_LABELS } from "@/components/automation-studio/types";
import {
  cancelWorkflowInstance, pauseWorkflowInstance, resumeWorkflowInstance,
  startWorkflowInstance, getWorkflowInstance, getWorkflowInstanceEvents,
} from "@/components/automation-studio/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/format";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATED: FileText,
  STARTED: Play,
  COMPLETED: CheckCircle2,
  FAILED: AlertTriangle,
  CANCELLED: XCircle,
  STEP_STARTED: Activity,
  STEP_COMPLETED: CheckCircle2,
  STEP_FAILED: AlertTriangle,
  APPROVAL_REQUESTED: Clock,
  APPROVAL_GRANTED: CheckCircle2,
  APPROVAL_REJECTED: XCircle,
  NOTIFICATION_SENT: BellIcon,
  RESUMED: RotateCcw,
  PAUSED: XCircle,
};

function RotateCcw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [instance, setInstance] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inst, evts] = await Promise.all([
        getWorkflowInstance(params.id).catch(() => null),
        getWorkflowInstanceEvents(params.id).catch(() => []),
      ]);
      setInstance(inst);
      setEvents(evts);
    } catch (e) {
      console.error("Failed to load workflow instance", e);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setActionPending(action);
    try {
      await fn();
      await load();
    } finally {
      setActionPending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#d4af37]" />
          <span className="text-sm">Loading workflow details...</span>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="mx-auto max-w-md mt-20">
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-6 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm text-red-300">Workflow instance not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/automation-studio/monitoring")}>
            Back to Monitoring
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[instance.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const steps = instance.steps ?? [];
  const timelineEvents = events.length > 0 ? events : instance.events ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/automation-studio/monitoring")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{instance.definition?.name ?? "Workflow"}</h1>
              <Badge variant={
                instance.status === "COMPLETED" ? "success" :
                instance.status === "FAILED" ? "danger" :
                instance.status === "RUNNING" ? "default" : "secondary"
              } className={statusCfg.color}>
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">
              {instance.definition?.category ?? "—"} &middot; Created {formatDateTime(instance.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(instance.status === "PENDING" || instance.status === "VALIDATED") && (
            <Button size="sm" className="gap-1.5" onClick={() => handleAction("start", () => startWorkflowInstance(instance.id))} disabled={actionPending === "start"}>
              <Play className="h-3.5 w-3.5" />
              Start
            </Button>
          )}
          {instance.status === "RUNNING" && (
            <Button size="sm" variant="outline" className="gap-1.5 text-amber-400 border-amber-500/30" onClick={() => handleAction("pause", () => pauseWorkflowInstance(instance.id))} disabled={actionPending === "pause"}>
              <PauseCircle className="h-3.5 w-3.5" />
              Pause
            </Button>
          )}
          {(instance.status === "WAITING" || instance.status === "PAUSED") && (
            <Button size="sm" className="gap-1.5" onClick={() => handleAction("resume", () => resumeWorkflowInstance(instance.id))} disabled={actionPending === "resume"}>
              <Play className="h-3.5 w-3.5" />
              Resume
            </Button>
          )}
          {(instance.status === "RUNNING" || instance.status === "WAITING" || instance.status === "PAUSED") && (
            <Button size="sm" variant="outline" className="gap-1.5 text-red-400 border-red-500/30" onClick={() => handleAction("cancel", () => cancelWorkflowInstance(instance.id, "Cancelled by user"))} disabled={actionPending === "cancel"}>
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.push(`/automation-studio/designer/${instance.definitionId}`)}>
            <FileText className="h-3.5 w-3.5" />
            Edit Definition
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Execution Timeline</CardTitle>
            <CardDescription>{timelineEvents.length} events recorded</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No events recorded yet.</p>
            ) : (
              <div className="relative space-y-0">
                {[...timelineEvents].reverse().map((event: any, i: number) => {
                  const EventIcon = EVENT_ICONS[event.eventType] ?? Activity;
                  const isLast = i === 0;
                  return (
                    <div key={event.id} className="relative flex gap-4 pb-6">
                      {!isLast && (
                        <div className="absolute left-[11px] top-6 h-full w-px bg-gradient-to-b from-white/[0.06] to-transparent" />
                      )}
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        event.eventType?.includes("FAILED") || event.eventType?.includes("REJECTED")
                          ? "border-red-500/30 bg-red-950/40 text-red-400"
                          : event.eventType?.includes("COMPLETED") || event.eventType?.includes("GRANTED")
                            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                            : "border-zinc-700 bg-zinc-800/60 text-zinc-400"
                      }`}>
                        <EventIcon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-white">{event.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-zinc-500">{formatDateTime(event.timestamp)}</span>
                          {event.actorId && (
                            <span className="flex items-center gap-1 text-xs text-zinc-600">
                              <User className="h-3 w-3" />
                              {event.actorId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step Status</CardTitle>
              <CardDescription>{steps.filter((s: any) => s.status === "COMPLETED").length} of {steps.length} complete</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.06]">
                {steps.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-zinc-500 text-center">No steps recorded.</p>
                ) : steps.map((step: any) => {
                  const stepCfg = STATUS_CONFIG[step.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                  const isCurrent = step.stepId === instance.currentStepId;
                  return (
                    <div key={step.id} className={`px-4 py-3 transition-colors ${isCurrent ? "bg-[#d4af37]/5" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${stepCfg.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{step.label}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{STEP_TYPE_LABELS[step.stepType] ?? step.stepType}</p>
                        </div>
                        <Badge variant={
                          step.status === "COMPLETED" ? "success" :
                          step.status === "FAILED" ? "danger" :
                          step.status === "RUNNING" ? "default" : "secondary"
                        } className="text-[9px]">
                          {stepCfg.label}
                        </Badge>
                      </div>
                      {step.error && (
                        <p className="mt-1.5 text-xs text-red-400 ml-5">{step.error}</p>
                      )}
                      {step.completedAt && (
                        <p className="mt-0.5 text-[10px] text-zinc-600 ml-5">{formatDateTime(step.completedAt)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Instance ID</span>
                <span className="text-zinc-300 font-mono text-xs">{instance.id?.slice(0, 12)}...</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="text-zinc-500">Definition</span>
                <span className="text-zinc-300">{instance.definition?.name ?? "—"}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="text-zinc-500">Category</span>
                <span className="text-zinc-300 capitalize">{instance.definition?.category ?? "—"}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className={statusCfg.color}>{statusCfg.label}</span>
              </div>
              {instance.startedAt && (
                <>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Started</span>
                    <span className="text-zinc-300">{formatDateTime(instance.startedAt)}</span>
                  </div>
                </>
              )}
              {instance.completedAt && (
                <>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Completed</span>
                    <span className="text-zinc-300">{formatDateTime(instance.completedAt)}</span>
                  </div>
                </>
              )}
              {instance.lastError && (
                <>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Error</span>
                    <span className="text-red-400 text-xs">{instance.lastError}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertTriangle,
  Bot,
  Filter,
} from "lucide-react";

interface TaskRow {
  id: string;
  name: string;
  description: string;
  taskType: string;
  priority: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  retryCount: number;
  maxRetries: number;
  error: Record<string, unknown> | null;
  agent: { id: string; name: string; role: string };
  session: { id: string; status: string } | null;
  capability: { id: string; name: string; capabilityType: string } | null;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  RUNNING: PlayCircle,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  CANCELLED: PauseCircle,
  AWAITING_APPROVAL: AlertTriangle,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-zinc-400",
  RUNNING: "text-emerald-400",
  COMPLETED: "text-zinc-400",
  FAILED: "text-red-400",
  CANCELLED: "text-zinc-500",
  AWAITING_APPROVAL: "text-amber-400",
};

const TASK_TYPES = [
  "analysis",
  "recommendation",
  "execution",
  "monitoring",
  "reporting",
  "investigation",
  "collaboration",
];

const STATUSES = ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED", "AWAITING_APPROVAL"];

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function PriorityBadge({ priority }: { priority: number }) {
  const color =
    priority >= 80
      ? "bg-red-400/10 text-red-400"
      : priority >= 50
        ? "bg-amber-400/10 text-amber-400"
        : "bg-zinc-400/10 text-zinc-400";
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", color)}>
      P{priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const Icon = STATUS_ICONS[status] ?? Clock;
  const color = STATUS_COLORS[status] ?? "text-zinc-400";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="h-3.5 w-3.5" />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function AgentTasksClient({ tasks, stats }: { tasks: TaskRow[]; stats: Stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "ALL");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("taskType") ?? "ALL");

  function applyFilter(status: string, taskType: string) {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (taskType !== "ALL") params.set("taskType", taskType);
    router.push(`/agents/tasks?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s === statusFilter ? "ALL" : s);
              applyFilter(s === statusFilter ? "ALL" : s, typeFilter);
            }}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              statusFilter === s
                ? "border-[#d4af37]/30 bg-[#d4af37]/5"
                : "border-white/[0.09] bg-[#101010] hover:border-white/[0.14]",
            )}
          >
            <p className="text-[11px] text-zinc-500">{s.replace(/_/g, " ")}</p>
            <p className={cn("text-lg font-bold", STATUS_COLORS[s] ?? "text-white")}>
              {stats.byStatus[s] ?? 0}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-500">Type:</span>
        {["ALL", ...TASK_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTypeFilter(t);
              applyFilter(statusFilter, t);
            }}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
              typeFilter === t
                ? "bg-white/[0.08] text-white"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {t === "ALL" ? "All" : t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.09] bg-[#101010]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="mb-3 h-6 w-6 text-zinc-500" />
            <p className="text-sm text-zinc-400">No tasks match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {tasks.map((task) => (
              <div key={task.id} className="px-4 py-3 transition-colors hover:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">{task.name}</p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    {task.description && (
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{task.description}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        {task.agent.name}
                      </span>
                      <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5">
                        {task.taskType}
                      </span>
                      {task.capability && (
                        <span className="text-zinc-600">via {task.capability.name}</span>
                      )}
                      {task.duration != null && (
                        <span>{formatDuration(task.duration)}</span>
                      )}
                      {task.retryCount > 0 && (
                        <span className="text-amber-400">
                          retry {task.retryCount}/{task.maxRetries}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
                {task.error && (
                  <div role="alert" className="mt-2 rounded-lg bg-red-400/5 px-3 py-2 text-xs text-red-400">
                    {typeof task.error === "object" && task.error !== null
                      ? JSON.stringify(task.error).slice(0, 200)
                      : String(task.error)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

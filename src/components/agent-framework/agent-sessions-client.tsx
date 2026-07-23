"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, Bot, PlayCircle, PauseCircle, XCircle, CheckCircle, Loader2 } from "lucide-react";

interface ActiveSession {
  id: string;
  agentId: string;
  userId: string | null;
  status: string;
  context: Record<string, unknown>;
  config: Record<string, unknown>;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  agent: { id: string; name: string; role: string; status: string };
  tasks: { id: string; name: string; status: string; taskType: string; priority: number }[];
  _count: { tasks: number; conversations: number };
}

interface RecentSession {
  id: string;
  agentId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  agent: { id: string; name: string; role: string };
  _count: { tasks: number };
}

interface Stats {
  active: number;
  paused: number;
  completed: number;
  failed: number;
  terminated: number;
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remaining}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  ACTIVE: { icon: PlayCircle, color: "text-emerald-400", label: "Active" },
  PAUSED: { icon: PauseCircle, color: "text-amber-400", label: "Paused" },
  COMPLETED: { icon: CheckCircle, color: "text-zinc-400", label: "Completed" },
  FAILED: { icon: XCircle, color: "text-red-400", label: "Failed" },
  TERMINATED: { icon: XCircle, color: "text-zinc-500", label: "Terminated" },
};

function SessionStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ACTIVE;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", cfg.color)}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function SessionContextSummary({ context }: { context: Record<string, unknown> }) {
  const keys = Object.keys(context);
  if (keys.length === 0) return <span className="text-xs text-zinc-500">No context</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.slice(0, 4).map((key) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-400"
        >
          <span className="text-zinc-500">{key}:</span>
          <span className="text-zinc-300">
            {typeof context[key] === "string"
              ? (context[key] as string).length > 30
                ? (context[key] as string).slice(0, 30) + "…"
                : (context[key] as string)
              : JSON.stringify(context[key]).slice(0, 30)}
          </span>
        </span>
      ))}
      {keys.length > 4 && (
        <span className="text-[11px] text-zinc-500">+{keys.length - 4} more</span>
      )}
    </div>
  );
}

function ActiveSessionCard({ session }: { session: ActiveSession }) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4 transition-colors hover:border-white/[0.14]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4af37]/10">
            <Bot className="h-4 w-4 text-[#d4af37]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{session.agent.name}</p>
            <p className="text-xs text-zinc-500">{session.agent.role}</p>
          </div>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-zinc-500">Duration</p>
          <p className="text-xs font-medium text-white">{formatDuration(session.duration)}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500">Tasks</p>
          <p className="text-xs font-medium text-white">{session._count.tasks}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500">Messages</p>
          <p className="text-xs font-medium text-white">{session._count.conversations}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-[11px] text-zinc-500">Started {timeAgo(session.startedAt)}</p>
        <SessionContextSummary context={session.context} />
      </div>

      {session.tasks.length > 0 && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="mb-2 text-[11px] text-zinc-500">Recent Tasks</p>
          <div className="space-y-1.5">
            {session.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">{task.name}</span>
                <span
                  className={cn(
                    "text-[11px]",
                    task.status === "RUNNING"
                      ? "text-emerald-400"
                      : task.status === "COMPLETED"
                        ? "text-zinc-400"
                        : task.status === "FAILED"
                          ? "text-red-400"
                          : "text-zinc-500",
                  )}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentSessionsClient({
  activeSessions,
  recentSessions,
  stats,
}: {
  activeSessions: ActiveSession[];
  recentSessions: RecentSession[];
  stats: Stats;
}) {
  const [tab, setTab] = useState<"active" | "recent">("active");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Active", value: stats.active, color: "text-emerald-400" },
          { label: "Paused", value: stats.paused, color: "text-amber-400" },
          { label: "Completed", value: stats.completed, color: "text-zinc-400" },
          { label: "Failed", value: stats.failed, color: "text-red-400" },
          { label: "Terminated", value: stats.terminated, color: "text-zinc-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.09] bg-[#101010] p-3">
            <p className="text-[11px] text-zinc-500">{s.label}</p>
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-xl border border-white/[0.09] bg-[#0a0a0a] p-1">
        {(["active", "recent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
              tab === t ? "bg-white/[0.06] text-white" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {t === "active" ? `Active (${activeSessions.length})` : `Recent (${recentSessions.length})`}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
              <Loader2 className="mb-3 h-6 w-6 text-zinc-500" />
              <p className="text-sm text-zinc-400">No active sessions</p>
              <p className="mt-1 text-xs text-zinc-600">Sessions appear here when agents are running</p>
            </div>
          ) : (
            activeSessions.map((s) => <ActiveSessionCard key={s.id} session={s} />)
          )}
        </div>
      )}

      {tab === "recent" && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010]">
          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="mb-3 h-6 w-6 text-zinc-500" />
              <p className="text-sm text-zinc-400">No recent sessions</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Bot className="h-4 w-4 text-zinc-500" />
                    <div>
                      <p className="text-sm text-white">{s.agent.name}</p>
                      <p className="text-[11px] text-zinc-500">
                        {timeAgo(s.startedAt)} · {s._count.tasks} tasks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-500">{formatDuration(s.duration)}</span>
                    <SessionStatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

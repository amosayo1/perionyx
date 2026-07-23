"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Shield,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Eye,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";

interface AgentWithPermissions {
  id: string;
  name: string;
  role: string;
  status: string;
  enabled: boolean;
  configurations: {
    id: string;
    permission: string;
    effect: string;
    reason: string;
    grantedBy: string | null;
    expiresAt: string | null;
  }[];
  configuration: {
    id: string;
    maxConcurrentTasks: number;
    taskTimeout: number;
    maxRetries: number;
    rateLimitPerMinute: number;
    allowedActions: string[];
    forbiddenActions: string[];
  } | null;
  _count: { configurations: number; tasks: number; decisions: number; sessions: number; auditLogs: number };
}

interface AuditEntry {
  id: string;
  action: string;
  createdAt: string;
  agent: { name: string };
  actorUserId: string | null;
}

interface Summary {
  totalAgents: number;
  activeAgents: number;
  totalPermissions: number;
  allowedPermissions: number;
  deniedPermissions: number;
  totalConfigurations: number;
  avgConcurrency: number;
  avgTimeout: number;
  avgRetries: number;
  avgRateLimit: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AgentRow({
  agent,
  isExpanded,
  onToggle,
}: {
  agent: AgentWithPermissions;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
          )}
          <Bot className="h-4 w-4 text-zinc-500" />
          <div>
            <p className="text-sm font-medium text-white">{agent.name}</p>
            <p className="text-[11px] text-zinc-500">
              {agent.role} · {agent._count.configurations} permissions · {agent._count.tasks} tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              agent.status === "ACTIVE" ? "bg-emerald-400" : "bg-zinc-500",
            )}
          />
          <span className="text-xs text-zinc-500">
            {agent._count.configurations} perm
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 pb-4 pt-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold text-zinc-400">Permissions</h4>
              {agent.configurations.length === 0 ? (
                <p className="text-xs text-zinc-600">No permissions configured</p>
              ) : (
                <div className="space-y-1.5">
                  {agent.configurations.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {p.effect === "ALLOW" ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        <span className="text-xs text-zinc-300">{p.permission}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.grantedBy && (
                          <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                            <User className="h-3 w-3" />
                            {p.grantedBy}
                          </span>
                        )}
                        {p.expiresAt && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400">
                            <Clock className="h-3 w-3" />
                            expires
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold text-zinc-400">Configuration</h4>
              {agent.configuration ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Max Concurrent", value: agent.configuration.maxConcurrentTasks },
                    { label: "Timeout", value: `${agent.configuration.taskTimeout / 1000}s` },
                    { label: "Max Retries", value: agent.configuration.maxRetries },
                    { label: "Rate Limit/min", value: agent.configuration.rateLimitPerMinute },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-white/[0.02] px-3 py-2"
                    >
                      <p className="text-[11px] text-zinc-500">{item.label}</p>
                      <p className="text-xs font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                  {agent.configuration.allowedActions.length > 0 && (
                    <div className="col-span-2 rounded-lg bg-white/[0.02] px-3 py-2">
                      <p className="mb-1 text-[11px] text-emerald-400">Allowed Actions</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.configuration.allowedActions.map((a) => (
                          <span
                            key={a}
                            className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[11px] text-emerald-400"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {agent.configuration.forbiddenActions.length > 0 && (
                    <div className="col-span-2 rounded-lg bg-white/[0.02] px-3 py-2">
                      <p className="mb-1 text-[11px] text-red-400">Forbidden Actions</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.configuration.forbiddenActions.map((a) => (
                          <span
                            key={a}
                            className="rounded-md bg-red-400/10 px-1.5 py-0.5 text-[11px] text-red-400"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-600">No configuration</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentGovernanceClient({
  agents,
  summary,
  recentAudit,
}: {
  agents: AgentWithPermissions[];
  summary: Summary;
  recentAudit: AuditEntry[];
}) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Agents", value: summary.totalAgents, icon: Bot },
          { label: "Permissions", value: summary.totalPermissions, icon: Shield },
          { label: "Allowed", value: summary.allowedPermissions, color: "text-emerald-400" },
          { label: "Denied", value: summary.deniedPermissions, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.09] bg-[#101010] p-3">
            <p className="text-[11px] text-zinc-500">{s.label}</p>
            <p className={cn("text-lg font-bold", s.color ?? "text-white")}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.09] bg-[#101010] p-3">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-3.5 w-3.5 text-zinc-500" />
          <h3 className="text-xs font-semibold text-zinc-400">Fleet Averages</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Concurrency", value: summary.avgConcurrency.toFixed(1) },
            { label: "Timeout", value: `${(summary.avgTimeout / 1000).toFixed(0)}s` },
            { label: "Retries", value: summary.avgRetries.toFixed(1) },
            { label: "Rate Limit", value: `${summary.avgRateLimit}/min` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-zinc-500">{item.label}</p>
              <p className="text-xs font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.09] bg-[#101010]">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Permission Overview per Agent</h3>
        </div>
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="mb-3 h-6 w-6 text-zinc-500" />
            <p className="text-sm text-zinc-400">No agents registered</p>
          </div>
        ) : (
          agents.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              isExpanded={expandedAgent === agent.id}
              onToggle={() =>
                setExpandedAgent(expandedAgent === agent.id ? null : agent.id)
              }
            />
          ))
        )}
      </div>

      {recentAudit.length > 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-xs font-semibold text-zinc-400">Recent Permission Changes</h3>
          </div>
          <div className="space-y-2">
            {recentAudit.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {entry.action === "permission.granted" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span className="text-zinc-300">{entry.agent.name}</span>
                  <span className="text-zinc-500">
                    {entry.action === "permission.granted" ? "granted" : "revoked"} a permission
                  </span>
                </div>
                <span className="text-zinc-600">{timeAgo(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

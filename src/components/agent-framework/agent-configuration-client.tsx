"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Settings,
  Bot,
  Clock,
  RefreshCw,
  Gauge,
  ShieldCheck,
  ShieldOff,
  ArrowRight,
  Zap,
  Bell,
  AlertTriangle,
} from "lucide-react";

interface AgentConfig {
  id: string;
  agentId: string;
  maxConcurrentTasks: number;
  taskTimeout: number;
  maxRetries: number;
  rateLimitPerMinute: number;
  allowedActions: string[];
  forbiddenActions: string[];
  escalationRules: Record<string, unknown>;
  safetyPolicies: Record<string, unknown>;
  notificationPrefs: Record<string, unknown>;
  config: Record<string, unknown>;
  agent?: AgentRef;
}

interface AgentRef {
  id: string;
  name: string;
  role: string;
  status: string;
  description?: string;
}

function formatTimeout(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function ConfigCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.09] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", color ?? "text-zinc-500")} />
        <span className="text-[11px] text-zinc-500">{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-zinc-600">{sub}</p>}
    </div>
  );
}

function SingleConfigView({ config, agent }: { config: AgentConfig; agent: AgentRef }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
          <Bot className="h-5 w-5 text-gold" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{agent.name}</p>
          <p className="text-xs text-zinc-500">{agent.role} · {agent.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ConfigCard icon={Zap} label="Max Concurrent Tasks" value={config.maxConcurrentTasks} />
        <ConfigCard icon={Clock} label="Task Timeout" value={formatTimeout(config.taskTimeout)} />
        <ConfigCard icon={RefreshCw} label="Max Retries" value={config.maxRetries} />
        <ConfigCard icon={Gauge} label="Rate Limit / min" value={config.rateLimitPerMinute} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Allowed Actions</h3>
          </div>
          {config.allowedActions.length === 0 ? (
            <p className="text-xs text-zinc-600">No allowed actions configured</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {config.allowedActions.map((action) => (
                <span
                  key={action}
                  className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-400"
                >
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldOff className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Forbidden Actions</h3>
          </div>
          {config.forbiddenActions.length === 0 ? (
            <p className="text-xs text-zinc-600">No forbidden actions configured</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {config.forbiddenActions.map((action) => (
                <span
                  key={action}
                  className="rounded-lg bg-red-400/10 px-2.5 py-1 text-xs text-red-400"
                >
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {Object.keys(config.escalationRules).length > 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Escalation Rules</h3>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-white/[0.02] p-3 text-xs text-zinc-400">
            {JSON.stringify(config.escalationRules, null, 2)}
          </pre>
        </div>
      )}

      {Object.keys(config.safetyPolicies).length > 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Safety Policies</h3>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-white/[0.02] p-3 text-xs text-zinc-400">
            {JSON.stringify(config.safetyPolicies, null, 2)}
          </pre>
        </div>
      )}

      {Object.keys(config.notificationPrefs).length > 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-white/[0.02] p-3 text-xs text-zinc-400">
            {JSON.stringify(config.notificationPrefs, null, 2)}
          </pre>
        </div>
      )}

      {Object.keys(config.config).length > 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#111118] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">Additional Config</h3>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-white/[0.02] p-3 text-xs text-zinc-400">
            {JSON.stringify(config.config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function AgentConfigurationClient({
  configs,
  config,
  agent,
}: {
  configs?: AgentConfig[];
  config?: AgentConfig;
  agent?: AgentRef;
}) {
  if (config && agent) {
    return <SingleConfigView config={config} agent={agent} />;
  }

  const allConfigs = configs ?? [];

  return (
    <div className="space-y-6">
      {allConfigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#111118] py-16 text-center">
          <Settings className="mb-3 h-6 w-6 text-zinc-500" />
          <p className="text-sm text-zinc-400">No configurations found</p>
          <p className="mt-1 text-xs text-zinc-600">Configurations are created when agents are registered</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.09] bg-[#111118]">
          <div className="divide-y divide-white/[0.06]">
            {allConfigs.map((c) => (
              <Link
                key={c.id}
                href={`/agents/configuration?id=${c.id}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
                    <Bot className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.agent?.name ?? "Unknown"}</p>
                    <p className="text-[11px] text-zinc-500">{c.agent?.role} · {c.agent?.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden items-center gap-4 sm:flex">
                    <div className="text-right">
                      <p className="text-[11px] text-zinc-600">Concurrent</p>
                      <p className="text-xs font-medium text-white">{c.maxConcurrentTasks}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-zinc-600">Timeout</p>
                      <p className="text-xs font-medium text-white">{formatTimeout(c.taskTimeout)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-zinc-600">Rate</p>
                      <p className="text-xs font-medium text-white">{c.rateLimitPerMinute}/min</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {c.allowedActions.length > 0 && (
                        <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[11px] text-emerald-400">
                          {c.allowedActions.length} allowed
                        </span>
                      )}
                      {c.forbiddenActions.length > 0 && (
                        <span className="rounded-md bg-red-400/10 px-1.5 py-0.5 text-[11px] text-red-400">
                          {c.forbiddenActions.length} forbidden
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

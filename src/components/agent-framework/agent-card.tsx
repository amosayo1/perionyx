"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, Activity, ListChecks, HeartPulse, Clock, ChevronRight, Zap } from "lucide-react";
import { AgentStatusBadge } from "./agent-status-badge";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    role: string;
    status: string;
    version?: string;
    capabilityCount?: number;
    taskCount?: number;
    healthStatus?: "healthy" | "degraded" | "unhealthy";
    lastActiveAt?: string;
  };
  onClick?: () => void;
  className?: string;
}

const HEALTH_COLORS: Record<string, { dot: string; text: string }> = {
  healthy: { dot: "bg-emerald-400", text: "text-emerald-400" },
  degraded: { dot: "bg-amber-400", text: "text-amber-400" },
  unhealthy: { dot: "bg-red-400", text: "text-red-400" },
};

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function AgentCard({ agent, onClick, className }: AgentCardProps) {
  const health = HEALTH_COLORS[agent.healthStatus ?? "healthy"] ?? HEALTH_COLORS.healthy;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-2xl border border-white/[0.09] bg-[#111118] p-5 transition-colors hover:border-white/[0.14]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/20 bg-gold/10">
            <Bot className="h-5 w-5 text-gold" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{agent.name}</h3>
            <p className="truncate text-xs text-zinc-500">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AgentStatusBadge status={agent.status} />
          {onClick && <ChevronRight className="h-4 w-4 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Zap className="h-3.5 w-3.5 text-zinc-500" />
          <span>{agent.capabilityCount ?? 0} caps</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <ListChecks className="h-3.5 w-3.5 text-zinc-500" />
          <span>{agent.taskCount ?? 0} tasks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <HeartPulse className={cn("h-3.5 w-3.5", health.text)} />
          <span className={health.text}>
            {agent.healthStatus ?? "healthy"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatRelativeTime(agent.lastActiveAt)}</span>
        </div>
        {agent.version && (
          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            v{agent.version}
          </span>
        )}
      </div>
    </motion.div>
  );
}

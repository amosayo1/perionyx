"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HeartPulse, Activity, Clock, AlertTriangle } from "lucide-react";
import { fadeInUp } from "@/components/enterprise/motion/tokens";

interface HealthPulseCardProps {
  agent: {
    id: string;
    name: string;
    role: string;
    status: string;
    healthStatus: "healthy" | "degraded" | "unhealthy" | "unknown";
    message: string | null;
    checkedAt: string | null;
    metrics: Record<string, unknown> | null;
    checkType: string | null;
    recentChecks: Array<{
      status: "healthy" | "degraded" | "unhealthy" | "unknown";
      message: string;
      checkType: string;
      checkedAt: string;
    }>;
  };
  className?: string;
}

const HEALTH_CONFIG: Record<string, { dot: string; bg: string; border: string; icon: typeof HeartPulse; label: string }> = {
  healthy: { dot: "bg-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20", icon: HeartPulse, label: "Healthy" },
  degraded: { dot: "bg-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", icon: Activity, label: "Degraded" },
  unhealthy: { dot: "bg-red-400", bg: "bg-red-500/5", border: "border-red-500/20", icon: AlertTriangle, label: "Unhealthy" },
  unknown: { dot: "bg-zinc-400", bg: "bg-zinc-500/5", border: "border-zinc-500/20", icon: Activity, label: "Unknown" },
};

function formatTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function HealthPulseCard({ agent, className }: HealthPulseCardProps) {
  const cfg = HEALTH_CONFIG[agent.healthStatus] ?? HEALTH_CONFIG.unknown;
  const Icon = cfg.icon;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "rounded-2xl border p-5 transition-colors hover:bg-white/[0.02]",
        cfg.border,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cfg.bg)}>
            <Icon className={cn("h-5 w-5", agent.healthStatus === "healthy" ? "text-emerald-400" : agent.healthStatus === "degraded" ? "text-amber-400" : agent.healthStatus === "unhealthy" ? "text-red-400" : "text-zinc-400")} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-zinc-500">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
          <span className={cn("text-xs font-medium", cfg.dot.replace("bg-", "text-"))}>
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-zinc-500">Last Check</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-300">
            <Clock className="h-3 w-3" />
            {formatTime(agent.checkedAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Check Type</p>
          <p className="mt-0.5 text-xs text-zinc-300">
            {agent.checkType ?? "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Status</p>
          <p className="mt-0.5 text-xs text-zinc-300">{agent.status}</p>
        </div>
      </div>

      {agent.message && (
        <p className="mt-3 text-xs text-zinc-400">{agent.message}</p>
      )}

      {agent.metrics && Object.keys(agent.metrics).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(agent.metrics).slice(0, 4).map(([key, val]) => (
            <span key={key} className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-400">
              {key}: {String(val)}
            </span>
          ))}
        </div>
      )}

      {agent.recentChecks.length > 1 && (
        <div className="mt-4 border-t border-white/[0.05] pt-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Recent Checks</p>
          <div className="space-y-1.5">
            {agent.recentChecks.slice(1).map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  check.status === "healthy" ? "bg-emerald-400" : check.status === "degraded" ? "bg-amber-400" : check.status === "unhealthy" ? "bg-red-400" : "bg-zinc-500",
                )} />
                <span className="text-zinc-500">{check.checkType}</span>
                <span className="text-zinc-600">{formatTime(check.checkedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

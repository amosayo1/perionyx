"use client";

import { cn } from "@/lib/utils";

export type StatusType = "success" | "warning" | "critical" | "info" | "offline" | "online" | "pending" | "running" | "completed" | "scheduled";

interface StatusDotProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<StatusType, { dot: string; bg: string; text: string; defaultLabel: string }> = {
  success:    { dot: "bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]",    bg: "bg-emerald-500/10", text: "text-emerald-400", defaultLabel: "Success" },
  warning:    { dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]",    bg: "bg-amber-500/10",   text: "text-amber-400",  defaultLabel: "Warning" },
  critical:   { dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]",      bg: "bg-red-500/10",     text: "text-red-400",    defaultLabel: "Critical" },
  info:       { dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]",    bg: "bg-blue-500/10",    text: "text-blue-400",   defaultLabel: "Info" },
  offline:    { dot: "bg-zinc-500",                                           bg: "bg-zinc-500/10",    text: "text-zinc-400",   defaultLabel: "Offline" },
  online:     { dot: "bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]",  bg: "bg-emerald-500/10", text: "text-emerald-400", defaultLabel: "Online" },
  pending:    { dot: "bg-amber-500",                                          bg: "bg-amber-500/10",   text: "text-amber-400",  defaultLabel: "Pending" },
  running:    { dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]",    bg: "bg-blue-500/10",    text: "text-blue-400",   defaultLabel: "Running" },
  completed:  { dot: "bg-emerald-500",                                        bg: "bg-emerald-500/10", text: "text-emerald-400", defaultLabel: "Completed" },
  scheduled:  { dot: "bg-purple-500",                                         bg: "bg-purple-500/10",  text: "text-purple-400", defaultLabel: "Scheduled" },
};

const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };
const badgeSizes = { sm: "px-1.5 py-0.5 text-[9px]", md: "px-2 py-0.5 text-[10px]" };

export function StatusDot({ status, size = "md", pulse, className }: StatusDotProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        dotSizes[size],
        cfg.dot,
        pulse && "animate-pulse",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider",
        cfg.bg, cfg.text, badgeSizes[size],
        className,
      )}
    >
      <StatusDot status={status} size={size === "sm" ? "sm" : "md"} />
      {label ?? cfg.defaultLabel}
    </span>
  );
}

export function StatusLabel({ status, label, className }: { status: StatusType; label?: string; className?: string }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", cfg.text, className)}>
      <StatusDot status={status} size="sm" />
      {label ?? cfg.defaultLabel}
    </span>
  );
}

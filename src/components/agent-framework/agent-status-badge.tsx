"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AgentStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; ring: string; pulse?: boolean }> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  PAUSED: {
    label: "Paused",
    dot: "bg-amber-400",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    ring: "ring-amber-500/20",
  },
  DRAFT: {
    label: "Draft",
    dot: "bg-zinc-400",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    ring: "ring-zinc-500/20",
  },
  DISABLED: {
    label: "Disabled",
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    ring: "ring-red-500/20",
  },
  ERROR: {
    label: "Error",
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    ring: "ring-red-500/20",
    pulse: true,
  },
};

const DEFAULT_CONFIG = {
  label: "Unknown",
  dot: "bg-zinc-500",
  bg: "bg-zinc-500/10",
  text: "text-zinc-500",
  ring: "ring-zinc-500/20",
};

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        config.bg,
        config.text,
        config.ring,
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <motion.span
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", config.dot)}
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  );
}

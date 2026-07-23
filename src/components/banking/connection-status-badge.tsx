"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";

interface ConnectionStatusBadgeProps {
  status: "connected" | "disconnected" | "degraded" | "error";
  className?: string;
}

const STATUS_CONFIG = {
  connected: { label: "Connected", dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  disconnected: { label: "Disconnected", dot: "bg-zinc-500", bg: "bg-zinc-500/10", text: "text-zinc-400" },
  degraded: { label: "Degraded", dot: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-400" },
  error: { label: "Error", dot: "bg-red-500", bg: "bg-red-500/10", text: "text-red-400" },
} as const;

export const ConnectionStatusBadge = memo(function ConnectionStatusBadge({
  status,
  className,
}: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        className,
      )}
      role="status"
      aria-label={`Connection status: ${config.label}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
});

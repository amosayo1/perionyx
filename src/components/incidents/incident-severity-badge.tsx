import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "./types";

const config: Record<IncidentSeverity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  low: {
    label: "Low",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export function IncidentSeverityBadge({
  severity,
  size = "sm",
}: {
  severity: IncidentSeverity;
  size?: "sm" | "lg";
}) {
  const cfg = config[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-wider",
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "lg" && "px-2.5 py-1 text-xs",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

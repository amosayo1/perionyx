import { cn } from "@/lib/utils";
import type { IncidentStatus } from "./types";

const labels: Record<IncidentStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  awaiting_info: "Awaiting Info",
  fix_in_progress: "Fix In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const config: Record<IncidentStatus, string> = {
  open: "bg-red-500/10 text-red-400 border-red-500/20",
  investigating: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  awaiting_info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  fix_in_progress: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  resolved: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20",
  closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function IncidentStatusBadge({
  status,
  size = "sm",
}: {
  status: IncidentStatus;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "lg" && "px-2.5 py-1 text-xs",
        config[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

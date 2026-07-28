import { cn } from "@/lib/utils";
import type { ScheduledTask } from "./types";

const statusConfig: Record<string, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  queued: { label: "Queued", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  completed: { label: "Completed", className: "bg-gold/10 text-gold border-gold/20" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function ScheduledTaskCard({ task }: { task: ScheduledTask }) {
  const cfg = statusConfig[task.status];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-white">{task.name}</span>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
        <div><span className="text-zinc-600">Next run</span><p className="text-zinc-300">{task.nextRun}</p></div>
        <div><span className="text-zinc-600">Last run</span><p className="text-zinc-300">{task.lastRun}</p></div>
        <div><span className="text-zinc-600">Duration</span><p className="text-zinc-300">{task.duration}</p></div>
        <div><span className="text-zinc-600">Owner</span><p className="text-zinc-300">{task.owner}</p></div>
      </div>
    </div>
  );
}

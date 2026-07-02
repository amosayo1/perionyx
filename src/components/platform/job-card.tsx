import { cn } from "@/lib/utils";
import type { BackgroundJob } from "./types";

const statusConfig: Record<string, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  queued: { label: "Queued", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  completed: { label: "Completed", className: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function JobCard({ job }: { job: BackgroundJob }) {
  const cfg = statusConfig[job.status];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-white">{job.name}</span>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{job.description}</p>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
        <span>Avg: {job.avgDuration}</span>
        <span>Last: {job.lastExecution}</span>
      </div>
    </div>
  );
}

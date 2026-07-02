import { cn } from "@/lib/utils";
import type { QueueData } from "./types";

const healthConfig: Record<string, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20" },
  warning: { label: "Warning", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  critical: { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function QueueCard({ queue }: { queue: QueueData }) {
  const cfg = healthConfig[queue.health];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-white">{queue.name}</span>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <span className="text-zinc-600">Waiting</span>
          <p className="text-white font-medium">{queue.waiting}</p>
        </div>
        <div>
          <span className="text-zinc-600">Processing</span>
          <p className="text-white font-medium">{queue.processing}</p>
        </div>
        <div>
          <span className="text-zinc-600">Avg Time</span>
          <p className="text-zinc-300 font-medium">{queue.avgProcessingTime}</p>
        </div>
        <div>
          <span className="text-zinc-600">Oldest</span>
          <p className="text-zinc-300 font-medium">{queue.oldestItem}</p>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ScheduledReport } from "./types";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-gold/10 text-gold border-gold/20" },
  paused: { label: "Paused", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  error: { label: "Error", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const freqColors: Record<string, string> = {
  daily: "text-blue-400", weekly: "text-gold", monthly: "text-purple-400", quarterly: "text-amber-400",
};

export function ScheduledReportCard({ report }: { report: ScheduledReport }) {
  const cfg = statusConfig[report.status];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-white">{report.name}</span>
          <span className={cn("block text-[10px] font-semibold capitalize", freqColors[report.frequency])}>
            {report.frequency}
          </span>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div><span className="text-zinc-600">Recipients</span><p className="text-zinc-300 truncate">{report.recipients}</p></div>
        <div><span className="text-zinc-600">Next run</span><p className="text-zinc-300">{report.nextRun}</p></div>
      </div>
      <div className="mt-2 text-[10px] text-zinc-600">Format: {report.format}</div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ConnectionHealthGroup } from "./types";

const colorConfig: Record<string, { label: string; dot: string; bg: string }> = {
  emerald: { label: "Connected", dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]", bg: "border-emerald-500/10 bg-emerald-500/[0.03]" },
  amber: { label: "Warning", dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]", bg: "border-amber-500/10 bg-amber-500/[0.03]" },
  red: { label: "Critical", dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]", bg: "border-red-500/10 bg-red-500/[0.03]" },
  zinc: { label: "Disconnected", dot: "bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.3)]", bg: "border-zinc-500/10 bg-zinc-500/[0.03]" },
};

export function ConnectionHealthCard({ group }: { group: ConnectionHealthGroup }) {
  const cfg = colorConfig[group.color] ?? colorConfig.zinc;

  return (
    <div className={cn("rounded-xl border p-4 transition-all", cfg.bg)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
        <span className="text-sm font-medium text-white">{cfg.label}</span>
      </div>

      <span className="text-3xl font-semibold tracking-tight text-white">{group.count}</span>
      <p className="text-xs text-zinc-500 mt-1">{group.label.toLowerCase()}</p>

      <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed border-t border-white/[0.04] pt-3">
        {group.recentChange}
      </p>
    </div>
  );
}

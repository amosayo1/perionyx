import { cn } from "@/lib/utils";
import type { Integration } from "./types";

const statusConfig: Record<string, { label: string; dot: string }> = {
  connected: { label: "Connected", dot: "bg-[#d4af37]" },
  disconnected: { label: "Disconnected", dot: "bg-red-500" },
  warning: { label: "Warning", dot: "bg-amber-500" },
  retrying: { label: "Retrying", dot: "bg-amber-500 animate-pulse" },
};

export function IntegrationCard({ integration }: { integration: Integration }) {
  const cfg = statusConfig[integration.status] ?? statusConfig.connected;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="text-sm font-medium text-white">{integration.name}</span>
        </div>
        <span className={cn("text-[10px] font-semibold", integration.status === "connected" && "text-[#d4af37]", integration.status === "disconnected" && "text-red-400", (integration.status === "warning" || integration.status === "retrying") && "text-amber-400")}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{integration.description}</p>
      <p className="text-[10px] text-zinc-600 mt-2">Last sync: {integration.lastSync}</p>
    </div>
  );
}

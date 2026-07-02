import { cn } from "@/lib/utils";
import type { ConnectedIntegration } from "./types";

const statusConfig: Record<string, { label: string; dot: string }> = {
  connected: { label: "Connected", dot: "bg-[#d4af37]" },
  warning: { label: "Warning", dot: "bg-amber-500" },
  disconnected: { label: "Disconnected", dot: "bg-red-500" },
};

const categoryColors: Record<string, string> = {
  banking: "text-blue-400",
  erp: "text-purple-400",
  accounting: "text-[#d4af37]",
  identity: "text-amber-400",
  communication: "text-sky-400",
  developer: "text-zinc-400",
  storage: "text-indigo-400",
  analytics: "text-rose-400",
  payments: "text-emerald-400",
  compliance: "text-red-400",
  ai: "text-violet-400",
};

export function IntegrationCard({ integration }: { integration: ConnectedIntegration }) {
  const cfg = statusConfig[integration.status] ?? statusConfig.disconnected;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
            {integration.name.slice(0, 2)}
          </div>
          <div>
            <span className="text-sm font-medium text-white">{integration.name}</span>
            <span className={cn("block text-[10px] font-medium", categoryColors[integration.category] ?? "text-zinc-500")}>
              {integration.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="text-[10px] font-semibold text-[#d4af37]">
            {cfg.label}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 leading-relaxed">{integration.description}</p>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
        <span>v{integration.version}</span>
        <span>Sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : "Never"}</span>
        {integration.latency && <span>Latency: {integration.latency}</span>}
      </div>
    </div>
  );
}

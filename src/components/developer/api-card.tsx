import { cn } from "@/lib/utils";
import type { ApiEndpoint } from "./types";

const statusConfig: Record<string, { label: string; className: string }> = {
  stable: { label: "Stable", className: "bg-gold/10 text-gold border-gold/20" },
  beta: { label: "Beta", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  deprecated: { label: "Deprecated", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function ApiCard({ api }: { api: ApiEndpoint }) {
  const cfg = statusConfig[api.status];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-white">{api.name}</span>
          <span className="block text-[10px] text-zinc-600 font-mono">{api.version}</span>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{api.description}</p>
      <div className="mt-2 space-y-1 text-[10px] text-zinc-600 font-mono">
        <p>Auth: {api.auth}</p>
        <p className="truncate">{api.baseUrl}</p>
        <p>Avg latency: {api.latency}</p>
      </div>
    </div>
  );
}

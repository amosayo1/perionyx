import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AuthMethod } from "./types";

const statusConfig: Record<string, { label: string; className: string }> = {
  recommended: { label: "Recommended", className: "bg-gold/10 text-gold border-gold/20" },
  available: { label: "Available", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  legacy: { label: "Legacy", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

export function AuthenticationCard({ method }: { method: AuthMethod }) {
  const cfg = statusConfig[method.status];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-white">{method.name}</span>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{method.description}</p>
      <p className="text-[10px] text-zinc-600 mt-2">
        <span className="text-zinc-500">Recommended for: </span>
        {method.recommendedUsage}
      </p>
    </div>
  );
}

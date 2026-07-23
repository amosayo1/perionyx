"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";
import type { ProviderHealthSummary } from "@/server/banking/workspace";

const statusIcon = {
  HEALTHY: CheckCircle,
  DEGRADED: AlertTriangle,
  DOWN: XCircle,
};

const statusColor = {
  HEALTHY: "text-emerald-400",
  DEGRADED: "text-amber-400",
  DOWN: "text-red-400",
};

const statusBg = {
  HEALTHY: "bg-emerald-500/10",
  DEGRADED: "bg-amber-500/10",
  DOWN: "bg-red-500/10",
};

interface ProviderHealthGridProps {
  providers: ProviderHealthSummary[];
  className?: string;
}

export function ProviderHealthGrid({ providers, className }: ProviderHealthGridProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {providers.map((p) => {
        const Icon = statusIcon[p.status];
        const color = statusColor[p.status];
        const bg = statusBg[p.status];

        return (
          <div
            key={p.provider}
            className={cn("rounded-lg border bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60", bg.replace("bg", "border").replace("/10", "/20"))}
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-white">{p.provider}</p>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <p className="text-[11px] text-zinc-500">{p.kind}</p>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Avail</span>
                <span className="font-medium text-zinc-300">{p.availability.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Latency</span>
                <span className="font-medium text-zinc-300">{p.latencyMs}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Success</span>
                <span className="font-medium text-zinc-300">{p.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Score</span>
                <span className={cn("font-medium", color)}>{p.score}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
              <Activity className="h-3 w-3" />
              <span>{p.connectionCount} active connections</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
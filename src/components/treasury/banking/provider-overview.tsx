"use client";

import { cn } from "@/lib/utils";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { BankProviderSummary } from "@/server/banking/workspace";

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

interface ProviderOverviewProps {
  providers: BankProviderSummary[];
  className?: string;
}

export function ProviderOverview({ providers, className }: ProviderOverviewProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {providers.map((p) => {
        const Icon = statusIcon[p.health];
        const color = statusColor[p.health];
        const bg = statusBg[p.health];

        return (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <div>
                <p className="text-[14px] font-medium text-white">{p.name}</p>
                <p className="text-[11px] text-zinc-500">{p.kind}</p>
              </div>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <div className="text-center">
                <p className={cn("text-[13px] font-semibold", color)}>{p.latencyMs}ms</p>
                <p className="text-[10px] text-zinc-500">Latency</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-white">{p.currentConnections}</p>
                <p className="text-[10px] text-zinc-500">Active</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-white">{p.supportedInstitutions}</p>
                <p className="text-[10px] text-zinc-500">Institutions</p>
              </div>
              <div className="text-center">
                <p className={cn("text-[13px] font-semibold", color)}>{p.score}/100</p>
                <p className="text-[10px] text-zinc-500">Score</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {p.capabilities.slice(0, 3).map((cap) => (
                <span
                  key={cap}
                  className="rounded-full bg-zinc-800/50 px-2.5 py-0.5 text-[10px] text-zinc-400"
                >
                  {cap}
                </span>
              ))}
              {p.capabilities.length > 3 && (
                <span className="rounded-full bg-zinc-800/50 px-2.5 py-0.5 text-[10px] text-zinc-500">
                  +{p.capabilities.length - 3}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
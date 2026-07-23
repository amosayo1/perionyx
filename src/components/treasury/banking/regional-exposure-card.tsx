"use client";

import { cn } from "@/lib/utils";
import { Globe, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { RegionalBanking } from "@/server/banking/workspace";

const healthIcon = {
  HEALTHY: CheckCircle,
  DEGRADED: AlertTriangle,
  CRITICAL: XCircle,
};

const healthColor = {
  HEALTHY: "text-emerald-400",
  DEGRADED: "text-amber-400",
  CRITICAL: "text-red-400",
};

const healthBg = {
  HEALTHY: "bg-emerald-500/10",
  DEGRADED: "bg-amber-500/10",
  CRITICAL: "bg-red-500/10",
};

const connStatusColor = {
  ALL_CONNECTED: "text-emerald-400",
  PARTIAL: "text-amber-400",
  DEGRADED: "text-red-400",
};

interface RegionalExposureCardProps {
  regions: RegionalBanking[];
  className?: string;
}

export function RegionalExposureCard({ regions, className }: RegionalExposureCardProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {regions.map((r) => {
        const Icon = healthIcon[r.health];
        const color = healthColor[r.health];
        const bg = healthBg[r.health];

        return (
          <div
            key={r.region}
            className={cn("rounded-lg border bg-zinc-900/40 p-4", bg.replace("bg", "border").replace("/10", "/20"))}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-400" />
                <p className="text-[14px] font-medium text-white">{r.region}</p>
              </div>
              <Icon className={cn("h-5 w-5", color)} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div><span className="text-zinc-500">Banks:</span><span className="ml-1 text-zinc-300">{r.banks}</span></div>
              <div><span className="text-zinc-500">Score:</span><span className={cn("ml-1", color)}>{r.score}/100</span></div>
              <div><span className="text-zinc-500">Currencies:</span><span className="ml-1 text-zinc-300">{r.currencies.length}</span></div>
              <div><span className="text-zinc-500">Providers:</span><span className="ml-1 text-zinc-300">{r.providers.length}</span></div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {r.currencies.slice(0, 4).map((c) => (
                <span key={c} className="rounded bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{c}</span>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className={cn("font-medium", connStatusColor[r.connectionStatus])}>
                {r.connectionStatus.replace("_", " ")}
              </span>
              <span className="text-zinc-400">
                {r.cashPosition.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function OperationsCenterWidget({ data }: { data: CommandCenterData["operations"] }) {
  return (
    <WidgetCard
      title="Operations Center"
      description={`${data.connectorCount} connectors · ${data.inactiveConnectors} inactive`}
      status={data.inactiveConnectors > 0 ? "warning" : "healthy"}
    >
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Connectors</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.connectorCount}</p>
          </div>
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Sync Success</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.syncSuccessRate}%</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400">Inactive Connectors</span>
            <span className={`text-sm font-semibold ${data.inactiveConnectors > 0 ? "text-amber-400" : "text-white"}`}>{data.inactiveConnectors}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400">Failed Syncs</span>
            <span className={`text-sm font-semibold ${data.failedSyncs > 0 ? "text-red-400" : "text-white"}`}>{data.failedSyncs}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
            <span className="text-xs text-zinc-400">Queue Depth</span>
            <span className="text-sm font-semibold text-white">{data.queueDepth}</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

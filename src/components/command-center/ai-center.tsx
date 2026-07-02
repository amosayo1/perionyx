"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function AiCenterWidget({ data }: { data: CommandCenterData["ai"] }) {
  return (
    <WidgetCard
      title="AI Center"
      description={`${data.activeProviders}/${data.totalProviders} providers`}
      status={data.healthyProviders === 0 ? "warning" : "healthy"}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active Providers</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.activeProviders}</p>
          </div>
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Healthy</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.healthyProviders}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded bg-black/20 border border-white/[0.06]">
          <span className="text-xs text-zinc-400">Total Providers Available</span>
          <span className="text-sm font-semibold text-white">{data.totalProviders}</span>
        </div>
        <p className="text-xs text-zinc-500">AI Provider status is monitored by the provider health subsystem. No credentials are exposed through this interface.</p>
      </div>
    </WidgetCard>
  );
}

"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { HealthIndicator } from "@/components/enterprise/health-indicator";
import { AnimatedCounter } from "@/components/enterprise/animated-counter";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

interface AiEnhancedProps {
  data: CommandCenterData["ai"];
  className?: string;
}

export function AiCenterEnhanced({ data, className }: AiEnhancedProps) {
  const healthPct = data.totalProviders > 0 ? Math.round((data.healthyProviders / data.totalProviders) * 100) : 0;

  return (
    <GlassCard
      title="AI Center"
      description={`${data.healthyProviders}/${data.totalProviders} healthy providers`}
      variant="default"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-4">
        {/* Top metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <AnimatedCounter value={data.activeProviders} className="text-lg font-bold text-white tabular-nums" />
            <p className="text-[9px] text-zinc-500 mt-0.5">Active</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <AnimatedCounter value={data.totalProviders} className="text-lg font-bold text-white tabular-nums" />
            <p className="text-[9px] text-zinc-500 mt-0.5">Total</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <AnimatedCounter value={data.recentUsage} className="text-lg font-bold text-blue-400 tabular-nums" />
            <p className="text-[9px] text-zinc-500 mt-0.5">Recent Usage</p>
          </div>
        </div>

        {/* Health bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Provider Health</span>
            <HealthIndicator
              status={healthPct >= 80 ? "healthy" : healthPct >= 50 ? "warning" : "critical"}
              size="sm"
            />
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                healthPct >= 80 ? "bg-emerald-400" : healthPct >= 50 ? "bg-amber-400" : "bg-red-400"
              }`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
          <span className="text-xs text-zinc-400">Active / Total Providers</span>
          <span className="text-sm font-semibold text-white tabular-nums">
            {data.activeProviders} / {data.totalProviders}
          </span>
        </div>

        {data.totalProviders === 0 && (
          <p className="text-xs text-zinc-500 text-center py-1">No AI providers configured.</p>
        )}
      </div>
    </GlassCard>
  );
}

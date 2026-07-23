"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { HealthBar } from "@/components/enterprise/health-indicator";
import { AnimatedCounter } from "@/components/enterprise/animated-counter";
import { StatusDot } from "@/components/enterprise/visualizations/trend-chart";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

interface OperationsEnhancedProps {
  data: CommandCenterData["operations"];
  className?: string;
}

export function OperationsCenterEnhanced({ data, className }: OperationsEnhancedProps) {
  const syncSuccessRate = data.syncSuccessRate ?? 0;

  return (
    <GlassCard
      title="Operations Center"
      description={`${data.connectorCount} connectors · ${data.inactiveConnectors} inactive`}
      variant="default"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-4">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Connectors</span>
              <StatusDot status={data.inactiveConnectors > 0 ? "warning" : "healthy"} size="sm" />
            </div>
            <AnimatedCounter value={data.connectorCount} className="text-lg font-bold text-white tabular-nums" />
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Sync Success</span>
            </div>
            <AnimatedCounter value={syncSuccessRate} suffix="%" className="text-lg font-bold text-emerald-400 tabular-nums" />
          </div>
        </div>

        {/* Sync health bar */}
        <HealthBar score={syncSuccessRate} label="Sync Health" />

        {/* Detail rows */}
        <div className="space-y-1">
          {[
            { label: "Inactive Connectors", value: data.inactiveConnectors, critical: data.inactiveConnectors > 0 },
            { label: "Failed Syncs", value: data.failedSyncs, critical: data.failedSyncs > 0 },
            { label: "Queue Depth", value: data.queueDepth, critical: false },
          ].map((row) => (
            <div key={row.label} className="group flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2 transition-all hover:bg-white/[0.04]">
              <span className="text-xs text-zinc-400">{row.label}</span>
              <span className={`text-sm font-semibold tabular-nums ${row.critical ? "text-amber-400" : "text-white"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

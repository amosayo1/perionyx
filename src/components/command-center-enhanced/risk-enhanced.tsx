"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { RiskHeatmap, GaugeCluster } from "@/components/enterprise/visualizations/risk-heatmap";
import { StatusDot } from "@/components/enterprise/visualizations/trend-chart";
import { AnimatedCounter } from "@/components/enterprise/animated-counter";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

interface RiskEnhancedProps {
  data: CommandCenterData["risk"];
  className?: string;
}

export function RiskCenterEnhanced({ data, className }: RiskEnhancedProps) {
  const hasAlerts = data.openAlerts > 0 || data.criticalAlerts > 0 || data.openIncidents > 0;

  return (
    <GlassCard
      title="Risk Center"
      description={data.criticalAlerts > 0 ? `${data.criticalAlerts} critical alerts` : "All clear"}
      variant="default"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-4">
        {/* Metric counters */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <AnimatedCounter value={data.openAlerts} className="text-lg font-bold text-amber-400 tabular-nums" />
            <p className="text-[9px] text-zinc-500 mt-0.5">Open Alerts</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <AnimatedCounter value={data.criticalAlerts} className="text-lg font-bold text-red-400 tabular-nums" />
            <p className="text-[9px] text-zinc-500 mt-0.5">Critical</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <AnimatedCounter value={data.policyViolations} className="text-lg font-bold text-orange-400 tabular-nums" />
            <p className="text-[9px] text-zinc-500 mt-0.5">Violations</p>
          </div>
        </div>

        {/* Risk heatmap */}
        {hasAlerts && (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
            <p className="text-[10px] text-zinc-500 mb-2">Risk Distribution</p>
            <RiskHeatmap
              data={[
                [
                  { label: "Alerts", value: data.openAlerts, risk: data.openAlerts > 10 ? "critical" : data.openAlerts > 0 ? "medium" : "low" },
                  { label: "Critical", value: data.criticalAlerts, risk: data.criticalAlerts > 0 ? "critical" : "low" },
                  { label: "Incidents", value: data.openIncidents, risk: data.openIncidents > 0 ? "high" : "low" },
                ],
                [
                  { label: "Violations", value: data.policyViolations, risk: data.policyViolations > 5 ? "critical" : data.policyViolations > 0 ? "medium" : "low" },
                  { label: "Suspicious", value: data.suspiciousActivity, risk: data.suspiciousActivity > 0 ? "high" : "low" },
                  { label: "All Clear", value: hasAlerts ? 0 : 1, risk: "low" },
                ],
              ]}
            />
          </div>
        )}

        {/* Status gauges */}
        <GaugeCluster
          sections={[
            { label: "Alert Severity", value: data.criticalAlerts, max: Math.max(data.criticalAlerts, 1), color: "#ef4444" },
            { label: "Resolution Rate", value: data.openAlerts > 0 ? Math.max(data.openAlerts - data.criticalAlerts, 0) : 100, max: Math.max(data.openAlerts, 100), color: "#d4af37" },
          ]}
        />

        {/* Empty state */}
        {!hasAlerts && (
          <div className="flex items-center justify-center gap-2 py-2">
            <StatusDot status="healthy" />
            <span className="text-xs text-zinc-500">No active risks detected</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

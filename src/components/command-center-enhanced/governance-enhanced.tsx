"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { HealthBar } from "@/components/enterprise/health-indicator";
import { RiskIndicator } from "@/components/enterprise/risk-indicator";
import { AnimatedCounter } from "@/components/enterprise/animated-counter";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

interface GovernanceEnhancedProps {
  data: CommandCenterData["governance"];
  className?: string;
}

export function GovernanceCenterEnhanced({ data, className }: GovernanceEnhancedProps) {
  const health = data.healthScore;
  const violations = data.violations;

  return (
    <GlassCard
      title="Governance Center"
      description={`${health?.overall ?? "—"} health score · ${data.activePolicies} active policies`}
      variant="default"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-4">
        {/* Health bar */}
        {health && (
          <HealthBar
            score={health.overall}
            label="Overall Health"
            className="px-1"
          />
        )}

        {/* KPIs grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Policy Violations</p>
            <div className="flex items-center gap-2 mt-1">
              <AnimatedCounter value={violations?.open ?? 0} className="text-lg font-bold text-white tabular-nums" />
              {(violations?.critical ?? 0) > 0 && <RiskIndicator level="critical" />}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Pending Approvals</p>
            <AnimatedCounter value={data.pendingApprovals} className="text-lg font-bold text-amber-400 tabular-nums" />
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active Exceptions</p>
            <AnimatedCounter value={data.activeExceptions} className="text-lg font-bold text-orange-400 tabular-nums" />
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Compliance</p>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {health ? `${Math.round(health.overall / 10 * 100)}%` : "—"}
            </span>
          </div>
        </div>

        {/* Critical violations banner */}
        {violations && violations.critical > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-red-950/40 to-red-950/20 border border-red-500/20 p-3">
            <div className="flex items-center gap-2">
              <RiskIndicator level="critical" />
              <span className="text-[11px] font-semibold text-red-400">{violations.critical} Critical Violation{violations.critical > 1 ? "s" : ""}</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Requires immediate attention</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

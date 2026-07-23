"use client";

import { RiskKPICard } from "./risk-kpi-card";
import type { RiskOverviewMetrics } from "./risk-types";
import { AlertTriangle, Activity, ShieldAlert, TrendingUp, Gauge, Bell } from "lucide-react";

interface RiskOverviewProps {
  metrics: RiskOverviewMetrics;
}

export function RiskOverview({ metrics }: RiskOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
      <RiskKPICard
        title="Enterprise Risk Score"
        value={metrics.enterpriseRiskScore.toFixed(1)}
        trend={metrics.riskTrend}
        status={metrics.enterpriseRiskScore > 60 ? "critical" : metrics.enterpriseRiskScore > 35 ? "warning" : "good"}
        icon={<Gauge className="h-4 w-4" />}
      />
      <RiskKPICard
        title="Open Risks"
        value={metrics.openRisks}
        subtitle={`${metrics.criticalRisks} critical`}
        status={metrics.criticalRisks > 5 ? "critical" : metrics.criticalRisks > 0 ? "warning" : "good"}
        icon={<Activity className="h-4 w-4" />}
      />
      <RiskKPICard
        title="Residual Risk"
        value={metrics.residualRisk.toFixed(1)}
        trend={metrics.residualRisk > 50 ? "deteriorating" : "improving"}
        status={metrics.residualRisk > 60 ? "critical" : metrics.residualRisk > 35 ? "warning" : "good"}
        icon={<ShieldAlert className="h-4 w-4" />}
      />
      <RiskKPICard
        title="Active Alerts"
        value={metrics.openAlerts}
        subtitle={`${metrics.breachedLimits} limits breached`}
        status={metrics.breachedLimits > 0 ? "critical" : metrics.openAlerts > 10 ? "warning" : "good"}
        icon={<Bell className="h-4 w-4" />}
      />
      <RiskKPICard
        title="Policy Violations"
        value={metrics.activeViolations}
        subtitle={`${metrics.overdueReviews} overdue reviews`}
        status={metrics.activeViolations > 10 ? "critical" : metrics.activeViolations > 3 ? "warning" : "good"}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}
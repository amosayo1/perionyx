"use client";

import { memo } from "react";
import { RiskHeader } from "./risk-header";
import type { RiskOverviewMetrics, RiskRegister, RiskAssessment, RiskIndicator, RiskAlert } from "./risk-types";

interface RiskDashboardProps {
  metrics: RiskOverviewMetrics;
  registers: RiskRegister[];
  assessments: RiskAssessment[];
  indicators: RiskIndicator[];
  alerts: RiskAlert[];
}

export const RiskDashboard = memo(function RiskDashboard({ metrics, registers, assessments, indicators, alerts }: RiskDashboardProps) {
  const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.dismissed);
  const breachIndicators = indicators.filter(i => i.status === "breach");
  const pendingAssessments = registers.filter(r => r.status === "identified" || r.status === "assessed");

  return (
    <div className="space-y-6">
      <RiskHeader metrics={metrics} />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Risk Register Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Entries</span>
              <span className="text-white">{registers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Open Items</span>
              <span className="text-amber-400">{registers.filter(r => r.status !== "closed").length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Critical</span>
              <span className="text-red-400">{registers.filter(r => r.riskLevel === "critical").length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Pending Assessment</span>
              <span className="text-amber-400">{pendingAssessments.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">KRI Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total KRIs</span>
              <span className="text-white">{indicators.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Breaches</span>
              <span className="text-red-400">{breachIndicators.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Warnings</span>
              <span className="text-amber-400">{indicators.filter(i => i.status === "warning").length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Normal</span>
              <span className="text-emerald-400">{indicators.filter(i => i.status === "normal").length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Active Alerts</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Alerts</span>
              <span className="text-white">{alerts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Critical</span>
              <span className="text-red-400">{criticalAlerts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Action Required</span>
              <span className="text-amber-400">{alerts.filter(a => a.actionRequired && !a.dismissed).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Dismissed</span>
              <span className="text-zinc-500">{alerts.filter(a => a.dismissed).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

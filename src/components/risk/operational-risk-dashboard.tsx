"use client";

import type { OperationalRiskData, Control, PolicyViolation } from "./risk-types";

interface OperationalRiskDashboardProps {
  operationalData: OperationalRiskData[];
  controls: Control[];
  violations: PolicyViolation[];
}

export function OperationalRiskDashboard({ operationalData, controls, violations }: OperationalRiskDashboardProps) {
  const totalLoss = operationalData.reduce((s, d) => s + d.operationalLoss, 0);
  const nearMisses = operationalData.filter((d) => d.isNearMiss).length;
  const fraudCount = operationalData.filter((d) => d.subType === "fraud").length;
  const systemFailures = operationalData.filter((d) => d.subType === "system-failure").length;
  const humanErrors = operationalData.filter((d) => d.subType === "human-error").length;
  const effectiveControls = controls.filter((c) => c.effectiveness === "strong" || c.effectiveness === "satisfactory").length;
  const controlRate = controls.length > 0 ? (effectiveControls / controls.length) * 100 : 0;
  const activeViolations = violations.filter((v) => v.status === "non-compliant" || v.status === "pending-review").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Total Operational Loss</p>
          <p className="text-lg font-semibold text-white">${(totalLoss / 1e6).toFixed(1)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Near Misses</p>
          <p className="text-lg font-semibold text-amber-400">{nearMisses}</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Control Effectiveness</p>
          <p className={`text-lg font-semibold ${controlRate >= 70 ? "text-emerald-400" : "text-amber-400"}`}>{controlRate.toFixed(0)}%</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Active Violations</p>
          <p className={`text-lg font-semibold ${activeViolations > 0 ? "text-red-400" : "text-emerald-400"}`}>{activeViolations}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Fraud Incidents</p>
          <p className="text-lg font-semibold text-red-400">{fraudCount}</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">System Failures</p>
          <p className="text-lg font-semibold text-orange-400">{systemFailures}</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Human Errors</p>
          <p className="text-lg font-semibold text-amber-400">{humanErrors}</p>
        </div>
      </div>
    </div>
  );
}
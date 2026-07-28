"use client";

import type { Alert } from "./risk-types";

interface RiskAlertsPanelProps {
  alerts: Alert[];
  max?: number;
}

export function RiskAlertsPanel({ alerts, max = 10 }: RiskAlertsPanelProps) {
  const active = alerts.filter((a) => a.status === "active").slice(0, max);
  const severityStyles: Record<string, string> = {
    critical: "border-l-red-500 bg-red-950/20",
    high: "border-l-orange-500 bg-orange-950/20",
    medium: "border-l-amber-500 bg-amber-950/20",
    low: "border-l-blue-500 bg-blue-950/20",
    info: "border-l-gray-500 bg-gray-800/30",
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Active Alerts</h3>
        <span className="text-xs text-gray-500">{alerts.filter(a => a.status === "active").length} active</span>
      </div>
      {active.length === 0 ? (
        <p className="text-sm text-gray-500">No active alerts</p>
      ) : (
        <div className="space-y-2">
          {active.map((alert) => (
            <div key={alert.id} className={`rounded border-l-2 p-3 ${severityStyles[alert.severity] || severityStyles.medium}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-200">{alert.title}</p>
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] uppercase text-gray-400">{alert.severity}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{alert.description}</p>
              <p className="mt-1 text-[10px] text-gray-600">{alert.createdAt.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

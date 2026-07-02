"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function RiskCenterWidget({ data }: { data: CommandCenterData["risk"] }) {
  const items = [
    { label: "Open Alerts", value: String(data.openAlerts), status: data.openAlerts > 10 ? "critical" as const : data.openAlerts > 0 ? "warning" as const : "healthy" as const },
    { label: "Critical Alerts", value: String(data.criticalAlerts), status: data.criticalAlerts > 0 ? "critical" as const : "healthy" as const },
    { label: "Open Incidents", value: String(data.openIncidents), status: data.openIncidents > 0 ? "warning" as const : "healthy" as const },
    { label: "Policy Violations", value: String(data.policyViolations), status: data.policyViolations > 5 ? "critical" as const : data.policyViolations > 0 ? "warning" as const : "healthy" as const },
    { label: "Suspicious Activity", value: String(data.suspiciousActivity), status: data.suspiciousActivity > 0 ? "warning" as const : "healthy" as const },
  ];

  return (
    <WidgetCard
      title="Risk Center"
      description={data.criticalAlerts > 0 ? `${data.criticalAlerts} critical alerts` : "All clear"}
      status={data.criticalAlerts > 0 ? "critical" : data.openAlerts > 0 ? "warning" : "healthy"}
    >
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg bg-black/20 border border-white/[0.06] px-3 py-2">
            <span className="text-xs text-zinc-400">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{item.value}</span>
              <span className={`h-2 w-2 rounded-full ${
                item.status === "critical" ? "bg-red-500" : item.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
            </div>
          </div>
        ))}
        {data.openAlerts === 0 && data.openIncidents === 0 && data.policyViolations === 0 && (
          <p className="text-xs text-zinc-500 text-center py-2">No active risks detected.</p>
        )}
      </div>
    </WidgetCard>
  );
}

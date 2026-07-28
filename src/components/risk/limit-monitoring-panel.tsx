"use client";

import type { Limit, Escalation } from "./risk-types";

interface LimitMonitoringPanelProps {
  limits: Limit[];
  escalations: Escalation[];
}

export function LimitMonitoringPanel({ limits, escalations }: LimitMonitoringPanelProps) {
  const breached = limits.filter((l) => l.status === "breached" || l.status === "exceeded");
  const approaching = limits.filter((l) => l.status === "approaching-limit");
  const openEsc = escalations.filter((e) => e.status === "open");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Within Limit</p>
          <p className="text-lg font-semibold text-emerald-400">{limits.filter((l) => l.status === "within-limit").length}</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Approaching</p>
          <p className="text-lg font-semibold text-amber-400">{approaching.length}</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Breached</p>
          <p className="text-lg font-semibold text-red-400">{breached.length}</p>
        </div>
      </div>
      {breached.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium text-red-400">Breached Limits</h4>
          <div className="space-y-1">
            {breached.slice(0, 5).map((limit) => (
              <div key={limit.id} className="flex items-center justify-between rounded border border-red-900/50 bg-red-950/20 p-2">
                <div>
                  <p className="text-xs font-medium text-gray-200">{limit.name}</p>
                  <p className="text-[10px] text-gray-500">{limit.type} • {limit.owner}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-red-400">{(limit.currentUtilization / limit.hardLimit * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-gray-500">of ${(limit.hardLimit / 1e6).toFixed(0)}M</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {openEsc.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium text-amber-400">Open Escalations ({openEsc.length})</h4>
          <div className="space-y-1">
            {openEsc.slice(0, 3).map((esc) => (
              <div key={esc.id} className="rounded border border-amber-900/50 bg-amber-950/20 p-2">
                <p className="text-xs text-gray-200">{esc.reason}</p>
                <p className="text-[10px] text-gray-500">Escalated to {esc.escalatedTo} (Level {esc.level})</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
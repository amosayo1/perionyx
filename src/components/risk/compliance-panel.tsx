"use client";

import type { PolicyViolation } from "./risk-types";

interface CompliancePanelProps {
  violations: PolicyViolation[];
  max?: number;
}

export function CompliancePanel({ violations, max = 10 }: CompliancePanelProps) {
  const open = violations.filter((v) => v.status !== "compliant").slice(0, max);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Policy Violations</h3>
        <span className="text-xs text-gray-500">{violations.filter((v) => v.status !== "compliant").length} open</span>
      </div>
      {open.length === 0 ? (
        <p className="text-sm text-gray-500">No open violations</p>
      ) : (
        <div className="space-y-2">
          {open.map((v) => (
            <div key={v.id} className="rounded border border-gray-800 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-200">{v.title}</p>
                <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${
                  v.severity === "critical" ? "bg-red-900/50 text-red-300" :
                  v.severity === "high" ? "bg-orange-900/50 text-orange-300" :
                  "bg-gray-700 text-gray-400"
                }`}>{v.severity}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{v.description}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-600">
                {v.policyRef && <span>Policy: {v.policyRef}</span>}
                <span>Status: {v.status.replace(/-/g, " ")}</span>
                <span>Detected: {v.detectedAt.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
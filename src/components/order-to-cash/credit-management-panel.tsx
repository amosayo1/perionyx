"use client";

import type { CreditProfile } from "./o2c-types";
import { Shield, AlertTriangle, CheckCircle, Lock, Unlock } from "lucide-react";

interface CreditManagementPanelProps {
  profiles: CreditProfile[];
  max?: number;
}

const riskStyles: Record<string, string> = {
  low: "bg-emerald-900/30 text-emerald-400",
  medium: "bg-amber-900/30 text-amber-400",
  high: "bg-orange-900/30 text-orange-400",
  critical: "bg-red-900/30 text-red-400",
};

export function CreditManagementPanel({ profiles, max = 20 }: CreditManagementPanelProps) {
  const displayed = profiles.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Credit Limit</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Utilization</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Available</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Risk Score</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">On Hold</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Decision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((p) => {
            const utilization = p.creditLimit > 0 ? ((p.creditLimit - p.creditAvailable) / p.creditLimit) * 100 : 0;
            return (
              <tr key={p.id} className="hover:bg-gray-800/30">
                <td className="px-3 py-2 text-sm text-gray-200">{p.customerName}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${(p.creditLimit / 1e3).toFixed(0)}K</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-700">
                      <div className={`h-1.5 rounded-full ${utilization > 90 ? "bg-red-500" : utilization > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">{utilization.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${(p.creditAvailable / 1e3).toFixed(0)}K</td>
                <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${riskStyles[p.riskScore] || "bg-gray-700 text-gray-300"}`}>{p.riskScore}</span></td>
                <td className="px-3 py-2">
                  {p.onHold ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-400"><Lock className="h-3 w-3" />Hold</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Unlock className="h-3 w-3" />Active</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-gray-400">{p.decision || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

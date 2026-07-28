"use client";

import type { AccountingPeriod, CloseProcess } from "./accounting-types";
import { Lock, Unlock, FileText } from "lucide-react";

interface PeriodManagementProps {
  periods: AccountingPeriod[];
  closeProcesses: CloseProcess[];
}

const statusStyles: Record<string, string> = {
  open: "bg-emerald-900/50 text-emerald-300",
  "soft-close": "bg-amber-900/50 text-amber-300",
  "hard-close": "bg-red-900/50 text-red-300",
  locked: "bg-gray-700 text-gray-400",
};

export function PeriodManagement({ periods, closeProcesses }: PeriodManagementProps) {
  const sorted = [...periods].sort((a, b) => b.sequence - a.sequence || a.name.localeCompare(b.name));
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24]">
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-200">Period Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Period</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Start</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">End</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Close</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sorted.map((p) => {
              const cp = closeProcesses.find((c) => c.periodId === p.id);
              return (
                <tr key={p.id} className="hover:bg-gray-800/30">
                  <td className="px-3 py-2 text-sm text-gray-200">{p.name}</td>
                  <td className="px-3 py-2 text-xs capitalize text-gray-400">{p.type}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[p.status] || "bg-gray-700 text-gray-300"}`}>
                      {p.status === "locked" ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                      {p.status.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-gray-500">{p.startDate.toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right text-xs text-gray-500">{p.endDate.toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-center">
                    {cp ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] ${cp.status === "completed" ? "text-emerald-400" : cp.status === "failed" ? "text-red-400" : "text-amber-400"}`}>
                        <FileText className="h-2.5 w-2.5" />
                        {cp.status}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

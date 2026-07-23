"use client";

import { FileSignature, Building2, Calendar, Clock, AlertTriangle } from "lucide-react";
import type { Contract } from "./procurement-types";

interface ContractCenterProps {
  contracts: Contract[];
}

const statusStyles: Record<string, { badge: string }> = {
  active: { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50" },
  draft: { badge: "bg-gray-800 text-gray-400 border-gray-700" },
  expired: { badge: "bg-red-950/50 text-red-400 border-red-900/50" },
  terminated: { badge: "bg-gray-800 text-gray-500 border-gray-700" },
  renewed: { badge: "bg-blue-950/50 text-blue-400 border-blue-900/50" },
};

export function ContractCenter({ contracts }: ContractCenterProps) {
  if (contracts.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-8">
        <p className="text-sm text-gray-500">No contracts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-800 bg-[#1a1a1a]">
          <tr className="text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">Contract Number</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Value</th>
            <th className="px-4 py-3 font-medium">Start Date</th>
            <th className="px-4 py-3 font-medium">End Date</th>
            <th className="px-4 py-3 font-medium">Days to Expiry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
          {contracts.map((ctr) => {
            const style = statusStyles[ctr.status] || statusStyles.draft;
            const now = new Date();
            const msToExpiry = ctr.endDate.getTime() - now.getTime();
            const daysToExpiry = Math.max(0, Math.ceil(msToExpiry / 86400000));
            const isExpiringSoon = daysToExpiry > 0 && daysToExpiry <= 30;
            return (
              <tr key={ctr.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{ctr.contractNumber}</td>
                <td className="px-4 py-3 text-xs text-gray-200">{ctr.title}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-300">{ctr.vendorName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    {ctr.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">${(ctr.value / 1000).toFixed(0)}k</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">{ctr.startDate.toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-400">{ctr.endDate.toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {ctr.status === "active" ? (
                    <div className={`flex items-center gap-1.5 ${isExpiringSoon ? "text-red-400" : daysToExpiry <= 60 ? "text-amber-400" : "text-gray-400"}`}>
                      {isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
                      <span className="text-xs font-medium">{daysToExpiry}d</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

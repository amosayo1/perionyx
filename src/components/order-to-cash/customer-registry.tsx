"use client";

import type { Customer } from "./o2c-types";
import { Building2, ShieldAlert, TrendingUp } from "lucide-react";

interface CustomerRegistryProps {
  customers: Customer[];
  max?: number;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-900/50 text-emerald-300",
  inactive: "bg-gray-800 text-gray-500",
  suspended: "bg-red-900/50 text-red-300",
  prospect: "bg-blue-900/50 text-blue-300",
};

const riskStyles: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
  critical: "text-red-400 font-semibold",
};

export function CustomerRegistry({ customers, max = 20 }: CustomerRegistryProps) {
  const displayed = customers.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a24]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Code</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Risk</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Group</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Credit Limit</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Utilization</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((c) => (
            <tr key={c.id} className="hover:bg-gray-800/30">
              <td className="px-3 py-2 text-xs font-medium text-gray-200">{c.code}</td>
              <td className="px-3 py-2 text-sm text-gray-200">{c.name}</td>
              <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[c.status] || "bg-gray-700 text-gray-300"}`}>{c.status}</span></td>
              <td className="px-3 py-2"><span className={`text-xs ${riskStyles[c.riskRating] || "text-gray-400"}`}>{c.riskRating}</span></td>
              <td className="px-3 py-2 text-xs text-gray-400">{c.group || "—"}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${(c.creditLimit / 1e3).toFixed(0)}K</td>
              <td className="px-3 py-2 text-right text-sm text-gray-200">${(c.creditUtilization / 1e3).toFixed(0)}K</td>
              <td className="px-3 py-2 text-right text-sm text-emerald-400">${(c.totalRevenue / 1e3).toFixed(0)}K</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

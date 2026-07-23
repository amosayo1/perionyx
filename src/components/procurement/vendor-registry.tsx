"use client";

import { Building2, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Vendor } from "./procurement-types";

interface VendorRegistryProps {
  vendors: Vendor[];
}

const statusStyles: Record<string, { badge: string; dot: string }> = {
  active: { badge: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50", dot: "bg-emerald-500" },
  blocked: { badge: "bg-red-950/50 text-red-400 border-red-900/50", dot: "bg-red-500" },
  pending: { badge: "bg-amber-950/50 text-amber-400 border-amber-900/50", dot: "bg-amber-500" },
  inactive: { badge: "bg-gray-800 text-gray-400 border-gray-700", dot: "bg-gray-500" },
  suspended: { badge: "bg-red-950/50 text-red-400 border-red-900/50", dot: "bg-red-500" },
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400", critical: "text-red-500",
};

export function VendorRegistry({ vendors }: VendorRegistryProps) {
  if (vendors.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-8">
        <p className="text-sm text-gray-500">No vendors found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-800 bg-[#1a1a1a]">
          <tr className="text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Risk Level</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Preferred</th>
            <th className="px-4 py-3 font-medium text-right">Total Spend</th>
            <th className="px-4 py-3 font-medium text-right">Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
          {vendors.map((vendor) => {
            const style = statusStyles[vendor.status] || statusStyles.inactive;
            return (
              <tr key={vendor.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{vendor.code}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-200">{vendor.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {vendor.status}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs font-medium ${riskColors[vendor.riskLevel] || "text-gray-400"}`}>{vendor.riskLevel}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{vendor.category.replace("-", " ")}</td>
                <td className="px-4 py-3">
                  {vendor.preferred ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-900/50 bg-amber-950/50 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                      <Star className="h-3 w-3" /> Preferred
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">${(vendor.totalSpend / 1000).toFixed(0)}k</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-xs font-semibold ${vendor.rating >= 80 ? "text-emerald-400" : vendor.rating >= 50 ? "text-amber-400" : "text-red-400"}`}>{vendor.rating}</span>
                    {vendor.rating >= 80 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : vendor.rating >= 50 ? <Minus className="h-3 w-3 text-amber-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

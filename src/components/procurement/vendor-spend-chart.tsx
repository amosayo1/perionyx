"use client";

import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import type { SpendAnalytic } from "./procurement-types";

interface VendorSpendChartProps {
  analytics: SpendAnalytic[];
  totalSpend: number;
}

export function VendorSpendChart({ analytics, totalSpend }: VendorSpendChartProps) {
  const vendorData = analytics.filter((a) => a.dimension === "vendor");

  if (vendorData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-6">
        <p className="text-xs text-gray-500">No vendor spend data available</p>
      </div>
    );
  }

  const sorted = [...vendorData].sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-200">Vendor Spend</h3>
      <div className="space-y-2">
        {sorted.map((item) => {
          const pctOfTotal = totalSpend > 0 ? (item.totalSpend / totalSpend) * 100 : 0;
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-800 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-200 truncate">{item.dimensionValue}</span>
                  <span className="font-mono text-sm font-semibold text-gray-200">${(item.totalSpend / 1000).toFixed(0)}k</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-800">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(pctOfTotal, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{item.totalOrders} orders · {pctOfTotal.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

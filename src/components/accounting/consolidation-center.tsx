"use client";

import type { Consolidation } from "./accounting-types";
import { Building2, CheckCircle, FileText, BarChart3 } from "lucide-react";

interface ConsolidationCenterProps {
  consolidations: Consolidation[];
}

export function ConsolidationCenter({ consolidations }: ConsolidationCenterProps) {
  const sorted = [...consolidations].sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime());
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-200">Consolidation Center</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">No consolidations</div>
        ) : (
          sorted.slice(0, 10).map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{c.parentCompanyId} → {c.childCompanyId}</p>
                  <p className="text-xs text-gray-500">{c.method} consolidation • {c.ownershipPercent}% ownership</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Minority Interest</p>
                  <p className="text-sm text-gray-200">${c.minorityInterest.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.status === "posted" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : c.status === "calculated" || c.status === "reviewed" ? (
                    <FileText className="h-4 w-4 text-amber-400" />
                  ) : (
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-xs text-gray-500">{c.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

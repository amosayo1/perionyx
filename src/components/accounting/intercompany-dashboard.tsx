"use client";

import type { IntercompanyJournal } from "./accounting-types";
import { ArrowRightLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface IntercompanyDashboardProps {
  journals: IntercompanyJournal[];
}

export function IntercompanyDashboard({ journals }: IntercompanyDashboardProps) {
  const unsettled = journals.filter((j) => j.status !== "settled");
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24]">
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-200">Intercompany Dashboard</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {journals.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">No intercompany journals</div>
        ) : (
          journals.slice(0, 10).map((j) => (
            <div key={j.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
              <div className="flex items-center gap-3">
                {j.status === "settled" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : j.status === "posted" ? (
                  <Clock className="h-4 w-4 text-amber-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                )}
                <ArrowRightLeft className="h-3 w-3 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{j.fromCompanyId} → {j.toCompanyId}</p>
                  <p className="text-xs text-gray-500">{j.type.replace(/-/g, " ")} • {j.description.slice(0, 40)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-200">${j.totalAmount.toLocaleString()}</p>
                <p className={`text-xs ${j.status === "settled" ? "text-emerald-400" : j.status === "posted" ? "text-amber-400" : "text-gray-500"}`}>{j.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import type { VendorPerformance } from "./procurement-types";

interface VendorPerformanceDashboardProps {
  performances: VendorPerformance[];
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const color = value >= 90 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-xs font-medium ${value >= 90 ? "text-emerald-400" : value >= 70 ? "text-amber-400" : "text-red-400"}`}>{value}{label === "Response Time" ? "h" : "%"}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export function VendorPerformanceDashboard({ performances }: VendorPerformanceDashboardProps) {
  if (performances.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-8">
        <p className="text-sm text-gray-500">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {performances.map((perf) => {
        const overallColor = perf.overallScore >= 90 ? "text-emerald-400" : perf.overallScore >= 70 ? "text-amber-400" : "text-red-400";
        const overallBarColor = perf.overallScore >= 90 ? "bg-emerald-500" : perf.overallScore >= 70 ? "bg-amber-500" : "bg-red-500";
        return (
          <div key={perf.id} className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">Vendor Performance</p>
                <p className="text-xs text-gray-500">{perf.period} · {perf.totalOrders} orders</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${overallColor}`}>{perf.overallScore}</p>
                <p className="text-[10px] text-gray-500">Overall</p>
              </div>
            </div>
            <div className="mb-3 h-2 rounded-full bg-gray-800">
              <div className={`h-2 rounded-full ${overallBarColor}`} style={{ width: `${perf.overallScore}%` }} />
            </div>
            <div className="space-y-2.5">
              <ScoreBar value={perf.onTimeDelivery} label="On-Time Delivery" />
              <ScoreBar value={perf.qualityScore} label="Quality Score" />
              <ScoreBar value={100 - Math.min(perf.responseTime * 2, 100)} label="Response Time" />
              <ScoreBar value={perf.invoiceAccuracy} label="Invoice Accuracy" />
              <ScoreBar value={100 - perf.returnRate * 10} label="Return Rate" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

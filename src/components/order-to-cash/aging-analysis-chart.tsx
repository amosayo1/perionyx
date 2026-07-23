"use client";

import { Clock, BarChart3 } from "lucide-react";

interface AgingBucketData {
  bucket: string;
  count: number;
  totalAmount: number;
  percentOfTotal: number;
}

interface AgingAnalysisChartProps {
  data: AgingBucketData[];
}

const bucketColors: Record<string, string> = {
  current: "bg-emerald-500",
  "1-30": "bg-blue-500",
  "31-60": "bg-amber-500",
  "61-90": "bg-orange-500",
  "90+": "bg-red-500",
};

const bucketBgColors: Record<string, string> = {
  current: "bg-emerald-500/10",
  "1-30": "bg-blue-500/10",
  "31-60": "bg-amber-500/10",
  "61-90": "bg-orange-500/10",
  "90+": "bg-red-500/10",
};

export function AgingAnalysisChart({ data }: AgingAnalysisChartProps) {
  const total = data.reduce((sum, d) => sum + d.totalAmount, 0);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Aging Analysis</h3>
      </div>
      <div className="mb-3 flex h-8 items-end gap-0.5">
        {data.map((d) => {
          const pct = total > 0 ? (d.totalAmount / total) * 100 : 0;
          return (
            <div key={d.bucket} className="flex flex-1 flex-col items-center">
              <div
                className={`w-full rounded-t ${bucketColors[d.bucket] || "bg-gray-600"}`}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.bucket} className={`rounded-lg border border-gray-800 p-3 ${bucketBgColors[d.bucket] || ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${bucketColors[d.bucket] || "bg-gray-600"}`} />
                <span className="text-sm font-medium text-gray-200">{d.bucket}</span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs text-gray-500">Count</p>
                  <p className="text-sm text-gray-200">{d.count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm text-gray-200">${(d.totalAmount / 1e3).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">% of Total</p>
                  <p className="text-sm font-medium text-gray-200">{d.percentOfTotal.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-gray-700">
              <div className={`h-1.5 rounded-full ${bucketColors[d.bucket] || "bg-gray-600"}`} style={{ width: `${d.percentOfTotal}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { BarChart3, DollarSign } from "lucide-react";

interface CashCollectionPeriod {
  period: string;
  invoiced: number;
  collected: number;
  outstanding: number;
}

interface CashCollectionChartProps {
  data: CashCollectionPeriod[];
  max?: number;
}

export function CashCollectionChart({ data, max = 12 }: CashCollectionChartProps) {
  const displayed = data.slice(0, max);
  const maxValue = Math.max(...displayed.map((d) => Math.max(d.invoiced, d.collected, d.outstanding)), 1);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Cash Collection</h3>
      </div>
      <div className="mb-2 flex items-center gap-4 rounded-lg border border-gray-800 p-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500" />Invoiced</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" />Collected</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-500" />Outstanding</span>
      </div>
      <div className="space-y-3">
        {displayed.map((d) => {
          const invoicedWidth = (d.invoiced / maxValue) * 100;
          const collectedWidth = (d.collected / maxValue) * 100;
          const outstandingWidth = (d.outstanding / maxValue) * 100;
          const collectionRate = d.invoiced > 0 ? (d.collected / d.invoiced) * 100 : 0;
          return (
            <div key={d.period}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">{d.period}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-200">${(d.invoiced / 1e6).toFixed(1)}M</span>
                  <span className={`text-xs ${collectionRate >= 90 ? "text-emerald-400" : collectionRate >= 70 ? "text-amber-400" : "text-red-400"}`}>
                    {collectionRate.toFixed(0)}% collected
                  </span>
                </div>
              </div>
              <div className="relative h-7">
                <div className="absolute bottom-0 left-0 h-2 rounded bg-blue-500/60" style={{ width: `${invoicedWidth}%` }} />
                <div className="absolute bottom-2.5 left-0 h-2 rounded bg-emerald-500/80" style={{ width: `${collectedWidth}%` }} />
                <div className="absolute bottom-5 left-0 h-2 rounded bg-amber-500/60" style={{ width: `${outstandingWidth}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

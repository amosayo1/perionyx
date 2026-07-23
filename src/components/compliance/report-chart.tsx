"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface CategoryData {
  category: string;
  compliant: number;
  nonCompliant: number;
  notAssessed: number;
}

const CATEGORY_COLORS = ["#d4af37", "#60a5fa", "#f59e0b", "#6ee7b7", "#a78bfa", "#f472b6"];

export const ReportChart = memo(function ReportChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12">
        <p className="text-sm text-zinc-500">No report data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.compliant + d.nonCompliant + d.notAssessed), 1);
  const chartH = 200;

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <svg viewBox={`0 0 ${data.length * 80 + 60} ${chartH + 60}`} className="w-full" style={{ height: chartH + 60 }}>
        <text x="10" y="15" className="text-[11px]" fill="rgb(113 113 122)">Count</text>

        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = chartH - (f * chartH) + 10;
          return (
            <g key={i}>
              <line x1="40" y1={y} x2={data.length * 80 + 40} y2={y} stroke="rgb(39 39 42)" strokeWidth="0.5" />
              <text x="35" y={y + 3} textAnchor="end" className="text-[10px]" fill="rgb(113 113 122)">
                {Math.round(f * maxVal)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = 50 + i * 80;
          const barW = 60;
          const cH = (d.compliant / maxVal) * chartH;
          const ncH = (d.nonCompliant / maxVal) * chartH;
          const naH = (d.notAssessed / maxVal) * chartH;
          const totalH = cH + ncH + naH;
          const yBase = chartH + 10 - totalH;

          return (
            <g key={d.category}>
              <rect x={x} y={yBase} width={barW} height={cH} fill="#10b981" rx="2" opacity={0.8} />
              <rect x={x} y={yBase + cH} width={barW} height={ncH} fill="#ef4444" rx="2" opacity={0.8} />
              <rect x={x} y={yBase + cH + ncH} width={barW} height={naH} fill="#a1a1aa" rx="2" opacity={0.8} />
              <text x={x + barW / 2} y={chartH + 28} textAnchor="middle" className="text-[10px]" fill="rgb(161 161 170)">
                {d.category.length > 8 ? d.category.slice(0, 8) + "…" : d.category}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[11px] text-zinc-500">Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span className="text-[11px] text-zinc-500">Non-Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-zinc-400" />
          <span className="text-[11px] text-zinc-500">Not Assessed</span>
        </div>
      </div>
    </div>
  );
});

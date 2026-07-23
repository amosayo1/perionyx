"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA } from "./data";

export function RiskScoreChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.riskScore;
  const maxVal = 100;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">Risk Score</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Monthly risk score trend</p>
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end">
          {data.map((point) => {
            const height = Math.max(8, (point.value / maxVal) * 160);
            const color = point.value > 70
              ? "from-red-500/60 to-red-500/30"
              : point.value > 40
                ? "from-amber-500/60 to-amber-500/30"
                : "from-emerald-500/60 to-emerald-500/30";
            const hover = point.value > 70
              ? "hover:from-red-500/80 hover:to-red-500/50"
              : point.value > 40
                ? "hover:from-amber-500/80 hover:to-amber-500/50"
                : "hover:from-emerald-500/80 hover:to-emerald-500/50";
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">{point.value}</span>
                <div
                  className={`w-full mx-0.5 rounded-t bg-gradient-to-t ${color} transition-all ${hover}`}
                  style={{ height: `${height}px` }}
                  role="img"
                  aria-label={`${point.label}: ${point.value}/100`}
                />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

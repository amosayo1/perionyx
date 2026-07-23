"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA } from "./data";

export function PolicyBreachChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.policyBreach;
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">Policy Breaches</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Monthly breach count</p>
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end">
          {data.map((point) => {
            const height = maxVal > 0 ? Math.max(8, (point.value / maxVal) * 160) : 8;
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-red-400 font-medium">{point.value}</span>
                <div
                  className="w-full mx-0.5 rounded-t bg-gradient-to-t from-red-500/60 to-red-500/30 transition-all hover:from-red-500/80 hover:to-red-500/50"
                  style={{ height: `${height}px` }}
                  role="img"
                  aria-label={`${point.label}: ${point.value} breaches`}
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

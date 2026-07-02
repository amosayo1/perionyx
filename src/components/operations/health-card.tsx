"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { HealthMetric } from "./types";

const colorMap: Record<string, string> = {
  emerald: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  zinc: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColorMap: Record<string, string> = {
  up: "text-[#d4af37]",
  down: "text-red-400",
  neutral: "text-zinc-500",
};

export function HealthCard({ metric }: { metric: HealthMetric }) {
  const TrendIcon = trendIconMap[metric.trend];

  return (
    <Link
      href={metric.href}
      className="group block rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-zinc-500 font-medium">{metric.title}</p>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
            trendColorMap[metric.trend],
            colorMap[metric.color],
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {metric.trendLabel}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {metric.value}
        </span>

        {/* Mini sparkline (simplified bar representation) */}
        <div className="flex items-end gap-[2px] h-8">
          {metric.sparklineData.map((point, i) => {
            const max = Math.max(...metric.sparklineData, 1);
            const h = Math.max((point / max) * 28, 4);
            return (
              <div
                key={i}
                className={cn(
                  "w-[3px] rounded-full transition-all duration-300 group-hover:opacity-80",
                  metric.color === "emerald" && "bg-[#d4af37]/40",
                  metric.color === "amber" && "bg-amber-500/40",
                  metric.color === "red" && "bg-red-500/40",
                  metric.color === "blue" && "bg-blue-500/40",
                  metric.color === "zinc" && "bg-zinc-600/40",
                  i === metric.sparklineData.length - 1 && "opacity-80",
                )}
                style={{ height: h }}
              />
            );
          })}
        </div>
      </div>
    </Link>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Globe } from "lucide-react";
import type { Region } from "./types";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors: Record<string, string> = { up: "text-red-400", down: "text-[#d4af37]", neutral: "text-zinc-500" };
const riskColors: Record<string, string> = {
  low: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function RegionCard({ region }: { region: Region }) {
  const TrendIcon = trendIcons[region.trend];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-white">{region.name}</span>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", riskColors[region.riskLevel])}>
          {region.riskScore}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-zinc-600">Volume</span><p className="text-zinc-300 font-medium">{region.transactionVolume}</p></div>
        <div><span className="text-zinc-600">Exceptions</span><p className="text-zinc-300 font-medium">{region.policyExceptions}</p></div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <TrendIcon className={cn("h-3 w-3", trendColors[region.trend])} />
        <span className={cn("text-[11px] font-medium", trendColors[region.trend])}>{region.trendLabel}</span>
      </div>
    </div>
  );
}

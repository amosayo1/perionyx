"use client";

import { cn } from "@/lib/utils";
import { MOCK_REGION_LIQUIDITY } from "./data";

export function FundingGapChart({ className }: { className?: string }) {
  const withGaps = MOCK_REGION_LIQUIDITY.filter((r) => r.fundingNeed > 0).sort((a, b) => b.fundingNeed - a.fundingNeed);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Funding Gaps by Region</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Regions with outstanding funding needs</p>
      <div className="space-y-3">
        {withGaps.map((r) => {
          const maxNeed = Math.max(...withGaps.map((x) => x.fundingNeed));
          const w = maxNeed > 0 ? (r.fundingNeed / maxNeed) * 100 : 0;
          return (
            <div key={r.region}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-zinc-300">{r.region}</span>
                <span className="text-red-400 font-medium">{fmt(r.fundingNeed)}</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500/70 to-amber-500/50" style={{ width: `${w}%` }} role="progressbar" aria-valuenow={w} aria-valuemin={0} aria-valuemax={100} />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                <span>Coverage: {r.coverageDays}d</span>
                <span>Score: {r.liquidityScore}</span>
              </div>
            </div>
          );
        })}
        {withGaps.length === 0 && <p className="text-zinc-500 text-[13px] py-4 text-center">No funding gaps detected</p>}
      </div>
    </div>
  );
}

function fmt(v: number): string { return v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`; }

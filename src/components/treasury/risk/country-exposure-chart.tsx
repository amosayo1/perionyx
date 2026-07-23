"use client";

import { cn } from "@/lib/utils";
import { MOCK_COUNTRY_RISK } from "./data";

export function CountryExposureChart({ className }: { className?: string }) {
  const sorted = [...MOCK_COUNTRY_RISK].sort((a, b) => b.compositeScore - a.compositeScore);
  const maxExposure = Math.max(...sorted.map((c) => c.exposure));

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">Country Exposure</h3>
      <p className="mb-4 text-[12px] text-zinc-500">By composite risk score</p>
      <div className="space-y-2">
        {sorted.map((c) => {
          const pct = maxExposure > 0 ? (c.exposure / maxExposure) * 100 : 0;
          const barColor = c.riskLevel === "low"
            ? "bg-emerald-500/60"
            : c.riskLevel === "medium"
              ? "bg-amber-500/60"
              : c.riskLevel === "high"
                ? "bg-orange-500/60"
                : "bg-red-500/60";
          return (
            <div key={c.id}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 truncate max-w-[160px]">{c.country}</span>
                  <span className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded",
                    c.riskLevel === "low" && "text-emerald-400 bg-emerald-500/10",
                    c.riskLevel === "medium" && "text-amber-400 bg-amber-500/10",
                    c.riskLevel === "high" && "text-orange-400 bg-orange-500/10",
                    c.riskLevel === "critical" && "text-red-400 bg-red-500/10",
                  )}>{c.compositeScore}</span>
                </div>
                <span className="text-white font-medium">{fmt(c.exposure)}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.country}: ${fmt(c.exposure)}, risk score ${c.compositeScore}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

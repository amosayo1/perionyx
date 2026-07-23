"use client";

import { cn } from "@/lib/utils";
import { MOCK_COUNTERPARTY_RISK } from "./data";

export function CounterpartyChart({ className }: { className?: string }) {
  const sorted = [...MOCK_COUNTERPARTY_RISK].sort((a, b) => b.exposure - a.exposure);
  const maxExposure = sorted[0]?.exposure ?? 1;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)} dir="ltr">
      <h3 className="text-sm font-medium text-white">Counterparty Exposure</h3>
      <p className="mb-4 text-[12px] text-zinc-500">By total exposure</p>
      <div className="space-y-2">
        {sorted.map((c) => {
          const pct = (c.exposure / maxExposure) * 100;
          const barColor = c.health === "healthy"
            ? "bg-emerald-500/60"
            : c.health === "watch"
              ? "bg-amber-500/60"
              : "bg-red-500/60";
          return (
            <div key={c.id}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 truncate max-w-[200px]">{c.counterparty}</span>
                  <span className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded",
                    c.health === "healthy" && "text-emerald-400 bg-emerald-500/10",
                    c.health === "watch" && "text-amber-400 bg-amber-500/10",
                    c.health === "critical" && "text-red-400 bg-red-500/10",
                  )}>{c.utilization}%</span>
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
                  aria-label={`${c.counterparty}: ${fmt(c.exposure)}`}
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

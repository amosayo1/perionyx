"use client";

import { cn } from "@/lib/utils";
import { MOCK_REGION_LIQUIDITY } from "./data";

export function CurrencyExposureChart({ className }: { className?: string }) {
  const currencies = [
    { currency: "USD", amount: 380000000, limit: 500000000, pct: 76 },
    { currency: "AED", amount: 165000000, limit: 220000000, pct: 75 },
    { currency: "EUR", amount: 95000000, limit: 150000000, pct: 63 },
    { currency: "GBP", amount: 62000000, limit: 100000000, pct: 62 },
    { currency: "ZAR", amount: 52750000, limit: 80000000, pct: 66 },
    { currency: "SGD", amount: 50000000, limit: 80000000, pct: 63 },
  ].sort((a, b) => b.amount - a.amount);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Currency Exposure vs Limits</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Top currencies by exposure relative to policy limits</p>
      <div className="space-y-3">
        {currencies.map((c) => (
          <div key={c.currency}>
            <div className="flex items-center justify-between text-[13px] mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{c.currency}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-300">{fmt(c.amount)}</span>
                <span className={cn("w-12 text-right font-medium", c.pct >= 80 ? "text-red-400" : c.pct >= 65 ? "text-amber-400" : "text-emerald-400")}>
                  {c.pct}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 relative">
              <div className={cn("h-full rounded-full", c.pct >= 80 ? "bg-red-500/60" : c.pct >= 65 ? "bg-amber-500/60" : "bg-emerald-500/60")}
                style={{ width: `${c.pct}%` }} role="progressbar" aria-valuenow={c.pct} aria-valuemin={0} aria-valuemax={100} />
              <div className="absolute right-0 top-0 h-full w-0.5 bg-white/30" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-zinc-500 text-center">White line = 100% of policy limit</p>
    </div>
  );
}

function fmt(v: number): string { return v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`; }

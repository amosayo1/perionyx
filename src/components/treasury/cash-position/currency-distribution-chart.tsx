"use client";

import { cn } from "@/lib/utils";
import { MOCK_CURRENCY_POSITIONS } from "./data";

interface CurrencyDistributionChartProps {
  className?: string;
}

export function CurrencyDistributionChart({ className }: CurrencyDistributionChartProps) {
  const topCurrencies = MOCK_CURRENCY_POSITIONS.slice(0, 6);
  const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-cyan-500", "bg-red-500"];

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Currency Distribution</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Top currencies by total balance</p>

      <div className="space-y-3">
        {topCurrencies.map((cur, i) => (
          <div key={cur.currency}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", colors[i])} />
                <span className="text-zinc-300">{cur.currency}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{formatCurrency(cur.balance, cur.currency)}</span>
                <span className="text-zinc-500 w-10 text-right">{cur.percentageOfTotal.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-800">
              <div
                className={cn("h-full rounded-full transition-all", colors[i].replace("bg-", "bg-").replace("-500", "-500/70"))}
                style={{ width: `${cur.percentageOfTotal}%` }}
                role="progressbar"
                aria-valuenow={cur.percentageOfTotal}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${cur.currency}: ${cur.percentageOfTotal.toFixed(1)}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", AED: "د.إ", ZAR: "R", JPY: "¥", CHF: "CHF", SGD: "S$", CAD: "C$", AUD: "A$" };
  const sym = symbols[currency] ?? currency + " ";
  if (value >= 1_000_000_000) return `${sym}${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`;
  return `${sym}${(value / 1_000).toFixed(0)}K`;
}

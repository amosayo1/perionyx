"use client";

import { cn } from "@/lib/utils";
import type { CurrencyHolding } from "@/server/banking/workspace";

interface CurrencyDistributionProps {
  currencies: CurrencyHolding[];
  className?: string;
}

export function CurrencyDistribution({ currencies, className }: CurrencyDistributionProps) {
  const total = currencies.reduce((s, c) => s + c.percentage, 0);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/40 p-5", className)}>
      <p className="text-[13px] font-medium text-white">Currency Distribution</p>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full">
        {currencies.map((c) => {
          const hue = c.currency === "USD" ? 160 : c.currency === "EUR" ? 220 : c.currency === "GBP" ? 280 : c.currency === "AED" ? 40 : c.currency === "SGD" ? 350 : 0;
          return (
            <div
              key={c.currency}
              className="transition-all"
              style={{
                width: `${(c.percentage / total) * 100}%`,
                backgroundColor: `hsl(${hue}, 50%, 50%)`,
              }}
              title={`${c.currency}: ${c.percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {currencies.map((c) => {
          const hue = c.currency === "USD" ? 160 : c.currency === "EUR" ? 220 : c.currency === "GBP" ? 280 : c.currency === "AED" ? 40 : c.currency === "SGD" ? 350 : 0;
          return (
            <div key={c.currency} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${hue}, 50%, 50%)` }} />
                <span className="font-medium text-zinc-300">{c.currency}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  {c.amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </span>
                <span className="w-12 text-right text-zinc-500">{c.percentage.toFixed(1)}%</span>
                <span className={cn("w-12 text-right", c.change.startsWith("+") ? "text-emerald-400" : "text-red-400")}>
                  {c.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
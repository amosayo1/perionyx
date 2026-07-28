"use client";

import { cn } from "@/lib/utils";
import type { LiquiditySummary, CurrencyHolding } from "@/server/banking/workspace";

interface LiquidityOverviewProps {
  liquidity: LiquiditySummary;
  className?: string;
}

export function LiquidityOverview({ liquidity, className }: LiquidityOverviewProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-5">
        <p className="text-[13px] font-medium text-white">Available Liquidity</p>
        <p className="mt-1 text-[24px] font-bold text-emerald-400">
          {liquidity.availableLiquidity.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-zinc-800/30 p-3">
            <p className="text-[11px] text-zinc-500">Restricted</p>
            <p className="text-[14px] font-semibold text-amber-400">
              {liquidity.restrictedCash.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-md bg-zinc-800/30 p-3">
            <p className="text-[11px] text-zinc-500">Investment</p>
            <p className="text-[14px] font-semibold text-blue-400">
              {liquidity.investmentCash.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        {liquidity.forecast && (
          <div className="mt-3 flex items-center gap-2 text-[12px]">
            <span className="text-zinc-500">30-day forecast:</span>
            <span className="font-medium text-emerald-400">
              {liquidity.forecast.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-5">
        <p className="text-[13px] font-medium text-white">By Currency</p>
        <div className="mt-4 space-y-2.5">
          {liquidity.byCurrency.map((c) => (
            <CurrencyBar key={c.currency} currency={c} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-5">
        <p className="text-[13px] font-medium text-white">By Region</p>
        <div className="mt-4 space-y-2.5">
          {liquidity.byRegion.map((r) => (
            <div key={r.region}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-zinc-300">{r.region}</span>
                <span className="font-medium text-white">{r.percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-5">
        <p className="text-[13px] font-medium text-white">By Legal Entity</p>
        <div className="mt-4 space-y-2.5">
          {liquidity.byLegalEntity.map((e) => (
            <div key={e.entity}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-zinc-300">{e.entity}</span>
                <span className="font-medium text-white">
                  {e.amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${e.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CurrencyBar({ currency }: { currency: CurrencyHolding }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-[12px] font-medium text-zinc-300">{currency.currency}</span>
      <div className="flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gold"
            style={{ width: `${currency.percentage}%` }}
          />
        </div>
      </div>
      <span className="w-24 text-right text-[12px] text-zinc-400">
        {currency.amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
      </span>
      <span
        className={cn(
          "w-14 text-right text-[11px]",
          currency.change.startsWith("+") ? "text-emerald-400" : "text-red-400",
        )}
      >
        {currency.change}
      </span>
    </div>
  );
}
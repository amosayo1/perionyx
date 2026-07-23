"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_CURRENCY_POSITIONS } from "./data";

interface CurrencyPositionTableProps {
  className?: string;
}

export function CurrencyPositionTable({ className }: CurrencyPositionTableProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Currency Position Summary</h3>
        <p className="text-[12px] text-zinc-500">Per-currency cash, exposure, and FX risk</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Currency positions">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Currency</th>
              <th className="px-5 py-3 text-right font-medium">Balance</th>
              <th className="px-5 py-3 text-right font-medium">Functional</th>
              <th className="px-5 py-3 text-right font-medium">Reporting</th>
              <th className="px-5 py-3 text-right font-medium">FX Exposure</th>
              <th className="px-5 py-3 text-right font-medium">FX Risk</th>
              <th className="px-5 py-3 text-right font-medium">% of Total</th>
              <th className="px-5 py-3 text-right font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CURRENCY_POSITIONS.map((cur) => (
              <tr key={cur.currency} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                <td className="px-5 py-3 font-medium text-white">{cur.currency}</td>
                <td className="px-5 py-3 text-right text-white">{formatCurrency(cur.balance, cur.currency)}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{formatCurrency(cur.functionalAmount, "USD")}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{formatCurrency(cur.reportingAmount, "USD")}</td>
                <td className="px-5 py-3 text-right">
                  <span className={cn(
                    cur.exposure > 0 ? "text-amber-400" : "text-zinc-400",
                  )}>
                    {formatCurrency(cur.exposure, "USD")}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    cur.fxRisk === "low" ? "bg-emerald-500/10 text-emerald-400" :
                    cur.fxRisk === "medium" ? "bg-amber-500/10 text-amber-400" :
                    "bg-red-500/10 text-red-400",
                  )}>
                    {cur.fxRisk}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-zinc-400">{cur.percentageOfTotal.toFixed(1)}%</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {cur.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    ) : cur.trend === "down" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-zinc-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", AED: "د.إ", ZAR: "R", JPY: "¥", CHF: "CHF", SGD: "S$", CAD: "C$", AUD: "A$" };
  const sym = symbols[currency] ?? currency + " ";
  if (value >= 1_000_000_000) return `${sym}${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${sym}${(value / 1_000).toFixed(1)}K`;
  return `${sym}${value.toFixed(0)}`;
}

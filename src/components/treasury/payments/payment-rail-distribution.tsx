"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { MOCK_PAYMENT_RAILS } from "./data";
import type { PaymentRail } from "./types";
import { ArrowUpDown, Zap, Route } from "lucide-react";

const RAIL_TYPE_STYLES: Record<PaymentRail["type"], string> = {
  domestic: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cross_border: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  instant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  internal: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(value: number): string {
  return value.toLocaleString("en-US");
}

function formatSettlement(minutes: number): string {
  if (minutes === 0) return "Instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours}h`;
}

function getSuccessRateColor(rate: number): string {
  if (rate >= 99) return "text-emerald-400";
  if (rate >= 98) return "text-amber-400";
  return "text-red-400";
}

export function PaymentRailDistribution({ className }: { className?: string }) {
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...MOCK_PAYMENT_RAILS].sort((a, b) => b.volume - a.volume),
    [],
  );

  const visible = showAll ? sorted : sorted.slice(0, 8);
  const totalVolume = sorted.reduce((s, r) => s + r.volume, 0);
  const totalValue = sorted.reduce((s, r) => s + r.value, 0);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-[#c9a84c]" />
          <h3 className="text-sm font-semibold text-white">Payment Rail Distribution</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>Volume: {formatVolume(totalVolume)}</span>
          <span>Value: {formatCurrency(totalValue)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Payment rail distribution">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">
                <div className="flex items-center gap-1">
                  Rail Name <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Volume</th>
              <th className="px-4 py-3 text-right font-medium">Value</th>
              <th className="px-4 py-3 text-right font-medium">Avg Settlement</th>
              <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
              <th className="px-4 py-3 text-right font-medium">Success Rate</th>
              <th className="px-4 py-3 text-left font-medium">Currencies</th>
              <th className="px-4 py-3 text-left font-medium">Regions</th>
              <th className="px-4 py-3 text-right font-medium">Max</th>
              <th className="px-4 py-3 text-right font-medium">Min</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rail) => (
              <tr
                key={rail.id}
                className="border-b border-white/[0.06] text-sm transition-colors hover:bg-white/[0.02] last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-white">{rail.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{rail.code}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                      RAIL_TYPE_STYLES[rail.type],
                    )}
                  >
                    {rail.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-200">
                  {formatVolume(rail.volume)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-white">
                  {formatCurrency(rail.value)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                  {formatSettlement(rail.averageSettlementMinutes)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-200">
                  {rail.averageCost === 0 ? (
                    <span className="text-zinc-600">Free</span>
                  ) : (
                    formatCurrency(rail.averageCost)
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      getSuccessRateColor(rail.successRate),
                    )}
                  >
                    {rail.successRate}%
                  </span>
                </td>
                <td className="max-w-[140px] truncate px-4 py-3 text-xs text-zinc-400">
                  {rail.supportedCurrencies.length === 1 && rail.supportedCurrencies[0] === "ALL"
                    ? "All"
                    : rail.supportedCurrencies.join(", ")}
                </td>
                <td className="max-w-[120px] truncate px-4 py-3 text-xs text-zinc-400">
                  {rail.supportedRegions.join(", ")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                  {rail.maxAmount >= 999999999 ? (
                    <span className="text-zinc-600">Unlimited</span>
                  ) : (
                    formatCurrency(rail.maxAmount)
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                  {rail.minAmount === 0
                    ? "$0"
                    : formatCurrency(rail.minAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && sorted.length > 8 && (
        <button
          onClick={() => setShowAll(true)}
          className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] px-5 py-3 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.02] hover:text-white"
        >
          <Zap className="h-3.5 w-3.5" />
          View All {sorted.length} Rails
        </button>
      )}
    </div>
  );
}

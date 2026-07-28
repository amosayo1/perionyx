"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { MOCK_ROUTES } from "./data";
import { ArrowUpDown, Globe } from "lucide-react";

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getRiskColor(score: number): string {
  if (score <= 5) return "text-emerald-400";
  if (score <= 10) return "text-amber-400";
  return "text-red-400";
}

function getRiskBg(score: number): string {
  if (score <= 5) return "bg-emerald-500/10";
  if (score <= 10) return "bg-amber-500/10";
  return "bg-red-500/10";
}

function formatTime(minutes: number): string {
  if (minutes === 0) return "Instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours}h`;
}

export function PaymentRoutingMatrix({ className }: { className?: string }) {
  const sorted = useMemo(
    () => [...MOCK_ROUTES].sort((a, b) => a.currency.localeCompare(b.currency)),
    [],
  );

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-gold" />
          <h3 className="text-sm font-semibold text-white">Payment Routing Matrix</h3>
          <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
            {sorted.length} routes
          </span>
        </div>
        <span className="text-xs text-zinc-500">Sorted by currency</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Payment routing advice matrix">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">
                <div className="flex items-center gap-1">
                  Currency <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium">Country</th>
              <th className="px-4 py-3 text-left font-medium">Preferred Rail</th>
              <th className="px-4 py-3 text-left font-medium">Fallback Rail</th>
              <th className="px-4 py-3 text-right font-medium">Avg Time</th>
              <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
              <th className="px-4 py-3 text-center font-medium">Risk Score</th>
              <th className="px-4 py-3 text-left font-medium">Provider</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((route) => (
              <tr
                key={route.id}
                className="border-b border-white/[0.06] text-sm transition-colors hover:bg-white/[0.02] last:border-b-0"
              >
                <td className="px-4 py-3">
                  <span className="font-semibold text-white">{route.currency}</span>
                </td>
                <td className="px-4 py-3 text-zinc-300">{route.country}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                    {route.preferredRail}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{route.fallbackRail}</td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                  {formatTime(route.averageTime)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-200">
                  {route.averageCost === 0 ? (
                    <span className="text-zinc-600">Free</span>
                  ) : (
                    formatCurrency(route.averageCost)
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      "inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      getRiskBg(route.riskScore),
                      getRiskColor(route.riskScore),
                    )}
                  >
                    {route.riskScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{route.provider}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

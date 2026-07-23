"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Holding, Security, Portfolio } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface HoldingsTableProps {
  holdings: Holding[];
  securities: Security[];
  portfolios: Portfolio[];
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  matured: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  sold: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

export const HoldingsTable = memo(function HoldingsTable({ holdings, securities, portfolios, className }: HoldingsTableProps) {
  const secMap = new Map(securities.map((s) => [s.id, s]));
  const portMap = new Map(portfolios.map((p) => [p.id, p]));

  return (
    <div className={cn("overflow-hidden rounded-lg border border-zinc-800/60", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Security</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Portfolio</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Quantity</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Book Value</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Market Value</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Unrealized G/L</th>
            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {holdings.map((h) => {
            const sec = secMap.get(h.securityId);
            const port = portMap.get(h.portfolioId);
            const gainPct = h.bookValue > 0 ? (h.unrealizedGain / h.bookValue) * 100 : 0;
            return (
              <tr key={h.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-white">{sec?.name ?? h.securityId}</p>
                  <p className="text-[11px] text-zinc-600">{sec?.ticker ?? sec?.securityType ?? ""}</p>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{port?.name ?? "—"}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{h.quantity.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(h.bookValue)}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{formatCurrency(h.marketValue)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn("text-sm font-medium", h.unrealizedGain >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {h.unrealizedGain >= 0 ? "+" : ""}{formatCurrency(h.unrealizedGain)}
                  </span>
                  <span className={cn("ml-1 text-[11px]", h.unrealizedGain >= 0 ? "text-emerald-600" : "text-red-600")}>
                    ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[h.status] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                    {h.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {holdings.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-zinc-500">No holdings found</p>
        </div>
      )}
    </div>
  );
});

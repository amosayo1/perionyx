"use client";

import { memo } from "react";
import { Building2, TrendingUp, DollarSign, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Portfolio, Holding, Security } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface PortfolioOverviewProps {
  portfolios: Portfolio[];
  holdings: Holding[];
  securities: Security[];
  onSelect?: (portfolioId: string) => void;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  enterprise: "text-purple-400 border-purple-500/20 bg-purple-500/10",
  liquidity: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  "capital-preservation": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  income: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  growth: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  corporate: "text-[#d4af37] border-[#d4af37]/20 bg-[#d4af37]/10",
  regional: "text-red-400 border-red-500/20 bg-red-500/10",
  "investment-strategy": "text-purple-400 border-purple-500/20 bg-purple-500/10",
};

export const PortfolioOverview = memo(function PortfolioOverview({ portfolios, holdings, securities, onSelect, className }: PortfolioOverviewProps) {
  function getPortfolioMetrics(portfolioId: string) {
    const portfolioHoldings = holdings.filter((h) => h.portfolioId === portfolioId);
    const marketValue = portfolioHoldings.reduce((s, h) => s + h.marketValue, 0);
    const bookValue = portfolioHoldings.reduce((s, h) => s + h.bookValue, 0);
    const unrealizedGain = portfolioHoldings.reduce((s, h) => s + h.unrealizedGain, 0);
    const returnPct = bookValue > 0 ? (unrealizedGain / bookValue) * 100 : 0;
    return { marketValue, bookValue, unrealizedGain, returnPct, holdingCount: portfolioHoldings.length };
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {portfolios.map((portfolio) => {
        const metrics = getPortfolioMetrics(portfolio.id);
        const typeColor = TYPE_COLORS[portfolio.type] ?? "text-zinc-400 border-zinc-500/20 bg-zinc-500/10";
        return (
          <button
            key={portfolio.id}
            onClick={() => onSelect?.(portfolio.id)}
            className="group rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 text-left transition-all hover:border-zinc-700/60 hover:bg-zinc-900/60"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/60">
                  <Building2 className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[#d4af37]">{portfolio.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", typeColor)}>
                      {portfolio.type.replace(/-/g, " ")}
                    </span>
                    <span className="text-[11px] text-zinc-600">{portfolio.currency}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-zinc-500">Market Value</p>
                <p className="text-sm font-bold text-white">{formatCurrency(metrics.marketValue)}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Return</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className={cn("h-3.5 w-3.5", metrics.returnPct >= 0 ? "text-emerald-400" : "text-red-400")} />
                  <p className={cn("text-sm font-bold", metrics.returnPct >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {metrics.returnPct.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Holdings</p>
                <p className="text-sm font-bold text-white">{metrics.holdingCount}</p>
              </div>
            </div>
          </button>
        );
      })}
      {portfolios.length === 0 && (
        <div className="col-span-2 flex items-center justify-center py-12">
          <p className="text-sm text-zinc-500">No portfolios found</p>
        </div>
      )}
    </div>
  );
});

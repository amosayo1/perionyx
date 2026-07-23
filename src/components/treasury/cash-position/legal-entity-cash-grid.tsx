"use client";

import { cn } from "@/lib/utils";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_ENTITY_CASH } from "./data";

interface LegalEntityCashGridProps {
  className?: string;
}

export function LegalEntityCashGrid({ className }: LegalEntityCashGridProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Legal Entity Cash Position</h3>
        <p className="text-[12px] text-zinc-500">Per-entity cash breakdown across all regions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Legal entity cash position">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">Region</th>
              <th className="px-5 py-3 font-medium">Currency</th>
              <th className="px-5 py-3 text-right font-medium">Available</th>
              <th className="px-5 py-3 text-right font-medium">Restricted</th>
              <th className="px-5 py-3 text-right font-medium">Idle</th>
              <th className="px-5 py-3 text-right font-medium">Working Capital</th>
              <th className="px-5 py-3 text-right font-medium">Liquidity</th>
              <th className="px-5 py-3 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ENTITY_CASH.map((entity) => (
              <tr key={entity.entityId} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-zinc-500" />
                    <span className="text-white">{entity.entityName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-zinc-400">{entity.region}</td>
                <td className="px-5 py-3 font-medium text-zinc-200">{entity.currency}</td>
                <td className="px-5 py-3 text-right text-emerald-400">{formatCurrency(entity.available)}</td>
                <td className="px-5 py-3 text-right text-red-400">{formatCurrency(entity.restricted)}</td>
                <td className="px-5 py-3 text-right text-amber-400">{formatCurrency(entity.idle)}</td>
                <td className="px-5 py-3 text-right text-white">{formatCurrency(entity.workingCapital)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    entity.liquidityScore >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                    entity.liquidityScore >= 60 ? "bg-amber-500/10 text-amber-400" :
                    "bg-red-500/10 text-red-400",
                  )}>
                    {entity.liquidityScore}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {entity.dailyChange >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                    )}
                    <span className={cn(
                      "font-medium",
                      entity.dailyChange >= 0 ? "text-emerald-400" : "text-red-400",
                    )}>
                      {entity.dailyChange >= 0 ? "+" : ""}{formatCurrency(entity.dailyChange)}
                    </span>
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

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

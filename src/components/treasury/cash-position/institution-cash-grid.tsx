"use client";

import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";
import { MOCK_INSTITUTION_CASH } from "./data";

interface InstitutionCashGridProps {
  className?: string;
}

export function InstitutionCashGrid({ className }: InstitutionCashGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {MOCK_INSTITUTION_CASH.map((inst) => {
        const availabilityPct = inst.totalCash > 0 ? (inst.availableCash / inst.totalCash) * 100 : 0;
        return (
          <div key={inst.institution} className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-white">{inst.institution}</span>
              </div>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                inst.relationshipHealth === "healthy" ? "bg-emerald-500/10 text-emerald-400" :
                inst.relationshipHealth === "degraded" ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400",
              )}>
                {inst.relationshipHealth}
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Cash</span>
                <span className="text-white font-medium">{formatCurrency(inst.totalCash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Available</span>
                <span className="text-emerald-400">{formatCurrency(inst.availableCash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Restricted</span>
                <span className="text-red-400">{formatCurrency(inst.restrictedCash)}</span>
              </div>
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500/50"
                style={{ width: `${availabilityPct}%` }}
                role="progressbar"
                aria-valuenow={availabilityPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${availabilityPct.toFixed(0)}% availability`}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px] text-zinc-500">
              <span>{inst.accountCount} accounts</span>
              <span>{inst.providerKind}</span>
              <span className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-medium",
                inst.liquidityScore >= 80 ? "text-emerald-400" :
                inst.liquidityScore >= 60 ? "text-amber-400" : "text-red-400",
              )}>
                Score: {inst.liquidityScore}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

"use client";

import { cn } from "@/lib/utils";
import type { BankingKPI } from "@/server/banking/workspace";

interface BankingKPIGridProps {
  kpis: BankingKPI[];
  className?: string;
}

export function BankingKPIGrid({ kpis, className }: BankingKPIGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6", className)}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4"
        >
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-500">
            {kpi.label}
          </p>
          <p className="mt-1 text-[20px] font-semibold text-white">{kpi.value}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "text-[12px] font-medium",
                kpi.trend === "up" && "text-emerald-400",
                kpi.trend === "down" && "text-red-400",
                kpi.trend === "neutral" && "text-zinc-400",
              )}
            >
              {kpi.change}
            </span>
            {kpi.subtitle && (
              <span className="text-[11px] text-zinc-500">{kpi.subtitle}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
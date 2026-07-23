"use client";

import { memo } from "react";
import { AlertTriangle, Shield, TrendingDown, DollarSign, BarChart3, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskMetrics } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface RiskDashboardProps {
  risks: RiskMetrics[];
  className?: string;
}

function RiskCard({ label, value, icon, variant, unit = "%" }: { label: string; value: number; icon: React.ReactNode; variant: "low" | "medium" | "high"; unit?: string }) {
  const colors = {
    low: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    medium: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    high: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  };
  const c = colors[variant];
  const display = unit === "$" ? formatCurrency(value) : `${value.toFixed(1)}${unit}`;
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className={cn("text-xl font-bold", c.icon)}>{display}</p>
        </div>
      </div>
    </div>
  );
}

function severity(v: number, t: number): "low" | "medium" | "high" {
  if (v <= t * 0.5) return "low";
  if (v <= t) return "medium";
  return "high";
}

export const RiskDashboard = memo(function RiskDashboard({ risks, className }: RiskDashboardProps) {
  const latest = risks.length > 0 ? risks.reduce((a, b) => a.asOf.getTime() > b.asOf.getTime() ? a : b) : null;

  if (!latest) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <p className="text-sm text-zinc-500">No risk metrics available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <RiskCard label="Market Risk" value={latest.marketRisk} icon={<BarChart3 />} variant={severity(latest.marketRisk, 5)} />
        <RiskCard label="Interest Rate Risk" value={latest.interestRateRisk} icon={<TrendingDown />} variant={severity(latest.interestRateRisk, 5)} />
        <RiskCard label="Credit Risk" value={latest.creditRisk} icon={<Shield />} variant={severity(latest.creditRisk, 3)} />
        <RiskCard label="Liquidity Risk" value={latest.liquidityRisk} icon={<DollarSign />} variant={severity(latest.liquidityRisk, 2)} />
        <RiskCard label="Concentration Risk" value={latest.concentrationRisk} icon={<AlertTriangle />} variant={severity(latest.concentrationRisk, 15)} />
        <RiskCard label="Issuer Risk" value={latest.issuerRisk} icon={<Shield />} variant={severity(latest.issuerRisk, 10)} />
        <RiskCard label="Sector Risk" value={latest.sectorRisk} icon={<BarChart3 />} variant={severity(latest.sectorRisk, 20)} />
        <RiskCard label="Country Risk" value={latest.countryRisk} icon={<Globe />} variant={severity(latest.countryRisk, 10)} />
        <RiskCard label="Currency Risk" value={latest.currencyRisk} icon={<DollarSign />} variant={severity(latest.currencyRisk, 5)} />
        <RiskCard label="Duration Risk" value={latest.durationRisk} icon={<BarChart3 />} variant={severity(latest.durationRisk, 5)} />
        <RiskCard label="Value at Risk" value={latest.valueAtRisk ?? 0} icon={<AlertTriangle />} variant={severity(latest.valueAtRisk ?? 0, 1000000)} unit="$" />
        <RiskCard label="Diversification" value={latest.diversificationScore} icon={<Shield />} variant={latest.diversificationScore >= 70 ? "low" : latest.diversificationScore >= 40 ? "medium" : "high"} />
      </div>
    </div>
  );
});

"use client";

import { memo } from "react";
import { TrendingUp, DollarSign, PieChart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "gold" | "emerald" | "amber" | "red" | "blue" | "purple" | "cyan";
  trend?: { value: string; up: boolean };
}

const COLORS = {
  gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function MetricCard({ label, value, icon, variant = "gold", trend }: MetricCardProps) {
  const c = COLORS[variant];
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60 hover:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.border, c.bg)}>
          <div className={cn("h-5 w-5", c.icon)}>{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <span className={cn("text-xs", trend.up ? "text-emerald-400" : "text-red-400")}>
                {trend.up ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InvestmentHeaderProps {
  marketValue: number;
  portfolioReturn: number;
  portfolioYield: number;
  diversificationScore: number;
}

export const InvestmentHeader = memo(function InvestmentHeader({
  marketValue, portfolioReturn, portfolioYield, diversificationScore,
}: InvestmentHeaderProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        label="Total Market Value"
        value={formatCurrency(marketValue)}
        icon={<DollarSign />}
        variant="gold"
      />
      <MetricCard
        label="Portfolio Return"
        value={`${portfolioReturn.toFixed(2)}%`}
        icon={<TrendingUp />}
        variant={portfolioReturn >= 0 ? "emerald" : "red"}
        trend={portfolioReturn >= 0 ? { value: `${portfolioReturn.toFixed(1)}%`, up: true } : { value: `${Math.abs(portfolioReturn).toFixed(1)}%`, up: false }}
      />
      <MetricCard
        label="Portfolio Yield"
        value={`${portfolioYield.toFixed(2)}%`}
        icon={<PieChart />}
        variant="blue"
      />
      <MetricCard
        label="Diversification Score"
        value={`${diversificationScore}/100`}
        icon={<Shield />}
        variant={diversificationScore >= 70 ? "emerald" : diversificationScore >= 40 ? "amber" : "red"}
      />
    </div>
  );
});

import { ChartCard } from "./chart-card";
import { TrendChartPlaceholder } from "./trend-chart-placeholder";
import { BarChartPlaceholder } from "./bar-chart-placeholder";
import { DistributionChartPlaceholder } from "./distribution-chart-placeholder";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { FinancialHealthData } from "./types";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: TrendingUp };

function MetricTile({
  label,
  value,
  change,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  const Icon = trendIcons[trend];
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-lg font-semibold text-white">{value}</span>
        <span
          className={cn(
            "flex items-center gap-0.5 text-[11px] font-medium",
            trend === "up" && "text-[#d4af37]",
            trend === "down" && "text-red-400",
            trend === "neutral" && "text-zinc-500",
          )}
        >
          <Icon className="h-3 w-3" />
          {change}
        </span>
      </div>
    </div>
  );
}

export function FinancialHealth({ data }: { data: FinancialHealthData }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Financial Health</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Cash position, liquidity, and settlement metrics
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricTile label="Cash Position" value={data.cashPosition.value} change={data.cashPosition.change} trend={data.cashPosition.trend} />
        <MetricTile label="Available Liquidity" value={data.availableLiquidity.value} change={data.availableLiquidity.change} trend={data.availableLiquidity.trend} />
        <MetricTile label="Outstanding Liabilities" value={data.outstandingLiabilities.value} change={data.outstandingLiabilities.change} trend={data.outstandingLiabilities.trend} />
        <MetricTile label="Settlement Volume" value={data.settlementVolume.value} change={data.settlementVolume.change} trend={data.settlementVolume.trend} />
        <MetricTile label="Working Capital" value={data.workingCapital.value} change={data.workingCapital.change} trend={data.workingCapital.trend} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Cash Trend" description="30-day cash position trend" className="lg:col-span-2">
          <TrendChartPlaceholder />
        </ChartCard>
        <ChartCard title="Cash Distribution" description="Allocation across accounts">
          <DistributionChartPlaceholder data={data.cashDistribution} />
        </ChartCard>
      </div>
    </div>
  );
}

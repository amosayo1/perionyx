"use client";

import { cn } from "@/lib/utils";
import {
  Download, Printer, RefreshCw,
  Eye, Percent, CalendarDays, DollarSign,
  HandCoins, Wallet, GitCompareArrows, Beaker,
  Target, Flame, TrendingDown, AlertTriangle, ArrowUp,
} from "lucide-react";
import { MOCK_METRICS } from "./data";

interface ExecutiveCashForecastHeaderProps {
  className?: string;
  onExport?: () => void;
  onPrint?: () => void;
}

export function ExecutiveCashForecastHeader({ className, onExport, onPrint }: ExecutiveCashForecastHeaderProps) {
  const m = MOCK_METRICS;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cash Forecast & Scenario Planning</h1>
          <p className="mt-1 text-[13px] text-zinc-400">
            Enterprise-wide forecasting &bull; Updated {new Date(m.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Export data"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Print report"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900 px-4 py-2 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard icon={Eye} label="Forecast Horizon" value={m.forecastHorizon} />
        <KpiCard
          icon={Percent}
          label="Forecast Confidence"
          value={`${m.forecastConfidence}%`}
          highlight={m.forecastConfidence < 70 ? "red" : m.forecastConfidence < 85 ? "amber" : "emerald"}
        />
        <KpiCard icon={CalendarDays} label="Cash Runway" value={`${m.cashRunway} days`} />
        <KpiCard icon={DollarSign} label="Projected Ending Cash" value={formatCurrency(m.projectedEndingCash)} />
        <KpiCard icon={HandCoins} label="Funding Requirement" value={formatCurrency(m.fundingRequirement)} />
        <KpiCard icon={Wallet} label="Expected Liquidity" value={formatCurrency(m.expectedLiquidity)} />
        <KpiCard icon={GitCompareArrows} label="Scenario Count" value={m.scenarioCount.toString()} />
        <KpiCard icon={Beaker} label="Stress Tests" value={m.stressTestCount.toString()} />
        <KpiCard
          icon={Target}
          label="Forecast Accuracy"
          value={`${m.forecastAccuracy}%`}
          highlight={m.forecastAccuracy < 80 ? "red" : m.forecastAccuracy < 90 ? "amber" : "emerald"}
        />
        <KpiCard icon={Flame} label="Cash Burn" value={formatCurrency(m.cashBurn)} highlight="red" />
        <KpiCard icon={AlertTriangle} label="Largest Risk" value={m.largestRisk} />
        <KpiCard icon={ArrowUp} label="Largest Opportunity" value={m.largestOpportunity} highlight="emerald" />
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, highlight,
}: {
  icon: React.ElementType; label: string; value: string; highlight?: "red" | "amber" | "emerald";
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-3">
      <Icon className={cn(
        "h-5 w-5 shrink-0",
        highlight === "red" ? "text-red-400" :
        highlight === "amber" ? "text-amber-400" :
        highlight === "emerald" ? "text-emerald-400" :
        "text-zinc-500",
      )} />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 truncate">{label}</p>
        <p className={cn(
          "text-lg font-semibold truncate",
          highlight === "red" ? "text-red-400" :
          highlight === "amber" ? "text-amber-400" :
          highlight === "emerald" ? "text-emerald-400" :
          "text-white",
        )}>{value}</p>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

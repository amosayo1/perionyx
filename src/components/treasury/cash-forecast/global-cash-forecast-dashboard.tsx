"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExecutiveCashForecastHeader } from "./executive-cash-forecast-header";
import { TreasuryCashForecastFilters } from "./treasury-cash-forecast-filters";
import { CashForecastOverview } from "./cash-forecast-overview";
import { CashForecastTable } from "./cash-forecast-table";
import { ScenarioPlanningCenter } from "./scenario-planning-center";
import { StressTestingDashboard } from "./stress-testing-dashboard";
import { RollingForecastCenter } from "./rolling-forecast-center";
import { ForecastVarianceCenter } from "./forecast-variance-center";
import { LiquidityProjectionCenter } from "./liquidity-projection-center";
import { FutureFundingCenter } from "./future-funding-center";
import { ForecastAssumptionsPanel } from "./forecast-assumptions-panel";
import { ForecastSensitivityAnalysis } from "./forecast-sensitivity-analysis";
import { ForecastRecommendationsPanel } from "./forecast-recommendations-panel";
import { ForecastAlertsPanel } from "./forecast-alerts-panel";
import { ExecutiveCashForecastInsights } from "./executive-cash-forecast-insights";
import { CashRunwayChart } from "./cash-runway-chart";
import { ForecastConfidenceChart } from "./forecast-confidence-chart";
import { CashBurnChart } from "./cash-burn-chart";
import { NetCashFlowChart } from "./net-cash-flow-chart";
import { ForecastVsActualChart } from "./forecast-vs-actual-chart";
import { LiquidityTrendChart } from "./liquidity-trend-chart";
import { FundingGapChart } from "./funding-gap-chart";
import { ScenarioComparisonChart } from "./scenario-comparison-chart";
import { StressImpactChart } from "./stress-impact-chart";
import { VarianceWaterfallChart } from "./variance-waterfall-chart";
import { WorkingCapitalTrendChart } from "./working-capital-trend-chart";
import { FreeCashFlowChart } from "./free-cash-flow-chart";

const TABS = [
  "overview", "forecasts", "scenarios", "stress testing", "rolling forecast",
  "variance", "liquidity", "funding", "assumptions", "sensitivity",
  "recommendations", "alerts", "executive",
] as const;

type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  forecasts: "Forecasts",
  scenarios: "Scenarios",
  "stress testing": "Stress Testing",
  "rolling forecast": "Rolling Forecast",
  variance: "Variance",
  liquidity: "Liquidity",
  funding: "Funding",
  assumptions: "Assumptions",
  sensitivity: "Sensitivity",
  recommendations: "Recommendations",
  alerts: "Alerts",
  executive: "Executive",
};

export function GlobalCashForecastDashboard({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutiveCashForecastHeader />

      <TreasuryCashForecastFilters />

      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto" role="tablist" aria-label="Dashboard tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={cn(
              "px-4 py-2.5 text-[13px] font-medium capitalize whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab
                ? "border-gold text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200",
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <CashForecastOverview />
          <div className="grid gap-6 lg:grid-cols-2">
            <CashRunwayChart />
            <ForecastConfidenceChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CashBurnChart />
            <NetCashFlowChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ForecastVsActualChart />
            <LiquidityTrendChart />
          </div>
          <ExecutiveCashForecastInsights />
        </div>
      )}

      {activeTab === "forecasts" && <CashForecastTable />}
      {activeTab === "scenarios" && <ScenarioPlanningCenter />}
      {activeTab === "stress testing" && <StressTestingDashboard />}
      {activeTab === "rolling forecast" && <RollingForecastCenter />}
      {activeTab === "variance" && <ForecastVarianceCenter />}
      {activeTab === "liquidity" && <LiquidityProjectionCenter />}
      {activeTab === "funding" && <FutureFundingCenter />}
      {activeTab === "assumptions" && <ForecastAssumptionsPanel />}
      {activeTab === "sensitivity" && <ForecastSensitivityAnalysis />}
      {activeTab === "recommendations" && <ForecastRecommendationsPanel />}
      {activeTab === "alerts" && <ForecastAlertsPanel />}

      {activeTab === "executive" && (
        <div className="space-y-6">
          <ExecutiveCashForecastInsights />
          <div className="grid gap-6 lg:grid-cols-2">
            <ScenarioComparisonChart />
            <StressImpactChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <VarianceWaterfallChart />
            <WorkingCapitalTrendChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FundingGapChart />
            <FreeCashFlowChart />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExecutiveLiquidityHeader } from "./executive-liquidity-header";
import { TreasuryLiquidityFilters } from "./treasury-liquidity-filters";
import { LiquidityOverview } from "./liquidity-overview";
import { LiquidityPoolsGrid } from "./liquidity-pools-grid";
import { LiquidityForecastTimeline } from "./liquidity-forecast-timeline";
import { FundingRequirementsTable } from "./funding-requirements-table";
import { IntercompanyFundingMatrix } from "./intercompany-funding-matrix";
import { LiquidityScenarioSimulator } from "./liquidity-scenario-simulator";
import { RegionalLiquidityCards } from "./regional-liquidity-cards";
import { LiquidityAlertsPanel } from "./liquidity-alerts-panel";
import { TreasuryRecommendationsPanel } from "./treasury-recommendations-panel";
import { ExecutiveLiquidityInsights } from "./executive-liquidity-insights";
import { LiquidityTrendChart } from "./liquidity-trend-chart";
import { FundingGapChart } from "./funding-gap-chart";
import { CoverageRatioChart } from "./coverage-ratio-chart";
import { LiquidityUtilizationChart } from "./liquidity-utilization-chart";
import { CurrencyExposureChart } from "./currency-exposure-chart";
import { CashBurnChart } from "./cash-burn-chart";
import { ForecastAccuracyChart } from "./forecast-accuracy-chart";
import { LiquidityCompositionCard } from "./liquidity-composition-card";
import { LiquidityHeatmap } from "./liquidity-heatmap";
import { MOCK_LIQUIDITY_ALERTS, MOCK_RECOMMENDATIONS, MOCK_REGION_LIQUIDITY } from "./data";

export function GlobalLiquidityDashboard({ className }: { className?: string }) {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutiveLiquidityHeader />
      <TreasuryLiquidityFilters />

      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto" role="tablist" aria-label="Liquidity dashboard sections">
        {["overview", "pools", "forecast", "funding", "scenarios", "regions", "analytics", "recommendations", "alerts"].map((s) => (
          <button key={s} onClick={() => setActiveSection(s)}
            role="tab" aria-selected={activeSection === s}
            className={cn("px-4 py-2.5 text-[13px] font-medium capitalize whitespace-nowrap border-b-2 transition-colors",
              activeSection === s ? "border-gold text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}>{s}</button>
        ))}
      </div>

      {activeSection === "overview" && (
        <>
          <LiquidityOverview />
          <div className="grid gap-6 lg:grid-cols-3">
            <LiquidityCompositionCard />
            <div className="lg:col-span-2">
              <LiquidityPoolsGrid compact />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <LiquidityForecastTimeline compact />
            <ExecutiveLiquidityInsights />
          </div>
        </>
      )}

      {activeSection === "pools" && (
        <>
          <LiquidityPoolsGrid />
          <LiquidityHeatmap />
        </>
      )}

      {activeSection === "forecast" && <LiquidityForecastTimeline />}
      {activeSection === "funding" && (
        <>
          <FundingRequirementsTable />
          <IntercompanyFundingMatrix />
        </>
      )}

      {activeSection === "scenarios" && <LiquidityScenarioSimulator />}
      {activeSection === "regions" && <RegionalLiquidityCards />}

      {activeSection === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <LiquidityTrendChart />
            <CoverageRatioChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FundingGapChart />
            <LiquidityUtilizationChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrencyExposureChart />
            <CashBurnChart />
          </div>
          <ForecastAccuracyChart />
        </div>
      )}

      {activeSection === "recommendations" && <TreasuryRecommendationsPanel />}
      {activeSection === "alerts" && <LiquidityAlertsPanel alerts={MOCK_LIQUIDITY_ALERTS} />}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExecutiveRiskHeader } from "./executive-risk-header";
import { TreasuryRiskFilters } from "./treasury-risk-filters";
import { RiskOverview } from "./risk-overview";
import { FXExposureTable } from "./fx-exposure-table";
import { InterestRateExposure } from "./interest-rate-exposure";
import { CounterpartyRiskGrid } from "./counterparty-risk-grid";
import { CountryRiskMap } from "./country-risk-map";
import { HedgingPortfolio } from "./hedging-portfolio";
import { StressTestingPanel } from "./stress-testing-panel";
import { ValueAtRiskPanel } from "./value-at-risk-panel";
import { RiskPolicyCenter } from "./risk-policy-center";
import { RiskTrendChart } from "./risk-trend-chart";
import { FXDistributionChart } from "./fx-distribution-chart";
import { CountryExposureChart } from "./country-exposure-chart";
import { CounterpartyChart } from "./counterparty-chart";
import { HedgeCoverageChart } from "./hedge-coverage-chart";
import { RiskScoreChart } from "./risk-score-chart";
import { PolicyBreachChart } from "./policy-breach-chart";
import { VaRTrendChart } from "./var-trend-chart";
import { RiskAlertsPanel } from "./risk-alerts-panel";
import { RiskRecommendationsPanel } from "./risk-recommendations-panel";
import { ExecutiveRiskInsights } from "./executive-risk-insights";

const TABS = [
  "overview", "fx exposure", "interest rates", "counterparties", "country risk",
  "hedging", "stress tests", "var", "analytics", "policies", "alerts", "recommendations",
] as const;

type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  "fx exposure": "FX Exposure",
  "interest rates": "Interest Rates",
  counterparties: "Counterparties",
  "country risk": "Country Risk",
  hedging: "Hedging",
  "stress tests": "Stress Tests",
  var: "VaR",
  analytics: "Analytics",
  policies: "Policies",
  alerts: "Alerts",
  recommendations: "Recommendations",
};

export function GlobalRiskDashboard({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutiveRiskHeader />
      <TreasuryRiskFilters />

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
                ? "border-[#c9a84c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200",
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <RiskOverview />
          <div className="grid gap-6 lg:grid-cols-2">
            <RiskTrendChart />
            <RiskScoreChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FXDistributionChart />
            <CountryExposureChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CounterpartyChart />
            <HedgeCoverageChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <PolicyBreachChart />
            <VaRTrendChart />
          </div>
          <ExecutiveRiskInsights />
        </div>
      )}

      {activeTab === "fx exposure" && <FXExposureTable />}
      {activeTab === "interest rates" && <InterestRateExposure />}
      {activeTab === "counterparties" && <CounterpartyRiskGrid />}
      {activeTab === "country risk" && <CountryRiskMap />}
      {activeTab === "hedging" && <HedgingPortfolio />}
      {activeTab === "stress tests" && <StressTestingPanel />}
      {activeTab === "var" && <ValueAtRiskPanel />}
      {activeTab === "policies" && <RiskPolicyCenter />}
      {activeTab === "alerts" && <RiskAlertsPanel />}
      {activeTab === "recommendations" && <RiskRecommendationsPanel />}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RiskTrendChart />
            <FXDistributionChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CountryExposureChart />
            <CounterpartyChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <HedgeCoverageChart />
            <RiskScoreChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <PolicyBreachChart />
            <VaRTrendChart />
          </div>
        </div>
      )}
    </div>
  );
}

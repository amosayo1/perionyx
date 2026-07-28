"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { TreasuryFilters } from "./treasury-filters";
import { ExecutiveTreasuryHeader } from "./executive-treasury-header";
import { CashPositionOverview } from "./cash-position-overview";
import { GlobalCashMap } from "./global-cash-map";
import { RegionalCashCard } from "./regional-cash-card";
import { LegalEntityCashGrid } from "./legal-entity-cash-grid";
import { CurrencyPositionTable } from "./currency-position-table";
import { InstitutionCashGrid } from "./institution-cash-grid";
import { CashCompositionCard } from "./cash-composition-card";
import { AvailableCashWidget } from "./available-cash-widget";
import { RestrictedCashWidget } from "./restricted-cash-widget";
import { IdleCashWidget } from "./idle-cash-widget";
import { WorkingCapitalWidget } from "./working-capital-widget";
import { CashMovementTimeline } from "./cash-movement-timeline";
import { DailyCashVariance } from "./daily-cash-variance";
import { CashTrendChart } from "./cash-trend-chart";
import { RegionalLiquidityChart } from "./regional-liquidity-chart";
import { CurrencyDistributionChart } from "./currency-distribution-chart";
import { EntityExposureChart } from "./entity-exposure-chart";
import { CashAlertsPanel } from "./cash-alerts-panel";
import { MOCK_ALERTS, MOCK_INSIGHTS, MOCK_REGIONAL_CASH } from "./data";

interface GlobalCashDashboardProps {
  className?: string;
}

export function GlobalCashDashboard({ className }: GlobalCashDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutiveTreasuryHeader />

      <TreasuryFilters />

      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto" role="tablist" aria-label="Dashboard sections">
        {["overview", "regions", "entities", "currencies", "institutions", "analytics", "alerts"].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            role="tab"
            aria-selected={activeSection === section}
            className={cn(
              "px-4 py-2.5 text-[13px] font-medium capitalize whitespace-nowrap border-b-2 transition-colors",
              activeSection === section
                ? "border-gold text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200",
            )}
          >
            {section}
          </button>
        ))}
      </div>

      {activeSection === "overview" && (
        <>
          <CashPositionOverview />

          <div className="grid gap-6 lg:grid-cols-3">
            <CashCompositionCard />
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <AvailableCashWidget />
                <RestrictedCashWidget />
                <IdleCashWidget />
              </div>
              <WorkingCapitalWidget />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CashMovementTimeline />
            <DailyCashVariance />
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5">
            <h3 className="mb-1 text-sm font-medium text-white">Executive Insights</h3>
            <p className="mb-4 text-[12px] text-zinc-500">Key observations for CFO attention</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_INSIGHTS.map((insight) => (
                <div key={insight.type} className={cn(
                  "rounded-lg border p-4",
                  insight.severity === "critical" ? "border-red-500/20 bg-red-500/5" :
                  insight.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                  "border-emerald-500/20 bg-emerald-500/5",
                )}>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{insight.title}</p>
                  <p className={cn(
                    "mt-1 text-lg font-semibold",
                    insight.severity === "critical" ? "text-red-400" :
                    insight.severity === "warning" ? "text-amber-400" :
                    "text-emerald-400",
                  )}>{insight.value}</p>
                  <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeSection === "regions" && (
        <div className="space-y-6">
          <GlobalCashMap />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {MOCK_REGIONAL_CASH.map((region) => (
              <RegionalCashCard key={region.region} data={region} />
            ))}
          </div>
        </div>
      )}

      {activeSection === "entities" && <LegalEntityCashGrid />}
      {activeSection === "currencies" && <CurrencyPositionTable />}
      {activeSection === "institutions" && <InstitutionCashGrid />}

      {activeSection === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <CashTrendChart />
            <RegionalLiquidityChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CurrencyDistributionChart />
            <EntityExposureChart />
          </div>
        </div>
      )}

      {activeSection === "alerts" && <CashAlertsPanel alerts={MOCK_ALERTS} />}
    </div>
  );
}

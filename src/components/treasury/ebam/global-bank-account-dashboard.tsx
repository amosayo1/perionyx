"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExecutiveBankAccountHeader } from "./executive-bank-account-header";
import { TreasuryAccountFilters } from "./treasury-account-filters";
import { BankAccountOverview } from "./bank-account-overview";
import { EnterpriseAccountRegistry } from "./enterprise-account-registry";
import { BankRelationshipCenter } from "./bank-relationship-center";
import { AccountLifecycleBoard } from "./account-lifecycle-board";
import { AuthorizedSignatoriesGrid } from "./authorized-signatories-grid";
import { MandateManagementTable } from "./mandate-management-table";
import { KYCComplianceCenter } from "./kyc-compliance-center";
import { OwnershipHierarchy } from "./ownership-hierarchy";
import { DormantAccountPanel } from "./dormant-account-panel";
import { AccountCompliancePanel } from "./account-compliance-panel";
import { AccountDistributionChart } from "./account-distribution-chart";
import { CurrencyDistributionChart } from "./currency-distribution-chart";
import { BankExposureChart } from "./bank-exposure-chart";
import { RelationshipHealthChart } from "./relationship-health-chart";
import { LifecycleChart } from "./lifecycle-chart";
import { ComplianceScoreChart } from "./compliance-score-chart";
import { AccountGrowthChart } from "./account-growth-chart";
import { DormancyTrendChart } from "./dormancy-trend-chart";
import { KycCompletionChart } from "./kyc-completion-chart";
import { MandateCoverageChart } from "./mandate-coverage-chart";
import { BankAccountRecommendationsPanel } from "./bank-account-recommendations-panel";
import { BankAccountAlertsPanel } from "./bank-account-alerts-panel";
import { ExecutiveBankAccountInsights } from "./executive-bank-account-insights";

const TABS = [
  "overview", "accounts", "banks", "signatories", "mandates", "kyc",
  "ownership", "lifecycle", "compliance", "analytics", "recommendations", "alerts",
] as const;

type Tab = (typeof TABS)[number];

export function GlobalBankAccountDashboard({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutiveBankAccountHeader />

      <TreasuryAccountFilters />

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
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <BankAccountOverview />
          <div className="grid gap-6 lg:grid-cols-2">
            <AccountDistributionChart />
            <RelationshipHealthChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <LifecycleChart />
            <DormancyTrendChart />
          </div>
          <ExecutiveBankAccountInsights />
        </div>
      )}

      {activeTab === "accounts" && <EnterpriseAccountRegistry />}
      {activeTab === "banks" && <BankRelationshipCenter />}
      {activeTab === "signatories" && <AuthorizedSignatoriesGrid />}
      {activeTab === "mandates" && <MandateManagementTable />}

      {activeTab === "kyc" && (
        <div className="space-y-6">
          <KYCComplianceCenter />
          <div className="grid gap-6 lg:grid-cols-2">
            <KycCompletionChart />
            <MandateCoverageChart />
          </div>
        </div>
      )}

      {activeTab === "ownership" && <OwnershipHierarchy />}

      {activeTab === "lifecycle" && (
        <div className="space-y-6">
          <AccountLifecycleBoard />
          <DormantAccountPanel />
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ComplianceScoreChart />
            <AccountGrowthChart />
          </div>
          <AccountCompliancePanel />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AccountDistributionChart />
            <CurrencyDistributionChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BankExposureChart />
            <AccountGrowthChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RelationshipHealthChart />
            <LifecycleChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ComplianceScoreChart />
            <DormancyTrendChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <KycCompletionChart />
            <MandateCoverageChart />
          </div>
        </div>
      )}

      {activeTab === "recommendations" && <BankAccountRecommendationsPanel />}
      {activeTab === "alerts" && <BankAccountAlertsPanel />}
    </div>
  );
}

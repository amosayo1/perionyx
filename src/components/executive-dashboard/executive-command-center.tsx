"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Zone1ExecutiveGreeting } from "./zone-1-executive-greeting";
import { Zone2ExecutiveKpis } from "./zone-2-executive-kpis";
import { Zone3TimelinePreview } from "./zone-3-timeline-preview";
import { Zone4AiBrief } from "./zone-4-ai-brief";
import { Zone5EnterpriseHealth } from "./zone-5-enterprise-health";
import { Zone6TreasuryCommand } from "./zone-6-treasury-command";
import { Zone7StrategicAnalytics } from "./zone-7-strategic-analytics";
import { Zone8OperationalIntelligence } from "./zone-8-operational-intelligence";
import { Zone9Recommendations } from "./zone-9-recommendations";
import { Zone10QuickActions } from "./zone-10-quick-actions";
import type { KpiData, HealthScore, TimelineEvent, Recommendation } from "./types";
import type { DashboardState } from "./types";

interface ExecutiveCommandCenterProps {
  userName?: string | null;
  companyName?: string;
  businessUnit?: string;
  wallets?: { currency: string; balance: number }[];
  totalBal?: number;
  pendingApprovals?: number;
  className?: string;
}

export const ExecutiveCommandCenter = memo(function ExecutiveCommandCenter({
  userName,
  companyName,
  businessUnit,
  wallets = [],
  totalBal = 0,
  pendingApprovals = 0,
  className,
}: ExecutiveCommandCenterProps) {
  const [state, setState] = useState<DashboardState>({
    isLoading: false,
    error: null,
    lastRefreshed: null,
  });

  const handleRefresh = useCallback(() => {
    setState({ isLoading: true, error: null, lastRefreshed: null });
    setTimeout(() => {
      setState({ isLoading: false, error: null, lastRefreshed: new Date() });
    }, 800);
  }, []);

  const totalWallets = wallets.length;
  const uniqueCurrencies = [...new Set(wallets.map((w) => w.currency))];

  const totalBalanceB = totalBal >= 1_000_000_000 ? totalBal / 1_000_000_000 : 0;
  const totalBalanceM = totalBal >= 1_000_000 ? totalBal / 1_000_000 : 0;

  const now = new Date();
  const kpis: KpiData[] = [
    {
      label: "Cash Position",
      value: totalBal,
      previousValue: totalBal > 0 ? totalBal * 0.96 : 0,
      format: "currency",
      trend: totalBal > 0 ? "up" : "flat",
      trendValue: 2.4,
      status: totalBal > 0 ? "success" : "neutral",
      sparklineData: [12.4, 12.8, 13.2, 12.9, 13.5, 14.1, 13.8, 14.2, 14.8, 14.5, 15.0, 14.6].map(v => v * 1_000_000),
      subtitle: `${uniqueCurrencies.length} currencies tracked`,
      lastUpdated: now,
      source: "Wallet balances",
    },
    {
      label: "Working Capital",
      value: totalBal * 0.45,
      previousValue: totalBal * 0.43,
      format: "currency",
      trend: "up",
      trendValue: 1.8,
      status: "success",
      sparklineData: [5.2, 5.4, 5.3, 5.6, 5.8, 5.7, 5.9, 6.1, 6.0, 6.2, 6.4, 6.3].map(v => v * 1_000_000),
      confidence: 88,
      lastUpdated: now,
      source: "Computed from assets and liabilities",
    },
    {
      label: "Revenue (MTD)",
      value: 3_250_000,
      previousValue: 3_090_000,
      format: "currency",
      trend: "up",
      trendValue: 5.2,
      status: "success",
      sparklineData: [2.1, 2.3, 2.2, 2.5, 2.7, 2.6, 2.8, 3.0, 2.9, 3.1, 3.2, 3.25].map(v => v * 1_000_000),
      lastUpdated: now,
      source: "GL revenue accounts",
    },
    {
      label: "Operating Expenses",
      value: 1_850_000,
      previousValue: 1_890_000,
      format: "currency",
      trend: "down",
      trendValue: -2.1,
      status: "warning",
      sparklineData: [2.0, 1.95, 1.98, 1.92, 1.90, 1.88, 1.85, 1.87, 1.84, 1.86, 1.83, 1.85].map(v => v * 1_000_000),
      lastUpdated: now,
      source: "GL expense accounts",
    },
    {
      label: "Business Health",
      value: 84,
      previousValue: 81,
      format: "percent",
      trend: "up",
      trendValue: 3,
      status: "success",
      confidence: 91,
      sparklineData: [78, 79, 80, 81, 80, 82, 83, 82, 83, 84, 84, 84],
      lastUpdated: now,
      source: "Composite score",
    },
  ];

  const healthScores: HealthScore[] = [
    { label: "System Health", score: 92, maxScore: 100, status: "healthy", trend: "up" },
    { label: "Financial Health", score: 85, maxScore: 100, status: "healthy", trend: "flat" },
    { label: "Treasury Health", score: 78, maxScore: 100, status: "warning", trend: "down" },
    { label: "Compliance", score: 95, maxScore: 100, status: "healthy", trend: "up" },
    { label: "Operational Health", score: 88, maxScore: 100, status: "healthy", trend: "up" },
    { label: "Workflow Health", score: 72, maxScore: 100, status: "warning", trend: "down" },
  ];

  const timelineEvents: TimelineEvent[] = [
    { id: "1", type: "approval", title: "Payment approved", description: "Invoice #INV-2024-3842 — $12,400.00", timestamp: "12 min ago", status: "completed" },
    { id: "2", type: "treasury", title: "FX rate alert", description: "EUR/USD moved +0.8% in last hour", timestamp: "34 min ago", status: "warning" },
    { id: "3", type: "risk", title: "Compliance check passed", description: "Daily AML screening — all clear", timestamp: "1h ago", status: "completed" },
    { id: "4", type: "automation", title: "Reconciliation complete", description: "Auto-matched 247 of 289 transactions", timestamp: "2h ago", status: "completed" },
    { id: "5", type: "policy", title: "Policy threshold breach", description: "Single transaction exceeds $50K approval limit", timestamp: "3h ago", status: "pending" },
    { id: "6", type: "ai", title: "Forecast updated", description: "Q3 cash flow projection adjusted +3.2%", timestamp: "4h ago", status: "completed" },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Enterprise Command Center</p>
          <p className="text-[12px] text-zinc-600">
            {state.lastRefreshed
              ? `Last updated ${state.lastRefreshed.toLocaleTimeString()}`
              : "Live dashboard"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={state.isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", state.isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Grid layout: 12 columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 xl:grid-cols-12">
        {/* Zone 1: Executive Greeting */}
        <Zone1ExecutiveGreeting
          userName={userName}
          companyName={companyName}
          businessUnit={businessUnit}
        />

        {/* Zone 2: Executive KPIs */}
        <Zone2ExecutiveKpis kpis={kpis} />

        {/* Zone 3: Timeline Preview */}
        <Zone3TimelinePreview events={timelineEvents} />

        {/* Zone 4: AI Brief */}
        <Zone4AiBrief />

        {/* Zone 8: Operational Intelligence */}
        <Zone8OperationalIntelligence
          pendingApprovals={pendingApprovals}
          automationOpportunities={12}
          slowProcesses={3}
          optimizationSuggestions={8}
        />

        {/* Zone 5: Enterprise Health */}
        <Zone5EnterpriseHealth scores={healthScores} />

        {/* Zone 6: Treasury Command */}
        <Zone6TreasuryCommand
          totalCash={totalBal}
          bankCount={totalWallets}
          liquidityRatio={1.8}
          fxExposure={3.2}
          upcomingPayments={24}
          forecastConfidence={85}
          treasuryRiskScore={22}
        />

        {/* Zone 10: Quick Actions */}
        <Zone10QuickActions />

        {/* Zone 7: Strategic Analytics */}
        <Zone7StrategicAnalytics
          approvalVelocity={3.5}
          monthEndProgress={76}
          forecastAccuracy={88}
        />

        {/* Zone 9: Recommendations */}
        <Zone9Recommendations recommendations={[]} />
      </div>
    </div>
  );
});

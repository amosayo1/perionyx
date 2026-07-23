"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MobileMetricCard, ExecutiveSummaryCard, QuickActionBar, OfflineIndicator, ConnectionStatus } from "@/components/mobile";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useLocalization } from "@/localization/language-provider";
import { BarChart3, TrendingUp, DollarSign, AlertTriangle, Users, Activity, Shield, Briefcase } from "lucide-react";

export default function MobileExecutiveDashboard() {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const isPhone = breakpoint === "phone";
  const [retryCount, setRetryCount] = useState(0);
  const { t } = useLocalization();

  const handleRetry = useCallback(() => setRetryCount((c) => c + 1), []);

  return (
    <div className="mx-auto max-w-lg pb-20 pt-2 safe-bottom">
      <OfflineIndicator onRetry={handleRetry} />

      <div className="flex items-center justify-between px-4 py-2">
        <div>
          <h1 className="text-lg font-semibold text-white">{t("mobile.executiveOverview")}</h1>
          <p className="text-[11px] text-zinc-500">{t("mobile.loadingDashboard")}</p>
        </div>
        <ConnectionStatus />
      </div>

      {/* Quick actions */}
      <div className="px-2">
        <QuickActionBar
          onApprove={() => router.push("/approvals")}
          onSearch={() => {}}
          onCreate={() => router.push("/transactions")}
          onNotifications={() => router.push("/notifications")}
          onRecent={() => router.push("/dashboard")}
        />
      </div>

      {/* Placeholder metric cards */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <MobileMetricCard
            label={t("mobile.cashPosition")}
            value="—"
            color="gold"
            trend="neutral"
            trendValue="—"
            subtitle={t("mobile.awaitingData")}
            icon={<DollarSign className="h-4 w-4" />}
            onClick={() => router.push("/wallets")}
          />
          <MobileMetricCard
            label={t("mobile.liquidity")}
            value="—"
            color="green"
            trend="neutral"
            trendValue="—"
            subtitle={t("mobile.awaitingData")}
            icon={<BarChart3 className="h-4 w-4" />}
            onClick={() => router.push("/insights")}
          />
          <MobileMetricCard
            label={t("mobile.pendingApprovals")}
            value="—"
            color="amber"
            trend="neutral"
            trendValue="—"
            subtitle={t("mobile.awaitingData")}
            icon={<Users className="h-4 w-4" />}
            onClick={() => router.push("/approvals")}
          />
          <MobileMetricCard
            label={t("mobile.criticalAlerts")}
            value="—"
            color="red"
            trend="neutral"
            trendValue="—"
            subtitle={t("mobile.awaitingData")}
            icon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => router.push("/risk")}
          />
        </div>
      </div>

      {/* Treasury snapshot — placeholder */}
      <div className="px-4 pt-3">
        <ExecutiveSummaryCard
          title={t("mobile.treasurySnapshot")}
          action={{ label: t("mobile.viewAll"), onClick: () => router.push("/wallets") }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
              <span className="text-xs text-zinc-500">{t("mobile.cashAndEquivalents")}</span>
              <span className="text-sm font-medium text-zinc-600">—</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
              <span className="text-xs text-zinc-500">{t("mobile.receivables")}</span>
              <span className="text-sm font-medium text-zinc-600">—</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
              <span className="text-xs text-zinc-500">{t("mobile.payables")}</span>
              <span className="text-sm font-medium text-zinc-600">—</span>
            </div>
          </div>
        </ExecutiveSummaryCard>
      </div>

      {/* Workflow & Compliance — placeholder */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <MobileMetricCard
            label={t("mobile.workflowHealth")}
            value="—"
            color="green"
            trend="neutral"
            trendValue="—"
            subtitle={t("mobile.awaitingData")}
            icon={<Activity className="h-4 w-4" />}
            onClick={() => router.push("/operations")}
          />
          <MobileMetricCard
            label={t("mobile.compliance")}
            value="—"
            color="blue"
            trend="neutral"
            subtitle={t("mobile.awaitingData")}
            icon={<Shield className="h-4 w-4" />}
            onClick={() => router.push("/governance")}
          />
        </div>
      </div>

      {/* Today's Activity — placeholder */}
      <div className="px-4 pt-3">
        <MobileMetricCard
          label={t("mobile.todaysActivity")}
          value="—"
          color="gold"
          trend="neutral"
          trendValue="—"
          subtitle={t("mobile.awaitingData")}
          icon={<TrendingUp className="h-4 w-4" />}
          onClick={() => router.push("/dashboard")}
        />
      </div>

      {/* Pending Approvals — empty state */}
      <div className="px-4 pt-3">
        <ExecutiveSummaryCard
          title={t("mobile.pendingApprovals")}
          action={{ label: t("mobile.viewAll"), onClick: () => router.push("/approvals") }}
        >
          <div className="flex flex-col items-center gap-3 py-8">
            <Briefcase className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">{t("mobile.noPendingApprovals")}</p>
          </div>
        </ExecutiveSummaryCard>
      </div>
    </div>
  );
}

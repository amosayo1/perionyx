import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ExecutiveGLHeader } from "../../../../components/gl/executive-gl-header";
import { ExecutiveInsights } from "../../../../components/gl/executive-insights";
import { KpiChart } from "../../../../components/gl/kpi-chart";
import { JournalVolumeChart } from "../../../../components/gl/journal-volume-chart";
import { RevenueTrendChart } from "../../../../components/gl/revenue-trend-chart";
import { ExpenseBreakdownChart } from "../../../../components/gl/expense-breakdown-chart";
import { FinancialHealthChart } from "../../../../components/gl/financial-health-chart";
import type { GLChartDataPoint } from "../../../../components/gl/gl-types";

export default async function ExecutivePage() {
  const aggregateMetrics = glService.getAggregateMetrics();
  const kpis = glService.analytics.getKPIs();
  const alerts = glService.analytics.getAllAlerts();
  const recommendations = glService.analytics.getAllRecommendations();
  const journals = glService.journals.getAllJournals();
  const accounts = glService.chartOfAccounts.getAllAccounts();
  const incomeStatements = glService.financialStatements.getAllIncomeStatements();
  const balanceSheets = glService.financialStatements.getAllBalanceSheets();

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  const kpiChartData: GLChartDataPoint[] = kpis.slice(0, 12).map((k) => ({
    period: k.name,
    value: k.value,
    previousValue: k.previousValue,
  }));

  const journalVolumeData: GLChartDataPoint[] = [
    { period: "Draft", value: journals.filter((j) => j.status === "draft").length },
    { period: "Approved", value: journals.filter((j) => j.status === "approved").length },
    { period: "Posted", value: journals.filter((j) => j.status === "posted").length },
    { period: "Reversed", value: journals.filter((j) => j.status === "reversed").length },
  ];

  const latestIS = incomeStatements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const latestBS = balanceSheets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const revenueByCategory = accounts
    .filter((a) => a.category === "revenue")
    .map((a) => ({ category: a.name, amount: 0 }));

  const expenseByCategory = accounts
    .filter((a) => a.category === "expense" || a.category === "cogs")
    .map((a) => ({ category: a.name, amount: 0 }));

  const healthMetrics = [
    { label: "Journal Posting Rate", value: journals.length > 0 ? Math.round((journals.filter((j) => j.status === "posted").length / journals.length) * 100) : 0, maxValue: 100 },
    { label: "Period Close Progress", value: Math.round((journals.filter((j) => j.status === "posted" || j.status === "approved").length / Math.max(journals.length, 1)) * 100), maxValue: 100 },
    { label: "Alert Resolution", value: alerts.length > 0 ? Math.round((alerts.filter((a) => a.dismissed).length / alerts.length) * 100) : 100, maxValue: 100 },
    { label: "Recommendation Adoption", value: recommendations.length > 0 ? Math.round((recommendations.filter((r) => r.implemented).length / recommendations.length) * 100) : 100, maxValue: 100 },
  ];

  return (
    <PageContainer size="full">
      <EnterprisePageHeader title="Executive View" description="C-suite general ledger intelligence" />
      <ExecutiveGLHeader
        totalAccounts={aggregateMetrics.totalAccounts}
        totalJournals={aggregateMetrics.totalJournals}
        totalPostedJournals={aggregateMetrics.totalPostedJournals}
        totalOpenPeriods={aggregateMetrics.totalOpenPeriods}
        totalLedgers={aggregateMetrics.totalLedgers}
        activeAlerts={aggregateMetrics.activeAlerts}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <KpiChart data={kpiChartData} />
        <JournalVolumeChart data={journalVolumeData} />
        <RevenueTrendChart data={kpiChartData} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpenseBreakdownChart data={expenseByCategory} />
        <FinancialHealthChart metrics={healthMetrics} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutiveInsights
          recommendations={recommendations}
          criticalAlerts={criticalAlerts}
          totalJournals={aggregateMetrics.totalJournals}
          postedJournals={aggregateMetrics.totalPostedJournals}
          openPeriods={aggregateMetrics.totalOpenPeriods}
        />
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">Period Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-2">
              <span className="text-xs text-zinc-400">Total Entries</span>
              <span className="text-sm font-medium text-white">{aggregateMetrics.totalEntries.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-2">
              <span className="text-xs text-zinc-400">Posting Batches</span>
              <span className="text-sm font-medium text-white">{aggregateMetrics.totalBatches.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-2">
              <span className="text-xs text-zinc-400">Active Rules</span>
              <span className="text-sm font-medium text-white">{aggregateMetrics.totalActiveRules.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-2">
              <span className="text-xs text-zinc-400">Allocation Rules</span>
              <span className="text-sm font-medium text-white">{aggregateMetrics.totalAllocationRules.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-2">
              <span className="text-xs text-zinc-400">Recurring Journals</span>
              <span className="text-sm font-medium text-white">{aggregateMetrics.totalRecurringJournals.toLocaleString()}</span>
            </div>
            {aggregateMetrics.lastPeriodClose && (
              <div className="flex items-center justify-between rounded-md bg-zinc-800/30 px-3 py-2">
                <span className="text-xs text-zinc-400">Last Close</span>
                <span className="text-sm font-medium text-zinc-300">{aggregateMetrics.lastPeriodClose}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

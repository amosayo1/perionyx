import { glService } from "../../../server/gl";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { DataFreshnessIndicator } from "../../../components/enterprise/data-freshness-indicator";
import { GeneralLedgerDashboard } from "../../../components/gl/general-ledger-dashboard";
import type { GLOverviewMetrics } from "../../../components/gl/gl-types";

export default async function GeneralLedgerPage() {
  const aggregateMetrics = glService.getAggregateMetrics();
  const allAccounts = glService.chartOfAccounts.getAllAccounts();
  const allJournals = glService.journals.getAllJournals();
  const allPeriods = glService.periods.getAllPeriods();
  const allAlerts = glService.analytics.getAllAlerts();
  const allRecommendations = glService.analytics.getAllRecommendations();

  const metrics: GLOverviewMetrics = {
    totalAccounts: aggregateMetrics.totalAccounts,
    totalJournals: aggregateMetrics.totalJournals,
    totalPostedJournals: aggregateMetrics.totalPostedJournals,
    totalEntries: aggregateMetrics.totalEntries,
    totalBatches: aggregateMetrics.totalBatches,
    totalOpenPeriods: aggregateMetrics.totalOpenPeriods,
    totalLedgers: aggregateMetrics.totalLedgers,
    totalAlerts: aggregateMetrics.totalAlerts,
    openAlerts: aggregateMetrics.activeAlerts,
    lastPeriodClose: aggregateMetrics.lastPeriodClose,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="General Ledger" description="Enterprise financial accounting engine" />
      <div className="mt-4 flex items-center gap-2">
        <DataFreshnessIndicator lastSeededAt={glService.seededAt} isPersisted={false} />
      </div>
      <GeneralLedgerDashboard
        metrics={metrics}
        accounts={allAccounts.map((a) => ({ id: a.id, name: a.name, number: a.accountNumber, category: a.category }))}
        journals={allJournals}
        periods={allPeriods}
        alerts={allAlerts}
        recommendations={allRecommendations}
      />
    </PageContainer>
  );
}

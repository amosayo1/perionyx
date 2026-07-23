import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { DataFreshnessIndicator } from "../../../../components/enterprise/data-freshness-indicator";
import { AccountingOverview } from "../../../../components/accounting/accounting-overview";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { AccountingAlerts } from "../../../../components/accounting/accounting-alerts";

export default function AccountingOverviewPage() {
  const accounts = accountingService.coa.getAllAccounts();
  const journals = accountingService.journal.getAllJournals();
  const kpis = accountingService.analytics.getAllKPIs();
  const metrics = {
    totalAccounts: accountingService.getTotalAccounts(),
    totalJournals: accountingService.getTotalJournals(),
    postedJournals: accountingService.getPostedJournals(),
    totalBalances: accountingService.getTotalBalances(),
    openPeriods: accountingService.getOpenPeriodsCount(),
    unpostedJournals: accountingService.journal.getDraftJournals().length + accountingService.journal.getJournalsByStatus("approved").length,
    exceptions: accountingService.reconciliation.getExceptions().length,
    unsettledIC: accountingService.intercompany.getUnsettled().length,
  };
  const alerts = [
    ...(metrics.exceptions > 0 ? [{ id: "recon-exceptions", severity: "critical" as const, title: "Reconciliation Exceptions", message: `${metrics.exceptions} exceptions require resolution before period close.` }] : []),
    ...(metrics.unsettledIC > 0 ? [{ id: "unsettled-ic", severity: "warning" as const, title: "Unsettled Intercompany", message: `${metrics.unsettledIC} intercompany journals remain unsettled.` }] : []),
    ...(metrics.unpostedJournals > 0 ? [{ id: "unposted-journals", severity: "info" as const, title: "Journals Pending Posting", message: `${metrics.unpostedJournals} draft or approved journals are not yet posted.` }] : []),
  ];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Accounting Overview" description="Enterprise accounting dashboard" />
      <div className="mt-6 space-y-6">
        <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
        <div className="flex items-center gap-2">
          <DataFreshnessIndicator lastSeededAt={accountingService.seededAt} isPersisted={false} />
        </div>
        <AccountingAlerts alerts={alerts} />
        <AccountingOverview metrics={metrics} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.slice(0, 4).map((kpi) => (
            <AccountingKPICard key={kpi.id} title={kpi.name} value={kpi.unit === "USD" ? `$${(kpi.value / 1e6).toFixed(1)}M` : kpi.value.toFixed(1)} subtitle={`Target: ${kpi.target}`} trend={kpi.trend} status={kpi.status} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

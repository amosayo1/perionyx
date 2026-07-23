import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingOverview } from "../../../../components/accounting/accounting-overview";
import { ExecutiveAccountingHeader } from "../../../../components/accounting/executive-accounting-header";
import { ExecutiveInsights } from "../../../../components/accounting/executive-insights";

export default function ExecutiveAccountingPage() {
  const accounts = accountingService.coa.getAllAccounts();
  const balances = accountingService.ledger.getAllBalances();
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
  const netIncome = accountingService.analytics.computeNetIncome(accounts, balances);
  const grossMargin = accountingService.analytics.computeGrossMargin(accounts, balances);
  const workingCapital = accountingService.analytics.computeWorkingCapital(accounts, balances);
  const currentRatio = accountingService.analytics.computeCurrentRatio(accounts, balances);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Accounting Summary" description="Board-level financial intelligence" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <ExecutiveAccountingHeader netIncome={netIncome} grossMargin={grossMargin} workingCapital={workingCapital} currentRatio={currentRatio} />
        <AccountingOverview metrics={metrics} />
        <ExecutiveInsights kpis={kpis} metrics={metrics} netIncome={netIncome} grossMargin={grossMargin} workingCapital={workingCapital} currentRatio={currentRatio} />
      </div>
    </PageContainer>
  );
}

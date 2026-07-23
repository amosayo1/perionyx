import { accountingService } from "../../../server/accounting";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../components/enterprise/deprecation-banner";
import { AccountingOverview } from "../../../components/accounting/accounting-overview";
import { JournalEntryTable } from "../../../components/accounting/journal-entry-table";

export default function AccountingPage() {
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
  const journals = accountingService.journal.getAllJournals();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Accounting" description="General ledger and enterprise accounting" />
      <div className="mt-6 space-y-6">
        <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
        <AccountingOverview metrics={metrics} />
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-300">Recent Journal Entries</h3>
          <JournalEntryTable journals={journals} max={25} />
        </div>
      </div>
    </PageContainer>
  );
}

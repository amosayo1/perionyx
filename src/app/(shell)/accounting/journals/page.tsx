import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { JournalEntryTable } from "../../../../components/accounting/journal-entry-table";

export default function JournalsPage() {
  const journals = accountingService.journal.getAllJournals();
  const byStatus = {
    draft: accountingService.journal.getJournalsByStatus("draft").length,
    posted: accountingService.journal.getJournalsByStatus("posted").length,
    approved: accountingService.journal.getJournalsByStatus("approved").length,
  };
  return (
    <PageContainer>
      <EnterprisePageHeader title="Journal Entries" description={`${journals.length} entries: ${byStatus.draft} draft, ${byStatus.approved} approved, ${byStatus.posted} posted`} />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6">
        <JournalEntryTable journals={journals} max={50} />
      </div>
    </PageContainer>
  );
}

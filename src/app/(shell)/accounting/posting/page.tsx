import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { PostingQueue } from "../../../../components/accounting/posting-queue";

export default function PostingPage() {
  const batches = accountingService.posting.getAllBatches();
  const unposted = accountingService.journal.getUnpostedJournals();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Posting Queue" description="Journal posting and batch management" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <AccountingKPICard title="Posting Batches" value={batches.length} />
          <AccountingKPICard title="Unposted Journals" value={unposted.length} status={unposted.length > 0 ? "warning" : "good"} />
          <AccountingKPICard title="Pending Batches" value={batches.filter((b) => b.status === "pending").length} />
        </div>
        <PostingQueue batches={batches} />
      </div>
    </PageContainer>
  );
}

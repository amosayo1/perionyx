import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { GLFilters } from "../../../../components/gl/gl-filters";
import { JournalEntryBoard } from "../../../../components/gl/journal-entry-board";
import { JournalApprovalQueue } from "../../../../components/gl/journal-approval-queue";

export default async function JournalsPage() {
  const journals = glService.journals.getAllJournals();
  const entries = glService.journals.getAllEntries();

  const totalJournals = journals.length;
  const postedCount = journals.filter((j) => j.status === "posted").length;
  const draftCount = journals.filter((j) => j.status === "draft").length;
  const approvedCount = journals.filter((j) => j.status === "approved").length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Journals"
        description="Journal entry management, approval, and posting"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Journals</p>
          <p className="text-2xl font-bold text-white">{totalJournals}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-400/70">Posted</p>
          <p className="text-2xl font-bold text-emerald-400">{postedCount}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400/70">Pending Approval</p>
          <p className="text-2xl font-bold text-blue-400">{approvedCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-4">
          <p className="text-xs text-zinc-400/70">Draft</p>
          <p className="text-2xl font-bold text-zinc-400">{draftCount}</p>
        </div>
      </div>
      <GLFilters />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JournalEntryBoard journals={journals} entries={entries} />
        </div>
        <div>
          <JournalApprovalQueue journals={journals} entries={entries} />
        </div>
      </div>
    </PageContainer>
  );
}

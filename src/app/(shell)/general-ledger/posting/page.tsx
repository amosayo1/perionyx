import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { PostingCenter } from "../../../../components/gl/posting-center";

export default async function PostingPage() {
  const batches = glService.posting.getAllBatches();
  const rules = glService.posting.getAllRules();
  const errors = glService.posting.getAllErrors();

  const errorCount = errors.length;
  const criticalErrors = errors.filter((e) => e.severity === "critical").length;
  const unresolvedErrors = errors.filter((e) => !e.resolved).length;
  const activeRules = rules.filter((r) => r.isActive).length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Posting Center"
        description="Batch posting, approval workflow, and error resolution"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Batches</p>
          <p className="text-2xl font-bold text-white">{batches.length}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400/70">Active Rules</p>
          <p className="text-2xl font-bold text-blue-400">{activeRules}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400/70">Unresolved Errors</p>
          <p className="text-2xl font-bold text-red-400">{unresolvedErrors}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400/70">Critical</p>
          <p className="text-2xl font-bold text-amber-400">{criticalErrors}</p>
        </div>
      </div>
      <PostingCenter batches={batches} />
      {errorCount > 0 && (
        <div className="rounded-lg border border-red-800/40 bg-red-950/20 p-4">
          <h3 className="mb-3 text-sm font-semibold text-red-300">Posting Errors ({errorCount})</h3>
          <div className="space-y-2">
            {errors.slice(0, 10).map((err) => (
              <div key={err.id} className="flex items-start justify-between rounded-md bg-zinc-900/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-red-300">[{err.errorCode}]</span>
                    <span className="text-xs text-zinc-400">{err.message}</span>
                  </div>
                  {err.journalId && <p className="mt-0.5 text-[11px] text-zinc-500">Journal: {err.journalId}</p>}
                </div>
                <span className="shrink-0 self-center rounded border border-red-800/40 bg-red-900/20 px-1.5 py-0.5 text-[10px] font-medium text-red-300">{err.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AllocationDashboard } from "../../../../components/gl/allocation-dashboard";

export default async function AllocationsPage() {
  const rules = glService.allocations.getAllRules();
  const runs = glService.allocations.getAllRuns();

  const activeRules = rules.filter((r) => r.isActive).length;
  const postedRuns = runs.filter((r) => r.status === "posted").length;
  const draftRuns = runs.filter((r) => r.status === "draft").length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Allocations"
        description="Cost and revenue allocation rules and run history"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Rules</p>
          <p className="text-2xl font-bold text-white">{rules.length}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400/70">Active Rules</p>
          <p className="text-2xl font-bold text-blue-400">{activeRules}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-400/70">Posted Runs</p>
          <p className="text-2xl font-bold text-emerald-400">{postedRuns}</p>
        </div>
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-4">
          <p className="text-xs text-zinc-400/70">Draft Runs</p>
          <p className="text-2xl font-bold text-zinc-400">{draftRuns}</p>
        </div>
      </div>
      <AllocationDashboard rules={rules} runs={runs} />
    </PageContainer>
  );
}

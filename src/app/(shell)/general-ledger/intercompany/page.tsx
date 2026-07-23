import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { IntercompanyEliminationBoard } from "../../../../components/gl/intercompany-elimination-board";
import type { TrialBalance } from "../../../../server/gl/types";

export default async function IntercompanyPage() {
  const icAccounts = glService.consolidation.getAllIntercompanyAccounts();
  const eliminationEntries = glService.consolidation.getEliminationEntries() as TrialBalance[];

  const eliminations = eliminationEntries.map((e) => ({
    id: e.id,
    fromEntity: e.accountName.includes("/") ? e.accountName.split("/")[0] ?? e.accountName : e.accountName,
    toEntity: e.accountName.includes("/") ? e.accountName.split("/")[1] ?? "Unknown" : "Unknown",
    amount: Math.abs(e.netMovement),
    status: e.netMovement === 0 ? "settled" : "unsettled" as const,
    date: e.createdAt,
  }));

  const unsettledCount = icAccounts.filter((a) => a.settlementStatus !== "settled").length;
  const totalDueTo = icAccounts.reduce((s, a) => s + a.dueTo, 0);
  const totalDueFrom = icAccounts.reduce((s, a) => s + a.dueFrom, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Intercompany"
        description="Intercompany accounts, eliminations, and consolidation"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">IC Accounts</p>
          <p className="text-2xl font-bold text-white">{icAccounts.length}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400/70">Unsettled</p>
          <p className="text-2xl font-bold text-red-400">{unsettledCount}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400/70">Due To</p>
          <p className="text-2xl font-bold text-blue-400">${totalDueTo.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400/70">Due From</p>
          <p className="text-2xl font-bold text-amber-400">${totalDueFrom.toLocaleString()}</p>
        </div>
      </div>
      <IntercompanyEliminationBoard icAccounts={icAccounts} eliminations={eliminations} />
    </PageContainer>
  );
}

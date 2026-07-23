import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ChartOfAccountsTree } from "../../../../components/gl/chart-of-accounts-tree";
import type { AccountCategory } from "../../../../server/gl/types";

export default async function ChartOfAccountsPage() {
  const accounts = glService.chartOfAccounts.getAllAccounts();
  const activeAccounts = accounts.filter((a) => a.isActive);

  const categoryCounts = new Map<AccountCategory, number>();
  for (const a of accounts) {
    categoryCounts.set(a.category, (categoryCounts.get(a.category) ?? 0) + 1);
  }

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Chart of Accounts"
        description="Complete account structure and hierarchy"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Accounts</p>
          <p className="text-2xl font-bold text-white">{accounts.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{activeAccounts.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Categories</p>
          <p className="text-2xl font-bold text-amber-400">{categoryCounts.size}</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Inactive</p>
          <p className="text-2xl font-bold text-zinc-400">{accounts.length - activeAccounts.length}</p>
        </div>
      </div>
      <ChartOfAccountsTree accounts={accounts} />
    </PageContainer>
  );
}

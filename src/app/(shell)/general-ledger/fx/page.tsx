import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FXRevaluationCenter } from "../../../../components/gl/fx-revaluation-center";
import type { CurrencyBalance } from "../../../../server/gl/types";

export default async function FXPage() {
  const rates = glService.revaluation.getAllRates();
  const revaluationEntriesRaw = glService.revaluation.getRevaluationEntries() as CurrencyBalance[];
  const accounts = glService.chartOfAccounts.getAllAccounts();
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const revaluationEntries = revaluationEntriesRaw.map((r) => {
    const account = accountMap.get(r.accountId);
    return {
      id: r.id,
      accountName: account?.name ?? r.accountId,
      currency: r.currency,
      originalAmount: r.beginningBalance,
      revaluedAmount: r.functionalAmount,
      gainLoss: r.functionalAmount - r.beginningBalance,
    };
  });

  const totalGL = revaluationEntries.reduce((s, r) => s + r.gainLoss, 0);
  const gainEntries = revaluationEntries.filter((r) => r.gainLoss >= 0);
  const lossEntries = revaluationEntries.filter((r) => r.gainLoss < 0);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="FX & Revaluation"
        description="Foreign currency exchange rates and revaluation management"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Exchange Rates</p>
          <p className="text-2xl font-bold text-white">{rates.length}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400/70">Revalued Entries</p>
          <p className="text-2xl font-bold text-blue-400">{revaluationEntries.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-400/70">FX Gains</p>
          <p className="text-2xl font-bold text-emerald-400">{gainEntries.length}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400/70">FX Losses</p>
          <p className="text-2xl font-bold text-red-400">{lossEntries.length}</p>
        </div>
      </div>
      <FXRevaluationCenter rates={rates} revaluationEntries={revaluationEntries} />
    </PageContainer>
  );
}

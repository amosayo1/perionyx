import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { TrialBalanceTable } from "../../../../components/gl/trial-balance-table";
import type { TrialBalance as TrialBalanceType, AccountCategory } from "../../../../server/gl/types";

const CATEGORY_ORDER: AccountCategory[] = [
  "assets", "contra-asset", "liabilities", "contra-liability", "equity",
  "revenue", "contra-revenue", "cogs", "expense", "contra-expense",
  "other-income", "other-expense", "statistical", "suspense", "memo",
];

function computeTrialBalance(): TrialBalanceType[] {
  const accounts = glService.chartOfAccounts.getAllAccounts();
  const balances = glService.ledger.getAllAccountBalances();
  const entries = glService.journals.getAllEntries();

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const balanceMap = new Map(balances.map((b) => [b.accountId, b]));

  for (const e of entries) {
    const existing = balanceMap.get(e.accountId);
    if (existing) {
      balanceMap.set(e.accountId, {
        ...existing,
        periodDebit: existing.periodDebit + e.debit,
        periodCredit: existing.periodCredit + e.credit,
        endingBalance: existing.endingBalance + e.debit - e.credit,
      });
    } else {
      balanceMap.set(e.accountId, {
        id: `entry-${e.id}`,
        accountId: e.accountId,
        periodId: "",
        fiscalYear: "",
        beginningBalance: 0,
        periodDebit: e.debit,
        periodCredit: e.credit,
        endingBalance: e.debit - e.credit,
        currency: e.currency,
        companyId: e.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return accounts.map((a) => {
    const b = balanceMap.get(a.id);
    const beginning = b?.beginningBalance ?? 0;
    const pDebit = b?.periodDebit ?? 0;
    const pCredit = b?.periodCredit ?? 0;
    const ending = b?.endingBalance ?? 0;
    return {
      id: `tb-${a.id}`,
      periodId: "",
      fiscalYear: "",
      accountId: a.id,
      accountNumber: a.accountNumber,
      accountName: a.name,
      category: a.category,
      beginningDebit: beginning >= 0 ? beginning : 0,
      beginningCredit: beginning < 0 ? -beginning : 0,
      periodDebit: pDebit,
      periodCredit: pCredit,
      endingDebit: ending >= 0 ? ending : 0,
      endingCredit: ending < 0 ? -ending : 0,
      netMovement: pDebit - pCredit,
      companyId: a.companyId,
      currency: "USD",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }).sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a.category);
    const bIdx = CATEGORY_ORDER.indexOf(b.category);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
}

export default async function TrialBalancePage() {
  const trialBalance = computeTrialBalance();

  const totalBeginningDebit = trialBalance.reduce((s, r) => s + r.beginningDebit, 0);
  const totalBeginningCredit = trialBalance.reduce((s, r) => s + r.beginningCredit, 0);
  const totalDebit = trialBalance.reduce((s, r) => s + r.periodDebit, 0);
  const totalCredit = trialBalance.reduce((s, r) => s + r.periodCredit, 0);
  const totalEndingDebit = trialBalance.reduce((s, r) => s + r.endingDebit, 0);
  const totalEndingCredit = trialBalance.reduce((s, r) => s + r.endingCredit, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Trial Balance"
        description="Account balance summary and cross-period comparison"
      />
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Accounts</p>
          <p className="text-2xl font-bold text-white">{trialBalance.length}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400/70">Period Debits</p>
          <p className="text-2xl font-bold text-blue-400">${totalDebit.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400/70">Period Credits</p>
          <p className="text-2xl font-bold text-amber-400">${totalCredit.toLocaleString()}</p>
        </div>
      </div>
      <TrialBalanceTable trialBalance={trialBalance} />
    </PageContainer>
  );
}

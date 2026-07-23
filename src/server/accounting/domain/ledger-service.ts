import type { AccountBalance, TrialBalanceRow, AccountIdentifier } from "../types";

export class LedgerService {
  private balances = new Map<string, AccountBalance>();

  addBalance(balance: AccountBalance): void {
    this.balances.set(balance.id, balance);
  }

  getBalance(id: string): AccountBalance | undefined {
    return this.balances.get(id);
  }

  getAllBalances(): AccountBalance[] {
    return [...this.balances.values()];
  }

  getBalancesByPeriod(periodId: string): AccountBalance[] {
    return this.getAllBalances().filter((b) => b.periodId === periodId);
  }

  getBalancesByAccount(accountId: AccountIdentifier): AccountBalance[] {
    return this.getAllBalances().filter((b) => b.accountId === accountId);
  }

  getBalancesByCompany(companyId: string): AccountBalance[] {
    return this.getAllBalances().filter((b) => b.companyId === companyId);
  }

  getBalanceForAccountPeriod(
    accountId: AccountIdentifier,
    periodId: string,
  ): AccountBalance | undefined {
    return this.getAllBalances().find(
      (b) => b.accountId === accountId && b.periodId === periodId,
    );
  }

  generateTrialBalance(
    periodId: string,
    accounts: Array<{ id: AccountIdentifier; code: string; name: string; type: string; normalBalance: string; level: number }>,
  ): TrialBalanceRow[] {
    const periodBalances = this.getBalancesByPeriod(periodId);
    return accounts.map((a) => {
      const bal = periodBalances.find((b) => b.accountId === a.id);
      return {
        accountId: a.id,
        accountCode: a.code,
        accountName: a.name,
        accountType: a.type as any,
        normalBalance: a.normalBalance as any,
        level: a.level,
        beginningBalance: bal ? bal.beginningDebit - bal.beginningCredit : 0,
        periodDebit: bal ? bal.periodDebit : 0,
        periodCredit: bal ? bal.periodCredit : 0,
        endingBalance: bal ? bal.endingBalance : 0,
      };
    });
  }

  count(): number {
    return this.balances.size;
  }
}

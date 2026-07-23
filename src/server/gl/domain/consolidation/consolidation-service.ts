import type { IntercompanyAccount, TrialBalance, FinancialStatement } from "../../types";

export class ConsolidationService {
  private intercompanyAccounts = new Map<string, IntercompanyAccount>();
  private eliminationEntries: TrialBalance[] = [];

  addIntercompanyAccount(account: IntercompanyAccount): IntercompanyAccount {
    this.intercompanyAccounts.set(account.id, account);
    return account;
  }

  getIntercompanyAccount(id: string): IntercompanyAccount | undefined {
    return this.intercompanyAccounts.get(id);
  }

  getAllIntercompanyAccounts(): IntercompanyAccount[] {
    return Array.from(this.intercompanyAccounts.values());
  }

  getUnsettledIntercompanyAccounts(): IntercompanyAccount[] {
    return this.getAllIntercompanyAccounts().filter(a => a.settlementStatus !== "settled");
  }

  eliminateIntercompany(entries: TrialBalance[]): TrialBalance[] {
    const eliminations: TrialBalance[] = [];
    const icAccounts = this.getAllIntercompanyAccounts();
    for (const ic of icAccounts) {
      if (ic.dueTo > 0 || ic.dueFrom > 0) {
        const elimination: TrialBalance = {
          id: `elim-${ic.id}`,
          periodId: entries[0]?.periodId || "",
          fiscalYear: entries[0]?.fiscalYear || "",
          accountId: ic.accountId,
          accountNumber: `ELIM-${ic.accountId}`,
          accountName: `Elimination - Intercompany ${ic.fromCompanyId}/${ic.toCompanyId}`,
          category: "liabilities",
          beginningDebit: 0,
          beginningCredit: 0,
          periodDebit: ic.dueFrom,
          periodCredit: ic.dueTo,
          endingDebit: ic.dueFrom,
          endingCredit: ic.dueTo,
          netMovement: ic.dueFrom - ic.dueTo,
          companyId: ic.companyId,
          currency: ic.currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        eliminations.push(elimination);
      }
    }
    this.eliminationEntries.push(...eliminations);
    return eliminations;
  }

  getEliminationEntries(): TrialBalance[] {
    return this.eliminationEntries;
  }

  consolidateStatements(statements: FinancialStatement[]): FinancialStatement | undefined {
    if (statements.length === 0) return undefined;
    const consolidated = { ...statements[0] };
    consolidated.id = `consolidated-${Date.now()}`;
    consolidated.name = "Consolidated Financial Statement";
    for (let i = 1; i < statements.length; i++) {
      const s = statements[i];
      if (consolidated.totalAssets !== undefined && s.totalAssets !== undefined)
        consolidated.totalAssets += s.totalAssets;
      if (consolidated.totalLiabilities !== undefined && s.totalLiabilities !== undefined)
        consolidated.totalLiabilities += s.totalLiabilities;
      if (consolidated.totalEquity !== undefined && s.totalEquity !== undefined)
        consolidated.totalEquity += s.totalEquity;
      if (consolidated.totalRevenue !== undefined && s.totalRevenue !== undefined)
        consolidated.totalRevenue += s.totalRevenue;
      if (consolidated.totalExpense !== undefined && s.totalExpense !== undefined)
        consolidated.totalExpense += s.totalExpense;
      if (consolidated.netIncome !== undefined && s.netIncome !== undefined)
        consolidated.netIncome += s.netIncome;
    }
    return consolidated;
  }

  count(): number {
    return this.intercompanyAccounts.size;
  }
}

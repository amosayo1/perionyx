import type {
  FinancialStatement, FinancialStatementRow, FinancialStatementType,
  Account, AccountBalance, TrialBalanceRow,
} from "../types";

export class StatementsService {
  private statements = new Map<string, FinancialStatement>();

  addStatement(s: FinancialStatement): void {
    this.statements.set(s.id, s);
  }

  getStatement(id: string): FinancialStatement | undefined {
    return this.statements.get(id);
  }

  getAllStatements(): FinancialStatement[] {
    return [...this.statements.values()];
  }

  getByType(type: FinancialStatementType): FinancialStatement[] {
    return this.getAllStatements().filter((s) => s.type === type);
  }

  getByPeriod(periodId: string): FinancialStatement[] {
    return this.getAllStatements().filter((s) => s.periodId === periodId);
  }

  generateTrialBalance(
    rows: TrialBalanceRow[],
    companyId: string,
    periodId: string,
  ): FinancialStatement {
    const totalDebit = rows.reduce((s, r) => s + r.periodDebit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.periodCredit, 0);
    const statementRows = rows.map((r, i) => {
      const row: FinancialStatementRow = {
        id: `tb_row_${i}`,
        statementId: `tb_${periodId}`,
        accountId: r.accountId,
        accountCode: r.accountCode,
        accountName: r.accountName,
        level: r.level,
        type: "account",
        amount: r.endingBalance,
        isBold: false,
        isItalic: false,
        indent: r.level,
        order: i,
      };
      return row;
    });
    return {
      id: `tb_${periodId}`,
      type: "trial-balance",
      companyId,
      periodId,
      name: `Trial Balance - Period ${periodId}`,
      currency: "USD",
      rows: statementRows,
      totalDebits: totalDebit,
      totalCredits: totalCredit,
      generatedBy: "system",
      generatedAt: new Date(),
      status: "draft",
    };
  }

  count(): number {
    return this.statements.size;
  }
}

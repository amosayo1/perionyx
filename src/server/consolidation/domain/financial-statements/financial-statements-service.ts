import type { FinancialStatementSet, FinancialStatementEntry, FinancialStatementType } from "../../types";

export class FinancialStatementsService {
  private items = new Map<string, FinancialStatementSet>();

  add(statement: FinancialStatementSet): void { this.items.set(statement.id, statement); }

  get(id: string): FinancialStatementSet | undefined { return this.items.get(id); }

  getAll(): FinancialStatementSet[] { return Array.from(this.items.values()); }

  getByConsolidationRun(runId: string): FinancialStatementSet[] {
    return this.getAll().filter((s) => s.consolidationRunId === runId);
  }

  getByPeriod(periodId: string): FinancialStatementSet[] {
    return this.getAll().filter((s) => s.periodId === periodId);
  }

  getByType(type: FinancialStatementType): FinancialStatementSet[] {
    return this.getAll().filter((s) => s.statementType === type);
  }

  generateBalanceSheet(
    runId: string,
    periodId: string,
    currency: string,
    entries: FinancialStatementEntry[],
  ): FinancialStatementSet {
    const totalAssets = entries.filter((e) => e.section === "assets").reduce((s, e) => s + e.amount, 0);
    const totalLiabilities = entries.filter((e) => e.section === "liabilities").reduce((s, e) => s + e.amount, 0);
    const totalEquity = entries.filter((e) => e.section === "equity").reduce((s, e) => s + e.amount, 0);
    const record: FinancialStatementSet = {
      id: crypto.randomUUID(),
      consolidationRunId: runId,
      periodId,
      statementType: "balanceSheet",
      label: "Balance Sheet",
      currency,
      entries,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashFromOperations: 0,
      cashFromInvesting: 0,
      cashFromFinancing: 0,
      netCashChange: 0,
      beginningCash: 0,
      endingCash: 0,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  generateIncomeStatement(
    runId: string,
    periodId: string,
    currency: string,
    entries: FinancialStatementEntry[],
  ): FinancialStatementSet {
    const totalRevenue = entries.filter((e) => e.section === "revenue").reduce((s, e) => s + e.amount, 0);
    const totalExpenses = entries.filter((e) => e.section === "expenses").reduce((s, e) => s + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const record: FinancialStatementSet = {
      id: crypto.randomUUID(),
      consolidationRunId: runId,
      periodId,
      statementType: "incomeStatement",
      label: "Income Statement",
      currency,
      entries,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue,
      totalExpenses,
      netIncome,
      cashFromOperations: 0,
      cashFromInvesting: 0,
      cashFromFinancing: 0,
      netCashChange: 0,
      beginningCash: 0,
      endingCash: 0,
      isBalanced: true,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  generateCashFlow(
    runId: string,
    periodId: string,
    currency: string,
    entries: FinancialStatementEntry[],
  ): FinancialStatementSet {
    const cashFromOperations = entries.filter((e) => e.section === "operating").reduce((s, e) => s + e.amount, 0);
    const cashFromInvesting = entries.filter((e) => e.section === "investing").reduce((s, e) => s + e.amount, 0);
    const cashFromFinancing = entries.filter((e) => e.section === "financing").reduce((s, e) => s + e.amount, 0);
    const netCashChange = cashFromOperations + cashFromInvesting + cashFromFinancing;
    const record: FinancialStatementSet = {
      id: crypto.randomUUID(),
      consolidationRunId: runId,
      periodId,
      statementType: "cashFlow",
      label: "Cash Flow Statement",
      currency,
      entries,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashFromOperations,
      cashFromInvesting,
      cashFromFinancing,
      netCashChange,
      beginningCash: 0,
      endingCash: 0,
      isBalanced: true,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  generateEquityChanges(
    runId: string,
    periodId: string,
    currency: string,
    entries: FinancialStatementEntry[],
  ): FinancialStatementSet {
    const totalEquity = entries.filter((e) => e.section === "equity").reduce((s, e) => s + e.amount, 0);
    const record: FinancialStatementSet = {
      id: crypto.randomUUID(),
      consolidationRunId: runId,
      periodId,
      statementType: "equityChanges",
      label: "Statement of Changes in Equity",
      currency,
      entries,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashFromOperations: 0,
      cashFromInvesting: 0,
      cashFromFinancing: 0,
      netCashChange: 0,
      beginningCash: 0,
      endingCash: 0,
      isBalanced: true,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  generateTrialBalance(
    runId: string,
    periodId: string,
    currency: string,
    entries: FinancialStatementEntry[],
  ): FinancialStatementSet {
    const totalDebits = entries.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const totalCredits = entries.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
    const record: FinancialStatementSet = {
      id: crypto.randomUUID(),
      consolidationRunId: runId,
      periodId,
      statementType: "trialBalance",
      label: "Trial Balance",
      currency,
      entries,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashFromOperations: 0,
      cashFromInvesting: 0,
      cashFromFinancing: 0,
      netCashChange: 0,
      beginningCash: 0,
      endingCash: 0,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  checkBalance(id: string): boolean {
    const statement = this.items.get(id);
    if (!statement) return false;
    if (statement.statementType !== "balanceSheet") return false;
    return Math.abs(statement.totalAssets - (statement.totalLiabilities + statement.totalEquity)) < 0.01;
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<FinancialStatementSet>): FinancialStatementSet {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`FinancialStatementSet ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void { this.items.delete(id); }
}

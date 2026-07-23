import type {
  FinancialStatement, BalanceSheet, IncomeStatement, CashFlowStatement, RetainedEarnings, StatementType
} from "../../types";

export class FinancialStatementService {
  private statements = new Map<string, FinancialStatement>();
  private balanceSheets = new Map<string, BalanceSheet>();
  private incomeStatements = new Map<string, IncomeStatement>();
  private cashFlowStatements = new Map<string, CashFlowStatement>();
  private retainedEarnings = new Map<string, RetainedEarnings>();

  addStatement(stmt: FinancialStatement): FinancialStatement {
    this.statements.set(stmt.id, stmt);
    return stmt;
  }

  getStatement(id: string): FinancialStatement | undefined {
    return this.statements.get(id);
  }

  getAllStatements(): FinancialStatement[] {
    return Array.from(this.statements.values());
  }

  getByType(type: StatementType): FinancialStatement[] {
    return this.getAllStatements().filter(s => s.type === type);
  }

  getByPeriod(periodId: string): FinancialStatement[] {
    return this.getAllStatements().filter(s => s.periodId === periodId);
  }

  addBalanceSheet(bs: BalanceSheet): BalanceSheet {
    this.balanceSheets.set(bs.id, bs);
    return bs;
  }

  getBalanceSheet(id: string): BalanceSheet | undefined {
    return this.balanceSheets.get(id);
  }

  getAllBalanceSheets(): BalanceSheet[] {
    return Array.from(this.balanceSheets.values());
  }

  addIncomeStatement(is_: IncomeStatement): IncomeStatement {
    this.incomeStatements.set(is_.id, is_);
    return is_;
  }

  getIncomeStatement(id: string): IncomeStatement | undefined {
    return this.incomeStatements.get(id);
  }

  getAllIncomeStatements(): IncomeStatement[] {
    return Array.from(this.incomeStatements.values());
  }

  addCashFlowStatement(cf: CashFlowStatement): CashFlowStatement {
    this.cashFlowStatements.set(cf.id, cf);
    return cf;
  }

  getCashFlowStatement(id: string): CashFlowStatement | undefined {
    return this.cashFlowStatements.get(id);
  }

  getAllCashFlowStatements(): CashFlowStatement[] {
    return Array.from(this.cashFlowStatements.values());
  }

  addRetainedEarnings(re: RetainedEarnings): RetainedEarnings {
    this.retainedEarnings.set(re.id, re);
    return re;
  }

  getRetainedEarnings(id: string): RetainedEarnings | undefined {
    return this.retainedEarnings.get(id);
  }

  getAllRetainedEarnings(): RetainedEarnings[] {
    return Array.from(this.retainedEarnings.values());
  }

  count(): number {
    return this.statements.size;
  }
}

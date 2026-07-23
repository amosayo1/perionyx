import type {
  AccountingKPI, AccountingForecast, Account, AccountBalance,
  JournalEntry, FinancialStatement, TrialBalanceRow,
} from "../types";

export class AnalyticsService {
  private kpis = new Map<string, AccountingKPI>();
  private forecasts = new Map<string, AccountingForecast>();

  addKPI(kpi: AccountingKPI): void {
    this.kpis.set(kpi.id, kpi);
  }

  getKPI(id: string): AccountingKPI | undefined {
    return this.kpis.get(id);
  }

  getAllKPIs(): AccountingKPI[] {
    return [...this.kpis.values()];
  }

  addForecast(f: AccountingForecast): void {
    this.forecasts.set(f.id, f);
  }

  getForecast(id: string): AccountingForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): AccountingForecast[] {
    return [...this.forecasts.values()];
  }

  computeNetIncome(
    accounts: Account[],
    balances: AccountBalance[],
  ): number {
    const revenueIds = accounts.filter((a) => a.type === "revenue").map((a) => a.id);
    const expenseTypes = ["cost-of-sales", "operating-expense", "other-expense", "tax"];
    const expenseIds = accounts.filter((a) => expenseTypes.includes(a.type)).map((a) => a.id);

    const revenue = balances
      .filter((b) => revenueIds.includes(b.accountId))
      .reduce((s, b) => s + b.endingBalance, 0);
    const expenses = balances
      .filter((b) => expenseIds.includes(b.accountId))
      .reduce((s, b) => s + b.endingBalance, 0);

    return revenue - expenses;
  }

  computeGrossMargin(accounts: Account[], balances: AccountBalance[]): number {
    const revenue = accounts
      .filter((a) => a.type === "revenue")
      .reduce((s, a) => {
        const b = balances.find((bal) => bal.accountId === a.id);
        return s + (b ? b.endingBalance : 0);
      }, 0);
    const cos = accounts
      .filter((a) => a.type === "cost-of-sales")
      .reduce((s, a) => {
        const b = balances.find((bal) => bal.accountId === a.id);
        return s + (b ? b.endingBalance : 0);
      }, 0);
    return revenue > 0 ? ((revenue - cos) / revenue) * 100 : 0;
  }

  computeOperatingMargin(accounts: Account[], balances: AccountBalance[]): number {
    const revenue = accounts
      .filter((a) => a.type === "revenue")
      .reduce((s, a) => {
        const b = balances.find((bal) => bal.accountId === a.id);
        return s + (b ? b.endingBalance : 0);
      }, 0);
    const opExpenses = accounts
      .filter((a) => a.type === "operating-expense" || a.type === "cost-of-sales")
      .reduce((s, a) => {
        const b = balances.find((bal) => bal.accountId === a.id);
        return s + (b ? b.endingBalance : 0);
      }, 0);
    return revenue > 0 ? ((revenue - opExpenses) / revenue) * 100 : 0;
  }

  computeWorkingCapital(accounts: Account[], balances: AccountBalance[]): number {
    const currentAssetIds = accounts.filter((a) => a.class === "current-asset").map((a) => a.id);
    const currentLiabilityIds = accounts.filter((a) => a.class === "current-liability").map((a) => a.id);
    const assets = balances.filter((b) => currentAssetIds.includes(b.accountId)).reduce((s, b) => s + b.endingBalance, 0);
    const liabilities = balances.filter((b) => currentLiabilityIds.includes(b.accountId)).reduce((s, b) => s + b.endingBalance, 0);
    return assets - liabilities;
  }

  computeCurrentRatio(accounts: Account[], balances: AccountBalance[]): number {
    const currentAssetIds = accounts.filter((a) => a.class === "current-asset").map((a) => a.id);
    const currentLiabilityIds = accounts.filter((a) => a.class === "current-liability").map((a) => a.id);
    const assets = balances.filter((b) => currentAssetIds.includes(b.accountId)).reduce((s, b) => s + b.endingBalance, 0);
    const liabilities = balances.filter((b) => currentLiabilityIds.includes(b.accountId)).reduce((s, b) => s + b.endingBalance, 0);
    return liabilities > 0 ? assets / liabilities : 0;
  }

  count(): number {
    return this.kpis.size + this.forecasts.size;
  }
}

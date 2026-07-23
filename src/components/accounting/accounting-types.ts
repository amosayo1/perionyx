import type {
  Account, JournalEntry, JournalLine, AccountingPeriod,
  FiscalYear, AccountBalance, TrialBalanceRow, Reconciliation,
  AllocationRule, AllocationRun, IntercompanyJournal, Consolidation,
  Budget, BudgetItem, AuditEvent, AccountingKPI, AccountingForecast,
  FinancialStatement, FinancialStatementRow, PostingBatch,
  AccountType, JournalStatus, PostingStatus, PeriodStatus,
  CloseProcess,
} from "../../server/accounting/types";

export interface AccountingOverviewMetrics {
  totalAccounts: number;
  totalJournals: number;
  postedJournals: number;
  totalBalances: number;
  openPeriods: number;
  unpostedJournals: number;
  exceptions: number;
  unsettledIC: number;
}

export type {
  Account, JournalEntry, JournalLine, AccountingPeriod,
  FiscalYear, AccountBalance, TrialBalanceRow, Reconciliation,
  AllocationRule, AllocationRun, IntercompanyJournal, Consolidation,
  Budget, BudgetItem, AuditEvent, AccountingKPI, AccountingForecast,
  FinancialStatement, FinancialStatementRow, PostingBatch,
  AccountType, JournalStatus, PostingStatus, PeriodStatus,
  CloseProcess,
};

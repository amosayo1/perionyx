import type {
  ChartOfAccount, Account, CostCenter, ProfitCenter, BusinessUnit, Segment, Dimension,
  Ledger, SubLedger, Journal, JournalEntry, PostingBatch, PostingRule, PostingTemplate,
  PostingTemplateEntry, AccountingPeriod, FiscalYear, ClosingChecklist, TrialBalance,
  AccountBalance, LedgerBalance, CurrencyBalance, ExchangeRateReference, AllocationRule,
  AllocationRun, AllocationRunEntry, RecurringJournal, AccrualJournal, ReversalJournal,
  StatisticalAccount, FinancialStatementSection, FinancialStatementLine, FinancialStatement,
  BalanceSheet, IncomeStatement, CashFlowStatement, RetainedEarnings, IntercompanyAccount,
  AuditEntry, PostingError, ApprovalLevel, ApprovalWorkflow, DocumentReference,
  SupportingDocument, JournalAttachment, GLAnalyticsKPI, GLAlert, GLRecommendation,
  GLAggregateMetrics,
  AccountCategory, AccountType, JournalSource, PostingStatus, PeriodStatus, CloseStatus,
  DebitCredit, DimensionType, AllocationMethod, StatementType, LedgerType, SubLedgerType,
} from "../../server/gl/types";

export type {
  ChartOfAccount, Account, CostCenter, ProfitCenter, BusinessUnit, Segment, Dimension,
  Ledger, SubLedger, Journal, JournalEntry, PostingBatch, PostingRule, PostingTemplate,
  PostingTemplateEntry, AccountingPeriod, FiscalYear, ClosingChecklist, TrialBalance,
  AccountBalance, LedgerBalance, CurrencyBalance, ExchangeRateReference, AllocationRule,
  AllocationRun, AllocationRunEntry, RecurringJournal, AccrualJournal, ReversalJournal,
  StatisticalAccount, FinancialStatementSection, FinancialStatementLine, FinancialStatement,
  BalanceSheet, IncomeStatement, CashFlowStatement, RetainedEarnings, IntercompanyAccount,
  AuditEntry, PostingError, ApprovalLevel, ApprovalWorkflow, DocumentReference,
  SupportingDocument, JournalAttachment, GLAnalyticsKPI, GLAlert, GLRecommendation,
  GLAggregateMetrics,
  AccountCategory, AccountType, JournalSource, PostingStatus, PeriodStatus, CloseStatus,
  DebitCredit, DimensionType, AllocationMethod, StatementType, LedgerType, SubLedgerType,
};

export interface GLOverviewMetrics {
  totalAccounts: number;
  totalJournals: number;
  totalPostedJournals: number;
  totalEntries: number;
  totalBatches: number;
  totalOpenPeriods: number;
  totalLedgers: number;
  totalAlerts: number;
  openAlerts: number;
  lastPeriodClose?: string;
}

export interface ExecutiveGLHeaderProps {
  totalAccounts: number;
  totalJournals: number;
  totalPostedJournals: number;
  totalOpenPeriods: number;
  totalLedgers: number;
  activeAlerts: number;
}

export interface GLChartDataPoint {
  period: string;
  value: number;
  previousValue?: number;
  forecast?: number;
  upperBound?: number;
  lowerBound?: number;
}

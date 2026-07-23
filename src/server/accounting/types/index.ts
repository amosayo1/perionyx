export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "cost-of-sales"
  | "operating-expense"
  | "other-income"
  | "other-expense"
  | "tax"
  | "memo"
  | "custom";

export type AccountClass =
  | "current-asset"
  | "non-current-asset"
  | "current-liability"
  | "non-current-liability"
  | "equity"
  | "revenue"
  | "expense"
  | "contra-asset"
  | "contra-liability"
  | "contra-equity"
  | "contra-revenue"
  | "suspense";

export type AccountNormalBalance = "debit" | "credit";

export type AccountStatus = "active" | "inactive" | "frozen" | "closed";

export type JournalStatus =
  | "draft"
  | "approved"
  | "posted"
  | "reversed"
  | "voided";

export type JournalType =
  | "standard"
  | "recurring"
  | "adjusting"
  | "reversing"
  | "closing"
  | "opening"
  | "intercompany"
  | "allocations"
  | "consolidation"
  | "template";

export type PostingStatus =
  | "pending"
  | "validated"
  | "posting"
  | "posted"
  | "failed"
  | "reversed";

export type PostingMode = "automatic" | "manual" | "batch" | "scheduled";

export type PeriodStatus =
  | "open"
  | "soft-close"
  | "hard-close"
  | "locked";

export type PeriodType = "monthly" | "quarterly" | "semi-annual" | "annual";

export type CloseType = "monthly" | "quarterly" | "annual" | "year-end";

export type AllocationMethod =
  | "percentage"
  | "fixed-amount"
  | "headcount"
  | "revenue"
  | "square-footage"
  | "transaction-count"
  | "custom-formula";

export type FinancialStatementType =
  | "trial-balance"
  | "balance-sheet"
  | "income-statement"
  | "cash-flow"
  | "equity-statement"
  | "general-ledger"
  | "account-activity";

export type AccountIdentifier = string;

export interface Account {
  id: AccountIdentifier;
  code: string;
  name: string;
  description: string;
  type: AccountType;
  class: AccountClass;
  normalBalance: AccountNormalBalance;
  status: AccountStatus;
  parentId?: AccountIdentifier;
  level: number;
  path: string;
  currency: string;
  companyId: string;
  isControlAccount: boolean;
  allowManualPosting: boolean;
  taxCode?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  journalNumber: string;
  type: JournalType;
  status: JournalStatus;
  description: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  source: string;
  sourceId?: string;
  companyId: string;
  legalEntityId?: string;
  periodId: string;
  currency: string;
  exchangeRate: number;
  approvedBy?: string;
  approvedAt?: Date;
  postedBy?: string;
  postedAt?: Date;
  reversedById?: string;
  reversedAt?: Date;
  voidedBy?: string;
  voidedAt?: Date;
  recurrenceId?: string;
  templateId?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalLine {
  id: string;
  journalId: string;
  accountId: AccountIdentifier;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  currency: string;
  exchangeRate: number;
  costCenter?: string;
  profitCenter?: string;
  department?: string;
  businessUnit?: string;
  project?: string;
  allocationId?: string;
  intercompanyId?: string;
  reference?: string;
  customerRef?: string;
  vendorRef?: string;
}

export interface RecurringJournal {
  id: string;
  name: string;
  description: string;
  template: Omit<JournalEntry, "id" | "journalNumber" | "status" | "createdAt" | "updatedAt">;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "semi-annual" | "annual" | "custom";
  intervalDays?: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  nextRunDate: Date;
  lastRunDate?: Date;
  isActive: boolean;
  maxOccurrences?: number;
  occurrenceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountingPeriod {
  id: string;
  fiscalYearId: string;
  name: string;
  type: PeriodType;
  startDate: Date;
  endDate: Date;
  status: PeriodStatus;
  sequence: number;
  isAdjustingPeriod: boolean;
  closedBy?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiscalYear {
  id: string;
  name: string;
  companyId: string;
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
  closedBy?: string;
  closedAt?: Date;
  periods: AccountingPeriod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CloseProcess {
  id: string;
  periodId: string;
  type: CloseType;
  status: "in-progress" | "completed" | "failed" | "reversed";
  steps: CloseStep[];
  startedBy: string;
  startedAt: Date;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloseStep {
  id: string;
  name: string;
  type: "validation" | "reconciliation" | "accrual" | "adjustment" | "reversal" | "closing" | "report";
  status: "pending" | "in-progress" | "completed" | "failed" | "skipped";
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  result?: string;
  error?: string;
}

export interface AccountBalance {
  id: string;
  accountId: AccountIdentifier;
  periodId: string;
  companyId: string;
  beginningDebit: number;
  beginningCredit: number;
  periodDebit: number;
  periodCredit: number;
  endingDebit: number;
  endingCredit: number;
  netChange: number;
  endingBalance: number;
  currency: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrialBalanceRow {
  accountId: AccountIdentifier;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: AccountNormalBalance;
  level: number;
  beginningBalance: number;
  periodDebit: number;
  periodCredit: number;
  endingBalance: number;
}

export interface Reconciliation {
  id: string;
  type: "bank" | "ledger" | "intercompany" | "account" | "suspense";
  accountId: AccountIdentifier;
  periodId: string;
  statementDate: Date;
  statementBalance: number;
  ledgerBalance: number;
  difference: number;
  status: "in-progress" | "completed" | "exception" | "approved";
  items: ReconciliationItem[];
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationItem {
  id: string;
  reconciliationId: string;
  type: "deposit" | "withdrawal" | "fee" | "interest" | "adjustment" | "cleared" | "uncleared" | "discrepancy";
  amount: number;
  date: Date;
  description: string;
  matched: boolean;
  source: "statement" | "ledger";
  reference?: string;
}

export interface AllocationRule {
  id: string;
  name: string;
  description: string;
  sourceAccountId: AccountIdentifier;
  targetAccountIds: AccountIdentifier[];
  method: AllocationMethod;
  percentages?: Record<string, number>;
  fixedAmounts?: Record<string, number>;
  basisSource?: "headcount" | "revenue" | "square-footage" | "transaction-count";
  costCenters: string[];
  profitCenters: string[];
  departments: string[];
  isActive: boolean;
  frequency: "monthly" | "quarterly" | "annual" | "one-time";
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllocationRun {
  id: string;
  ruleId: string;
  periodId: string;
  totalAmount: number;
  journalId?: string;
  status: "draft" | "executed" | "posted" | "failed";
  allocations: Array<{
    targetAccountId: AccountIdentifier;
    amount: number;
    costCenter?: string;
    profitCenter?: string;
  }>;
  executedBy: string;
  executedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntercompanyJournal {
  id: string;
  fromCompanyId: string;
  toCompanyId: string;
  fromJournalId: string;
  toJournalId: string;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  description: string;
  type: "due-to" | "due-from" | "settlement" | "elimination";
  status: "draft" | "approved" | "posted" | "settled";
  settledAt?: Date;
  settledById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consolidation {
  id: string;
  parentCompanyId: string;
  childCompanyId: string;
  periodId: string;
  ownershipPercent: number;
  method: "full" | "equity" | "proportionate";
  minorityInterest: number;
  status: "draft" | "calculated" | "reviewed" | "posted";
  eliminationEntries: JournalEntry[];
  translationAdjustments: Array<{
    accountId: AccountIdentifier;
    originalAmount: number;
    translatedAmount: number;
    exchangeRate: number;
  }>;
  calculatedBy: string;
  calculatedAt: Date;
  postedBy?: string;
  postedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  fiscalYearId: string;
  companyId: string;
  type: "operating" | "capital" | "cash" | "revenue" | "expense";
  status: "draft" | "active" | "locked" | "archived";
  items: BudgetItem[];
  totalAmount: number;
  version: number;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  accountId: AccountIdentifier;
  periodId: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  action: "create" | "update" | "delete" | "post" | "reverse" | "void" | "approve" | "close" | "lock" | "unlock";
  entityType: "journal" | "account" | "period" | "reconciliation" | "allocation" | "intercompany" | "consolidation" | "budget" | "close";
  entityId: string;
  userId: string;
  userName: string;
  changes: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  source: string;
  ipAddress?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface AccountingKPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  category: "profitability" | "liquidity" | "leverage" | "efficiency" | "growth";
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
  companyId: string;
  periodId: string;
  date: Date;
}

export interface AccountingForecast {
  id: string;
  companyId: string;
  metric: "revenue" | "expense" | "net-income" | "ebitda" | "cash" | "working-capital";
  period: string;
  currentValue: number;
  forecastValue: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
  date: Date;
}

export interface FinancialStatement {
  id: string;
  type: FinancialStatementType;
  companyId: string;
  periodId: string;
  name: string;
  currency: string;
  rows: FinancialStatementRow[];
  totalDebits: number;
  totalCredits: number;
  generatedBy: string;
  generatedAt: Date;
  status: "draft" | "reviewed" | "approved" | "final";
}

export interface FinancialStatementRow {
  id: string;
  statementId: string;
  accountId?: AccountIdentifier;
  accountCode?: string;
  accountName: string;
  level: number;
  type: "header" | "account" | "total" | "subtotal";
  amount: number;
  previousAmount?: number;
  variance?: number;
  variancePercent?: number;
  isBold: boolean;
  isItalic: boolean;
  indent: number;
  order: number;
}

export interface PostingBatch {
  id: string;
  name: string;
  mode: PostingMode;
  journalIds: string[];
  totalJournals: number;
  postedJournals: number;
  failedJournals: number;
  status: PostingStatus;
  startedBy: string;
  startedAt: Date;
  completedAt?: Date;
  errors: PostingError[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostingError {
  journalId: string;
  journalNumber: string;
  code: string;
  message: string;
  details?: string;
}

export type AccountCategory =
  | "assets" | "liabilities" | "equity" | "revenue" | "expense" | "cogs"
  | "other-income" | "other-expense" | "statistical" | "suspense" | "memo"
  | "contra-asset" | "contra-liability" | "contra-revenue" | "contra-expense";
export type AccountType = "balance-sheet" | "income-statement" | "statistical" | "memo" | "suspense";
export type JournalSource =
  | "manual" | "recurring" | "accrual" | "reversing" | "adjustment" | "allocation"
  | "intercompany" | "fx" | "tax" | "treasury" | "investment" | "system"
  | "opening" | "closing" | "year-end";
export type PostingStatus = "draft" | "approved" | "posted" | "reversed" | "error";
export type PeriodStatus = "open" | "soft-close" | "hard-close" | "locked" | "reopened";
export type CloseStatus = "not-started" | "in-progress" | "completed" | "verified" | "exceptions";
export type DebitCredit = "debit" | "credit";
export type DimensionType = "cost-center" | "profit-center" | "business-unit" | "department" | "project" | "region" | "product";
export type AllocationMethod = "driver-based" | "percentage" | "headcount" | "revenue" | "square-footage" | "manual";
export type StatementType = "balance-sheet" | "income-statement" | "cash-flow" | "retained-earnings";
export type LedgerType = "primary" | "secondary" | "consolidation";
export type SubLedgerType = "accounts-payable" | "accounts-receivable" | "fixed-assets" | "inventory" | "tax" | "payroll" | "other";

export interface ChartOfAccount {
  id: string; name: string; description: string; type: AccountType; category: AccountCategory;
  number: string; parentId?: string; companyId: string; isActive: boolean;
  effectiveFrom: Date; effectiveTo?: Date; naturalAccountType?: string; controlAccountId?: string;
  summaryAccountId?: string; createdAt: Date; updatedAt: Date;
}

export interface Account {
  id: string; chartOfAccountId: string; accountNumber: string; name: string; description: string;
  category: AccountCategory; type: AccountType; parentId?: string; isActive: boolean;
  isControlAccount?: boolean; isSummaryAccount?: boolean; naturalBalance: DebitCredit;
  currency?: string; effectiveFrom: Date; effectiveTo?: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CostCenter {
  id: string; code: string; name: string; description: string; managerId?: string;
  department?: string; isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ProfitCenter {
  id: string; code: string; name: string; description: string; managerId?: string;
  region?: string; isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface BusinessUnit {
  id: string; code: string; name: string; description: string; headId?: string;
  isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Segment {
  id: string; code: string; name: string; type: DimensionType; description?: string;
  isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Dimension {
  id: string; segmentId: string; code: string; name: string; description?: string;
  isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Ledger {
  id: string; code: string; name: string; description: string; type: LedgerType;
  currency: string; companyId: string; isActive: boolean; createdAt: Date; updatedAt: Date;
}

export interface SubLedger {
  id: string; ledgerId: string; code: string; name: string; description: string;
  type: SubLedgerType; companyId: string; isActive: boolean; createdAt: Date; updatedAt: Date;
}

export interface Journal {
  id: string; journalNumber: string; description: string; source: JournalSource;
  status: PostingStatus; totalDebit: number; totalCredit: number; currency: string;
  postingDate?: Date; approvedBy?: string; approvedAt?: Date; postedBy?: string;
  postedAt?: Date; reversedBy?: string; reversedAt?: Date; reversalJournalId?: string;
  reference?: string; companyId: string; entityId?: string; periodId?: string;
  fiscalYear?: string; createdAt: Date; updatedAt: Date;
}

export interface JournalEntry {
  id: string; journalId: string; accountId: string; description?: string;
  debit: number; credit: number; currency: string; exchangeRate: number;
  costCenterId?: string; profitCenterId?: string; businessUnitId?: string;
  dimension1?: string; dimension2?: string; dimension3?: string;
  reference?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface PostingBatch {
  id: string; batchNumber: string; description: string; entriesCount: number;
  totalDebit: number; totalCredit: number; status: PostingStatus;
  approvedBy?: string; approvedAt?: Date; postedBy?: string; postedAt?: Date;
  error?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface PostingRule {
  id: string; code: string; name: string; description: string;
  debitAccountId?: string; creditAccountId?: string; condition?: string;
  isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface PostingTemplate {
  id: string; code: string; name: string; description: string;
  entries: PostingTemplateEntry[]; isActive: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface PostingTemplateEntry {
  accountId: string; debit?: boolean; credit?: boolean; description?: string;
}

export interface AccountingPeriod {
  id: string; period: string; fiscalYear: string; startDate: Date; endDate: Date;
  status: PeriodStatus; isAdjustmentPeriod?: boolean; closeDate?: Date;
  lockedBy?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface FiscalYear {
  id: string; year: string; startDate: Date; endDate: Date; isOpen: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ClosingChecklist {
  id: string; periodId: string; fiscalYear: string; step: string; status: CloseStatus;
  assignedTo?: string; completedBy?: string; completedAt?: Date; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TrialBalance {
  id: string; periodId: string; fiscalYear: string; accountId: string;
  accountNumber: string; accountName: string; category: AccountCategory;
  beginningDebit: number; beginningCredit: number;
  periodDebit: number; periodCredit: number;
  endingDebit: number; endingCredit: number; netMovement: number;
  companyId: string; entityId?: string; ledgerId?: string; currency: string;
  createdAt: Date; updatedAt: Date;
}

export interface AccountBalance {
  id: string; accountId: string; periodId: string; fiscalYear: string;
  beginningBalance: number; periodDebit: number; periodCredit: number;
  endingBalance: number; currency: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface LedgerBalance {
  id: string; ledgerId: string; periodId: string; fiscalYear: string;
  totalDebit: number; totalCredit: number; netBalance: number; currency: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CurrencyBalance {
  id: string; accountId: string; currency: string; periodId: string; fiscalYear: string;
  beginningBalance: number; periodDebit: number; periodCredit: number; endingBalance: number;
  exchangeRate: number; functionalAmount: number; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ExchangeRateReference {
  id: string; fromCurrency: string; toCurrency: string; rate: number;
  rateType: "historical" | "spot" | "average" | "closing"; date: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface AllocationRule {
  id: string; code: string; name: string; description: string;
  sourceAccountId: string[]; targetAccountId: string[]; method: AllocationMethod;
  percentage?: number; driverId?: string; schedule?: string; isActive: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface AllocationRunEntry {
  targetAccountId: string; amount: number; percentage: number;
}

export interface AllocationRun {
  id: string; ruleId: string; periodId: string; fiscalYear: string;
  totalAmount: number; entries: AllocationRunEntry[]; status: "draft" | "posted" | "reversed";
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface RecurringJournal {
  id: string; code: string; name: string; description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  templateId?: string; nextRunDate: Date; lastRunDate?: Date; isActive: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface AccrualJournal {
  id: string; journalId: string; accrualType: "expense" | "revenue" | "payroll" | "interest" | "other";
  periodId: string; fiscalYear: string; amount: number; reversalDate: Date;
  isReversed: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ReversalJournal {
  id: string; originalJournalId: string; reversalJournalId?: string;
  reversalDate: Date; reason: string; reversedBy: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface StatisticalAccount {
  id: string; accountId: string; unit: "count" | "hours" | "square-feet" | "percentage" | "other";
  quantity: number; periodId: string; fiscalYear: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface FinancialStatementSection {
  name: string; items: FinancialStatementLine[];
}

export interface FinancialStatementLine {
  label: string; accountNumber?: string; amount: number; indent?: number;
}

export interface FinancialStatement {
  id: string; type: StatementType; name: string; periodId: string; fiscalYear: string;
  currency: string; sections: FinancialStatementSection[];
  totalAssets?: number; totalLiabilities?: number; totalEquity?: number;
  totalRevenue?: number; totalExpense?: number; netIncome?: number;
  operatingCashFlow?: number; investingCashFlow?: number; financingCashFlow?: number;
  companyId: string; entityId?: string; createdAt: Date; updatedAt: Date;
}

export interface BalanceSheet {
  id: string; statementId: string; periodId: string; fiscalYear: string;
  totalAssets: number; totalLiabilities: number; totalEquity: number;
  currentAssets: number; nonCurrentAssets: number;
  currentLiabilities: number; nonCurrentLiabilities: number;
  retainedEarnings: number; workingCapital: number;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface IncomeStatement {
  id: string; statementId: string; periodId: string; fiscalYear: string;
  totalRevenue: number; totalExpense: number; grossProfit: number;
  operatingIncome: number; netIncome: number; ebitda: number; ebit: number;
  costOfGoodsSold: number; operatingExpenses: number;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CashFlowStatement {
  id: string; statementId: string; periodId: string; fiscalYear: string;
  operatingCashFlow: number; investingCashFlow: number; financingCashFlow: number;
  netCashFlow: number; beginningCash: number; endingCash: number; freeCashFlow: number;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface RetainedEarnings {
  id: string; statementId: string; periodId: string; fiscalYear: string;
  beginningRetainedEarnings: number; netIncome: number; dividends: number;
  endingRetainedEarnings: number; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface IntercompanyAccount {
  id: string; fromCompanyId: string; toCompanyId: string; accountId: string;
  dueTo: number; dueFrom: number; currency: string;
  settlementStatus: "unsettled" | "partial" | "settled"; lastSettlementDate?: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface AuditEntry {
  id: string; entityType: string; entityId: string; action: string;
  userId: string; userName: string; details?: string;
  timestamp: Date; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface PostingError {
  id: string; journalId?: string; batchId?: string; errorCode: string;
  message: string; severity: "warning" | "error" | "critical"; resolved: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ApprovalLevel {
  level: number; approverId: string; approverName: string;
  minAmount?: number; maxAmount?: number;
  status: "pending" | "approved" | "rejected"; comment?: string; timestamp?: Date;
}

export interface ApprovalWorkflow {
  id: string; entityType: string; entityId: string;
  status: "pending" | "approved" | "rejected"; currentLevel: number;
  levels: ApprovalLevel[]; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface DocumentReference {
  id: string; entityType: string; entityId: string; documentType: string;
  documentNumber: string; description?: string; url?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface SupportingDocument {
  id: string; referenceId: string; fileName: string; fileType: string;
  fileSize: number; storagePath: string; uploadedBy: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface JournalAttachment {
  id: string; journalId: string; fileName: string; fileType: string;
  description?: string; uploadedBy: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface GLAnalyticsKPI {
  name: string; value: number; previousValue: number; target: number;
  unit: string; category: string;
  trend: "up" | "down" | "stable"; status: "good" | "warning" | "critical";
}

export interface GLAlert {
  id: string; severity: "critical" | "warning" | "info"; type: string;
  title: string; message: string; actionRequired: boolean; dismissed: boolean;
  companyId: string; createdAt: Date;
}

export interface GLRecommendation {
  id: string; type: string; title: string; description: string;
  impact: string; confidence: number; companyId: string; implemented: boolean; createdAt: Date;
}

export interface GLAggregateMetrics {
  totalAccounts: number;
  totalJournals: number;
  totalPostedJournals: number;
  totalEntries: number;
  totalBatches: number;
  totalPeriods: number;
  totalOpenPeriods: number;
  totalLedgers: number;
  totalCostCenters: number;
  totalProfitCenters: number;
  totalBusinessUnits: number;
  totalAllocationRules: number;
  totalRecurringJournals: number;
  totalFinancialStatements: number;
  totalActiveRules: number;
  totalAlerts: number;
  activeAlerts: number;
  totalRecommendations: number;
  pendingRecommendations: number;
  balanceSheetDate?: string;
  lastPeriodClose?: string;
}

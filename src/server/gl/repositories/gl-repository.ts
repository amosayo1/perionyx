import type {
  Account, Journal, JournalEntry, PostingBatch, AccountingPeriod, FiscalYear,
  Ledger, SubLedger, AccountBalance, LedgerBalance, TrialBalance,
  AllocationRule, AllocationRun, ExchangeRateReference, FinancialStatement,
  BalanceSheet, IncomeStatement, CashFlowStatement, RetainedEarnings,
  IntercompanyAccount, AuditEntry, PostingError, CostCenter, ProfitCenter,
  BusinessUnit, Segment, Dimension, ClosingChecklist, RecurringJournal,
  AccrualJournal, ReversalJournal, StatisticalAccount,
} from "../types";

export interface GeneralLedgerRepository {
  // Chart of Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  saveAccount(account: Account): Promise<void>;
  deleteAccount(id: string): Promise<boolean>;

  // Journals
  getJournals(): Promise<Journal[]>;
  getJournal(id: string): Promise<Journal | undefined>;
  saveJournal(journal: Journal): Promise<void>;
  getJournalEntries(journalId: string): Promise<JournalEntry[]>;
  saveJournalEntry(entry: JournalEntry): Promise<void>;

  // Posting
  getPostingBatches(): Promise<PostingBatch[]>;
  savePostingBatch(batch: PostingBatch): Promise<void>;

  // Periods
  getPeriods(): Promise<AccountingPeriod[]>;
  savePeriod(period: AccountingPeriod): Promise<void>;
  getFiscalYears(): Promise<FiscalYear[]>;
  saveFiscalYear(fy: FiscalYear): Promise<void>;

  // Ledger
  getLedgers(): Promise<Ledger[]>;
  saveLedger(ledger: Ledger): Promise<void>;
  getLedgerBalances(): Promise<LedgerBalance[]>;
  saveLedgerBalance(balance: LedgerBalance): Promise<void>;
  getAccountBalances(): Promise<AccountBalance[]>;
  saveAccountBalance(balance: AccountBalance): Promise<void>;

  // Subledger
  getSubLedgers(): Promise<SubLedger[]>;
  saveSubLedger(subledger: SubLedger): Promise<void>;

  // Allocations
  getAllocationRules(): Promise<AllocationRule[]>;
  saveAllocationRule(rule: AllocationRule): Promise<void>;
  getAllocationRuns(): Promise<AllocationRun[]>;
  saveAllocationRun(run: AllocationRun): Promise<void>;

  // FX
  getExchangeRates(): Promise<ExchangeRateReference[]>;
  saveExchangeRate(rate: ExchangeRateReference): Promise<void>;

  // Financial Statements
  getFinancialStatements(): Promise<FinancialStatement[]>;
  saveFinancialStatement(stmt: FinancialStatement): Promise<void>;
  getBalanceSheets(): Promise<BalanceSheet[]>;
  saveBalanceSheet(bs: BalanceSheet): Promise<void>;
  getIncomeStatements(): Promise<IncomeStatement[]>;
  saveIncomeStatement(is_: IncomeStatement): Promise<void>;
  getCashFlowStatements(): Promise<CashFlowStatement[]>;
  saveCashFlowStatement(cf: CashFlowStatement): Promise<void>;
  getRetainedEarnings(): Promise<RetainedEarnings[]>;
  saveRetainedEarnings(re: RetainedEarnings): Promise<void>;

  // Intercompany
  getIntercompanyAccounts(): Promise<IntercompanyAccount[]>;
  saveIntercompanyAccount(account: IntercompanyAccount): Promise<void>;

  // Audit
  getAuditEntries(): Promise<AuditEntry[]>;
  saveAuditEntry(entry: AuditEntry): Promise<void>;

  // Errors
  getPostingErrors(): Promise<PostingError[]>;
  savePostingError(error: PostingError): Promise<void>;
}

export class InMemoryGeneralLedgerRepository implements GeneralLedgerRepository {
  private accounts = new Map<string, Account>();
  private journals = new Map<string, Journal>();
  private entries = new Map<string, JournalEntry[]>();
  private batches = new Map<string, PostingBatch>();
  private periods = new Map<string, AccountingPeriod>();
  private fiscalYears = new Map<string, FiscalYear>();
  private ledgers = new Map<string, Ledger>();
  private subledgers = new Map<string, SubLedger>();
  private ledgerBalances = new Map<string, LedgerBalance>();
  private accountBalances = new Map<string, AccountBalance>();
  private allocRules = new Map<string, AllocationRule>();
  private allocRuns = new Map<string, AllocationRun>();
  private rates = new Map<string, ExchangeRateReference>();
  private statements = new Map<string, FinancialStatement>();
  private balanceSheets = new Map<string, BalanceSheet>();
  private incomeStatements = new Map<string, IncomeStatement>();
  private cashFlowStatements = new Map<string, CashFlowStatement>();
  private retainedEarnings = new Map<string, RetainedEarnings>();
  private intercompanyAccounts = new Map<string, IntercompanyAccount>();
  private auditEntries: AuditEntry[] = [];
  private postingErrors = new Map<string, PostingError>();

  async getAccounts(): Promise<Account[]> { return Array.from(this.accounts.values()); }
  async getAccount(id: string): Promise<Account | undefined> { return this.accounts.get(id); }
  async saveAccount(account: Account): Promise<void> { this.accounts.set(account.id, account); }
  async deleteAccount(id: string): Promise<boolean> { return this.accounts.delete(id); }
  async getJournals(): Promise<Journal[]> { return Array.from(this.journals.values()); }
  async getJournal(id: string): Promise<Journal | undefined> { return this.journals.get(id); }
  async saveJournal(journal: Journal): Promise<void> { this.journals.set(journal.id, journal); }
  async getJournalEntries(journalId: string): Promise<JournalEntry[]> { return this.entries.get(journalId) || []; }
  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const existing = this.entries.get(entry.journalId) || [];
    const idx = existing.findIndex(e => e.id === entry.id);
    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);
    this.entries.set(entry.journalId, existing);
  }
  async getPostingBatches(): Promise<PostingBatch[]> { return Array.from(this.batches.values()); }
  async savePostingBatch(batch: PostingBatch): Promise<void> { this.batches.set(batch.id, batch); }
  async getPeriods(): Promise<AccountingPeriod[]> { return Array.from(this.periods.values()); }
  async savePeriod(period: AccountingPeriod): Promise<void> { this.periods.set(period.id, period); }
  async getFiscalYears(): Promise<FiscalYear[]> { return Array.from(this.fiscalYears.values()); }
  async saveFiscalYear(fy: FiscalYear): Promise<void> { this.fiscalYears.set(fy.id, fy); }
  async getLedgers(): Promise<Ledger[]> { return Array.from(this.ledgers.values()); }
  async saveLedger(ledger: Ledger): Promise<void> { this.ledgers.set(ledger.id, ledger); }
  async getLedgerBalances(): Promise<LedgerBalance[]> { return Array.from(this.ledgerBalances.values()); }
  async saveLedgerBalance(balance: LedgerBalance): Promise<void> { this.ledgerBalances.set(`${balance.ledgerId}-${balance.periodId}`, balance); }
  async getAccountBalances(): Promise<AccountBalance[]> { return Array.from(this.accountBalances.values()); }
  async saveAccountBalance(balance: AccountBalance): Promise<void> { this.accountBalances.set(`${balance.accountId}-${balance.periodId}`, balance); }
  async getSubLedgers(): Promise<SubLedger[]> { return Array.from(this.subledgers.values()); }
  async saveSubLedger(subledger: SubLedger): Promise<void> { this.subledgers.set(subledger.id, subledger); }
  async getAllocationRules(): Promise<AllocationRule[]> { return Array.from(this.allocRules.values()); }
  async saveAllocationRule(rule: AllocationRule): Promise<void> { this.allocRules.set(rule.id, rule); }
  async getAllocationRuns(): Promise<AllocationRun[]> { return Array.from(this.allocRuns.values()); }
  async saveAllocationRun(run: AllocationRun): Promise<void> { this.allocRuns.set(run.id, run); }
  async getExchangeRates(): Promise<ExchangeRateReference[]> { return Array.from(this.rates.values()); }
  async saveExchangeRate(rate: ExchangeRateReference): Promise<void> { this.rates.set(rate.id, rate); }
  async getFinancialStatements(): Promise<FinancialStatement[]> { return Array.from(this.statements.values()); }
  async saveFinancialStatement(stmt: FinancialStatement): Promise<void> { this.statements.set(stmt.id, stmt); }
  async getBalanceSheets(): Promise<BalanceSheet[]> { return Array.from(this.balanceSheets.values()); }
  async saveBalanceSheet(bs: BalanceSheet): Promise<void> { this.balanceSheets.set(bs.id, bs); }
  async getIncomeStatements(): Promise<IncomeStatement[]> { return Array.from(this.incomeStatements.values()); }
  async saveIncomeStatement(is_: IncomeStatement): Promise<void> { this.incomeStatements.set(is_.id, is_); }
  async getCashFlowStatements(): Promise<CashFlowStatement[]> { return Array.from(this.cashFlowStatements.values()); }
  async saveCashFlowStatement(cf: CashFlowStatement): Promise<void> { this.cashFlowStatements.set(cf.id, cf); }
  async getRetainedEarnings(): Promise<RetainedEarnings[]> { return Array.from(this.retainedEarnings.values()); }
  async saveRetainedEarnings(re: RetainedEarnings): Promise<void> { this.retainedEarnings.set(re.id, re); }
  async getIntercompanyAccounts(): Promise<IntercompanyAccount[]> { return Array.from(this.intercompanyAccounts.values()); }
  async saveIntercompanyAccount(account: IntercompanyAccount): Promise<void> { this.intercompanyAccounts.set(account.id, account); }
  async getAuditEntries(): Promise<AuditEntry[]> { return this.auditEntries; }
  async saveAuditEntry(entry: AuditEntry): Promise<void> { this.auditEntries.push(entry); }
  async getPostingErrors(): Promise<PostingError[]> { return Array.from(this.postingErrors.values()); }
  async savePostingError(error: PostingError): Promise<void> { this.postingErrors.set(error.id, error); }
}

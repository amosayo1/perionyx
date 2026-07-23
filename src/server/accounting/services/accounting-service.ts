import { ChartOfAccountsService } from "../domain/chart-of-accounts-service";
import { JournalService } from "../domain/journal-service";
import { PostingService } from "../domain/posting-service";
import { LedgerService } from "../domain/ledger-service";
import { PeriodsService } from "../domain/periods-service";
import { ReconciliationService } from "../domain/reconciliation-service";
import { AllocationsService } from "../domain/allocations-service";
import { IntercompanyService } from "../domain/intercompany-service";
import { ConsolidationService } from "../domain/consolidation-service";
import { StatementsService } from "../domain/statements-service";
import { BudgetsService } from "../domain/budgets-service";
import { AuditService } from "../domain/audit-service";
import { AnalyticsService } from "../domain/analytics-service";

export class AccountingService {
  public coa: ChartOfAccountsService;
  public journal: JournalService;
  public posting: PostingService;
  public ledger: LedgerService;
  public periods: PeriodsService;
  public reconciliation: ReconciliationService;
  public allocations: AllocationsService;
  public intercompany: IntercompanyService;
  public consolidation: ConsolidationService;
  public statements: StatementsService;
  public budgets: BudgetsService;
  public audit: AuditService;
  public analytics: AnalyticsService;
  /** Timestamp when in-memory data was last seeded. Set once per process lifetime. */
  public readonly seededAt: Date = new Date();

  constructor() {
    this.coa = new ChartOfAccountsService();
    this.journal = new JournalService();
    this.posting = new PostingService();
    this.ledger = new LedgerService();
    this.periods = new PeriodsService();
    this.reconciliation = new ReconciliationService();
    this.allocations = new AllocationsService();
    this.intercompany = new IntercompanyService();
    this.consolidation = new ConsolidationService();
    this.statements = new StatementsService();
    this.budgets = new BudgetsService();
    this.audit = new AuditService();
    this.analytics = new AnalyticsService();
  }

  getTotalAccounts(): number {
    return this.coa.count();
  }

  getTotalJournals(): number {
    return this.journal.count();
  }

  getPostedJournals(): number {
    return this.posting.count();
  }

  getTotalBalances(): number {
    return this.ledger.count();
  }

  getOpenPeriodsCount(): number {
    return this.periods.getOpenPeriods().length;
  }
}

export const accountingService = new AccountingService();

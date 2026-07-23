import { ChartOfAccountsService } from "../domain/chart-of-accounts/coa-service";
import { JournalService } from "../domain/journals/journal-service";
import { PostingService } from "../domain/posting/posting-service";
import { PeriodsService } from "../domain/periods/periods-service";
import { LedgerService } from "../domain/ledger/ledger-service";
import { SubLedgerService } from "../domain/subledger/subledger-service";
import { AllocationService } from "../domain/allocations/allocations-service";
import { RevaluationService } from "../domain/revaluation/revaluation-service";
import { ConsolidationService } from "../domain/consolidation/consolidation-service";
import { FinancialStatementService } from "../domain/financial-statements/fs-service";
import { AnalyticsService } from "../domain/analytics/analytics-service";
import type { GLAggregateMetrics } from "../types";

export class GeneralLedgerService {
  chartOfAccounts: ChartOfAccountsService;
  journals: JournalService;
  posting: PostingService;
  periods: PeriodsService;
  ledger: LedgerService;
  subledger: SubLedgerService;
  allocations: AllocationService;
  revaluation: RevaluationService;
  consolidation: ConsolidationService;
  financialStatements: FinancialStatementService;
  analytics: AnalyticsService;
  /** Timestamp when in-memory data was last seeded. Set once per process lifetime. */
  readonly seededAt: Date = new Date();

  constructor() {
    this.chartOfAccounts = new ChartOfAccountsService();
    this.journals = new JournalService();
    this.posting = new PostingService();
    this.periods = new PeriodsService();
    this.ledger = new LedgerService();
    this.subledger = new SubLedgerService();
    this.allocations = new AllocationService();
    this.revaluation = new RevaluationService();
    this.consolidation = new ConsolidationService();
    this.financialStatements = new FinancialStatementService();
    this.analytics = new AnalyticsService();
  }

  getAggregateMetrics(): GLAggregateMetrics {
    const allAccounts = this.chartOfAccounts.getAllAccounts();
    const allJournals = this.journals.getAllJournals();
    const allPeriods = this.periods.getAllPeriods();
    const allLedgers = this.ledger.getAllLedgers();
    const allStatements = this.financialStatements.getAllStatements();
    const allAlerts = this.analytics.getAllAlerts();
    const allRecommendations = this.analytics.getAllRecommendations();
    const lastClosed = [...allPeriods].filter(p => p.status === "hard-close").sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];

    return {
      totalAccounts: allAccounts.length,
      totalJournals: allJournals.length,
      totalPostedJournals: allJournals.filter(j => j.status === "posted").length,
      totalEntries: this.journals.countEntries(),
      totalBatches: this.posting.count(),
      totalPeriods: allPeriods.length,
      totalOpenPeriods: allPeriods.filter(p => p.status === "open" || p.status === "reopened").length,
      totalLedgers: allLedgers.length,
      totalCostCenters: 0,
      totalProfitCenters: 0,
      totalBusinessUnits: 0,
      totalAllocationRules: this.allocations.count(),
      totalRecurringJournals: allJournals.filter(j => j.source === "recurring").length,
      totalFinancialStatements: allStatements.length,
      totalActiveRules: this.posting.countRules(),
      totalAlerts: allAlerts.length,
      activeAlerts: allAlerts.filter(a => !a.dismissed).length,
      totalRecommendations: allRecommendations.length,
      pendingRecommendations: allRecommendations.filter(r => !r.implemented).length,
      balanceSheetDate: allStatements.filter(s => s.type === "balance-sheet").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.fiscalYear,
      lastPeriodClose: lastClosed?.period,
    };
  }
}

export const glService = new GeneralLedgerService();

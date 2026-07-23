import { CloseManagementService } from "../domain/close-management/close-management-service";
import { CloseCalendarService } from "../domain/close-calendar/close-calendar-service";
import { TaskEngineService } from "../domain/task-engine/task-engine-service";
import { ChecklistEngineService } from "../domain/checklist-engine/checklist-engine-service";
import { ReconciliationService } from "../domain/reconciliation/reconciliation-service";
import { AccountReconciliationService } from "../domain/account-reconciliation/account-reconciliation-service";
import { IntercompanyReconciliationService } from "../domain/intercompany-reconciliation/intercompany-reconciliation-service";
import { JournalReviewService } from "../domain/journal-review/journal-review-service";
import { ApprovalsService } from "../domain/approvals/approvals-service";
import { VarianceAnalysisService } from "../domain/variance-analysis/variance-analysis-service";
import { CloseDashboardService } from "../domain/close-dashboard/close-dashboard-service";
import { CloseAnalyticsService } from "../domain/close-analytics/close-analytics-service";
import { RecommendationsService } from "../domain/recommendations/recommendations-service";
import { AlertsService } from "../domain/alerts/alerts-service";
import { ExecutiveInsightsService } from "../domain/executive-insights/executive-insights-service";
import type { AggregateCloseMetrics, ExecutiveCloseSummary } from "../types";

export class FinancialCloseService {
  closeManagement: CloseManagementService;
  closeCalendar: CloseCalendarService;
  taskEngine: TaskEngineService;
  checklistEngine: ChecklistEngineService;
  reconciliation: ReconciliationService;
  accountReconciliation: AccountReconciliationService;
  intercompanyReconciliation: IntercompanyReconciliationService;
  journalReview: JournalReviewService;
  approvals: ApprovalsService;
  varianceAnalysis: VarianceAnalysisService;
  closeDashboard: CloseDashboardService;
  analytics: CloseAnalyticsService;
  recommendations: RecommendationsService;
  alerts: AlertsService;
  executiveInsights: ExecutiveInsightsService;

  constructor() {
    this.closeManagement = new CloseManagementService();
    this.closeCalendar = new CloseCalendarService();
    this.taskEngine = new TaskEngineService();
    this.checklistEngine = new ChecklistEngineService();
    this.reconciliation = new ReconciliationService();
    this.accountReconciliation = new AccountReconciliationService();
    this.intercompanyReconciliation = new IntercompanyReconciliationService();
    this.journalReview = new JournalReviewService();
    this.approvals = new ApprovalsService();
    this.varianceAnalysis = new VarianceAnalysisService();
    this.closeDashboard = new CloseDashboardService();
    this.analytics = new CloseAnalyticsService();
    this.recommendations = new RecommendationsService();
    this.alerts = new AlertsService();
    this.executiveInsights = new ExecutiveInsightsService();
  }

  getAggregateMetrics(): AggregateCloseMetrics {
    return this.analytics.calculateAggregateMetrics(
      this.closeManagement.getAll(), this.taskEngine.getAll(),
      this.reconciliation.getAll(), this.accountReconciliation.getAll(),
      this.journalReview.getAll(), this.approvals.getAll(),
      [...this.alerts.getAll().filter((a) => !a.isResolved).map((a) => ({ status: a.isResolved ? "resolved" : "open", severity: a.severity } as never as import("../types").ExceptionRecord))],
    );
  }

  getExecutiveSummary(): ExecutiveCloseSummary {
    return this.analytics.calculateExecutiveSummary(
      this.closeManagement.getAll(), this.taskEngine.getAll(),
      this.reconciliation.getAll(), this.approvals.getAll(),
      [...this.alerts.getAll().filter((a) => !a.isResolved).map((a) => ({
        status: a.isResolved ? "resolved" : "open",
        severity: a.severity,
        periodId: a.periodId ?? "",
        category: a.type,
        id: a.id,
        title: a.title,
        description: a.message,
        assignedTo: undefined,
        companyId: a.companyId,
        createdAt: a.createdAt,
        updatedAt: a.createdAt,
        resolvedAt: undefined,
        resolvedBy: undefined,
        resolution: undefined,
      } as import("../types").ExceptionRecord))],
      this.journalReview.getAll(), this.accountReconciliation.getAll(),
      this.varianceAnalysis.getAll(),
    );
  }

  getReadinessScore(): number {
    const periods = this.closeManagement.getActive();
    if (periods.length === 0) return 0;
    const period = periods[0];
    return this.closeDashboard.calculateReadinessScore(
      period, this.taskEngine.getByPeriod(period.id),
      this.reconciliation.getByPeriod(period.id), this.approvals.getByPeriod(period.id),
      this.accountReconciliation.getByPeriod(period.id),
      this.varianceAnalysis.getByPeriod(period.id),
      [...this.alerts.getAll().filter((a) => !a.isResolved).map((a) => ({
        status: a.isResolved ? "resolved" : "open",
        severity: a.severity,
        periodId: a.periodId ?? "",
        category: a.type,
        id: a.id,
        title: a.title,
        description: a.message,
        assignedTo: undefined,
        companyId: a.companyId,
        createdAt: a.createdAt,
        updatedAt: a.createdAt,
        resolvedAt: undefined,
        resolvedBy: undefined,
        resolution: undefined,
      } as import("../types").ExceptionRecord))],
    ).score;
  }
}

export const fcService = new FinancialCloseService();

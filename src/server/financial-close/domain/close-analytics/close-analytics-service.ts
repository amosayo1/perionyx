import type { CloseMetric, AggregateCloseMetrics, ExecutiveCloseSummary, ClosePeriod, CloseTask, ReconciliationRecord, ApprovalRecord, ExceptionRecord, AccountReconciliation, JournalReviewRecord, VarianceAnalysisRecord } from "../../types";

export class CloseAnalyticsService {
  private metrics = new Map<string, CloseMetric>();

  addMetric(m: CloseMetric): CloseMetric {
    this.metrics.set(m.id, m);
    return m;
  }

  getMetric(id: string): CloseMetric | undefined {
    return this.metrics.get(id);
  }

  getAllMetrics(): CloseMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetricsByCategory(category: string): CloseMetric[] {
    return this.getAllMetrics().filter((m) => m.category === category);
  }

  deleteMetric(id: string): void {
    this.metrics.delete(id);
  }

  calculateAggregateMetrics(
    periods: ClosePeriod[], tasks: CloseTask[], reconciliations: ReconciliationRecord[],
    accountRecs: AccountReconciliation[], journals: JournalReviewRecord[],
    approvals: ApprovalRecord[], exceptions: ExceptionRecord[],
  ): AggregateCloseMetrics {
    const activePeriods = periods.filter((p) => p.status === "inProgress" || p.status === "review").length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
    const now = new Date();
    const overdueTasks = tasks.filter((t) => t.dueDate < now && t.status !== "completed" && t.status !== "skipped").length;
    const pendingApprovals = approvals.filter((a) => a.status === "pending").length;
    const openExceptions = exceptions.filter((e) => e.status === "open" || e.status === "inProgress").length;
    const closedPeriods = periods.filter((p) => p.status === "locked" || p.status === "archived");
    const totalCloses = closedPeriods.length;
    const onTime = closedPeriods.filter((p) => p.actualCloseDate && p.actualCloseDate <= p.targetCloseDate).length;
    const avgDays = closedPeriods.length > 0 ? closedPeriods.reduce((s, p) => s + p.daysToClose, 0) / closedPeriods.length : 0;

    return {
      totalPeriods: periods.length, activePeriods, totalTasks: tasks.length, completedTasks, blockedTasks,
      overdueTasks, pendingApprovals, openReconciliations: reconciliations.filter((r) => r.status !== "approved").length,
      completedReconciliations: reconciliations.filter((r) => r.status === "approved").length,
      openExceptions, criticalExceptions: exceptions.filter((e) => e.severity === "critical" || e.severity === "blocker").length,
      averageDaysToClose: Math.round(avgDays * 10) / 10, closeReadinessScore: 0,
      onTimeCloses: onTime, totalCloses, onTimePercentage: totalCloses > 0 ? (onTime / totalCloses) * 100 : 0,
    } as AggregateCloseMetrics;
  }

  calculateExecutiveSummary(
    periods: ClosePeriod[], tasks: CloseTask[],
    reconciliations: ReconciliationRecord[], approvals: ApprovalRecord[],
    exceptions: ExceptionRecord[], journals: JournalReviewRecord[],
    accountRecs: AccountReconciliation[], _variances: VarianceAnalysisRecord[],
  ): ExecutiveCloseSummary {
    const active = periods.find((p) => p.status === "inProgress" || p.status === "review" || p.status === "notStarted");
    const allTasks = tasks;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const totalTasks = allTasks.length;
    const blockedTasks = allTasks.filter((t) => t.status === "blocked").length;
    const now = new Date();
    const overdueTasks = allTasks.filter((t) => t.dueDate < now && t.status !== "completed" && t.status !== "skipped").length;
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const daysRemaining = active ? Math.max(0, Math.round((active.targetCloseDate.getTime() - now.getTime()) / 86400000)) : 0;
    const closedPeriods = periods.filter((p) => p.actualCloseDate);
    const lastClose = closedPeriods.length > 0 ? closedPeriods.reduce((a, b) => (a.endDate > b.endDate ? a : b)) : null;

    return {
      activePeriod: active?.label ?? "None",
      closeProgress: Math.round(progressPercent * 100) / 100,
      daysRemaining, onTrack: active ? progressPercent >= 50 && daysRemaining > 0 : true,
      totalTasks, completedTasks, blockedTasks, overdueTasks,
      pendingApprovals: approvals.filter((a) => a.status === "pending").length,
      openExceptions: exceptions.filter((e) => e.status === "open" || e.status === "inProgress").length,
      criticalExceptions: exceptions.filter((e) => e.severity === "critical" || e.severity === "blocker").length,
      openReconciliations: reconciliations.filter((r) => r.status !== "approved").length,
      unmatchedItems: accountRecs.filter((r) => Math.abs(r.difference) > 0.01).length,
      journalEntriesToReview: journals.filter((j) => j.status === "pending" || j.status === "inReview").length,
      flaggedJournals: journals.filter((j) => j.status === "flagged").length,
      averageDaysToClose: lastClose?.daysToClose ?? 0,
      closeReadinessScore: progressPercent,
      lastCloseDuration: lastClose?.daysToClose ?? 0,
      lastCloseOnTime: lastClose ? lastClose.actualCloseDate! <= lastClose.targetCloseDate : true,
    };
  }
}

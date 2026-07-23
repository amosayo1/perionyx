import type { CloseProgress, CloseReadinessScore, ClosePeriod, CloseTask, ReconciliationRecord, ApprovalRecord, ExceptionRecord, AccountReconciliation, VarianceAnalysisRecord } from "../../types";

export class CloseDashboardService {
  calculateProgress(period: ClosePeriod, tasks: CloseTask[]): CloseProgress {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "inProgress" || t.status === "inReview").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    const notStarted = tasks.filter((t) => t.status === "notStarted").length;
    const progressPercent = total > 0 ? (completed / total) * 100 : 0;
    const now = new Date();
    const daysElapsed = Math.max(0, Math.round((now.getTime() - period.startDate.getTime()) / 86400000));
    const daysRemaining = Math.max(0, Math.round((period.targetCloseDate.getTime() - now.getTime()) / 86400000));
    const totalDays = daysElapsed + daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    const onTrack = progressPercent >= expectedProgress - 5;

    return {
      periodId: period.id, periodLabel: period.label,
      totalTasks: total, completedTasks: completed, inProgressTasks: inProgress,
      blockedTasks: blocked, notStartedTasks: notStarted,
      progressPercent: Math.round(progressPercent * 100) / 100,
      daysElapsed, daysRemaining, onTrack,
    };
  }

  calculateReadinessScore(
    period: ClosePeriod, tasks: CloseTask[],
    reconciliations: ReconciliationRecord[], approvals: ApprovalRecord[],
    accountRecs: AccountReconciliation[], variances: VarianceAnalysisRecord[],
    exceptions: ExceptionRecord[],
  ): CloseReadinessScore {
    const taskCompletion = tasks.length > 0 ? (tasks.filter((t) => t.status === "completed").length / tasks.length) * 100 : 0;
    const reconciliationStatus = reconciliations.length > 0
      ? (reconciliations.filter((r) => r.isBalanced || r.status === "approved").length / reconciliations.length) * 100
      : 100;
    const approvalStatus = approvals.length > 0
      ? (approvals.filter((a) => a.status === "approved").length / approvals.length) * 100
      : 100;
    const exceptionCount = exceptions.length;
    const varianceCount = variances.filter((v) => v.isSignificant).length;
    const score = Math.round(
      (taskCompletion * 0.3 + reconciliationStatus * 0.25 + approvalStatus * 0.2) * (1 - (exceptionCount + varianceCount) * 0.02),
    );

    return { periodId: period.id, score: Math.min(100, Math.max(0, score)),
      taskCompletion, reconciliationStatus, approvalStatus,
      exceptionCount, varianceCount, previousScore: 80, trend: "stable" };
  }

  getPeriodSummary(
    period: ClosePeriod, tasks: CloseTask[], reconciliations: ReconciliationRecord[],
    accountRecs: AccountReconciliation[], icRecs: { status: string }[],
    journals: { status: string }[], approvals: ApprovalRecord[],
    variances: VarianceAnalysisRecord[], exceptions: ExceptionRecord[],
  ): Record<string, unknown> {
    return {
      periodLabel: period.label,
      periodType: period.periodType,
      status: period.status,
      progress: this.calculateProgress(period, tasks),
      readiness: this.calculateReadinessScore(period, tasks, reconciliations, approvals, accountRecs, variances, exceptions),
      reconciliationStats: { total: reconciliations.length, matched: reconciliations.filter((r) => r.isBalanced).length, unmatched: reconciliations.filter((r) => !r.isBalanced).length },
      accountRecStats: { total: accountRecs.length, unmatched: accountRecs.filter((r) => Math.abs(r.difference) > 0.01).length },
      icRecStats: { total: icRecs.length, unmatched: icRecs.filter((r) => r.status !== "approved" && r.status !== "matched").length },
      journalStats: { total: journals.length, pending: journals.filter((r) => r.status === "pending" || r.status === "inReview").length, approved: journals.filter((r) => r.status === "approved").length },
      approvalStats: { total: approvals.length, pending: approvals.filter((a) => a.status === "pending").length, approved: approvals.filter((a) => a.status === "approved").length },
      varianceStats: { total: variances.length, significant: variances.filter((v) => v.isSignificant).length },
      exceptionStats: { total: exceptions.length, critical: exceptions.filter((e) => e.severity === "critical" || e.severity === "blocker").length },
    };
  }
}

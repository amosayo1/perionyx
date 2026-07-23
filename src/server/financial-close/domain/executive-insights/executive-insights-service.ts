import type { ExecutiveCloseSummary, ClosePeriod, CloseTask, ApprovalRecord, ExceptionRecord, ReconciliationRecord } from "../../types";

export class ExecutiveInsightsService {
  generateInsights(summary: ExecutiveCloseSummary, periods: ClosePeriod[], tasks: CloseTask[], approvals: ApprovalRecord[], exceptions: ExceptionRecord[], reconciliations: ReconciliationRecord[]): { title: string; message: string; severity: string }[] {
    const insights: { title: string; message: string; severity: string }[] = [];

    if (summary.closeProgress < 50 && summary.daysRemaining < 3) {
      insights.push({ title: "Close at Risk", message: `Close progress at ${summary.closeProgress.toFixed(0)}% with only ${summary.daysRemaining} days remaining. Consider resource reallocation.`, severity: "critical" });
    }
    if (summary.blockedTasks > 0) {
      insights.push({ title: "Blocked Tasks", message: `${summary.blockedTasks} tasks are blocked, potentially delaying close. Review dependencies and unblock critical path items.`, severity: "warning" });
    }
    if (summary.overdueTasks > 3) {
      insights.push({ title: "Overdue Tasks Accumulating", message: `${summary.overdueTasks} tasks past due. Average delay may impact close timeline by 1-2 days.`, severity: "warning" });
    }
    if (summary.criticalExceptions > 0) {
      insights.push({ title: "Critical Exceptions", message: `${summary.criticalExceptions} critical/blocker exceptions require immediate attention before close can proceed.`, severity: "critical" });
    }
    if (summary.pendingApprovals > 5) {
      insights.push({ title: "Approval Backlog", message: `${summary.pendingApprovals} approvals pending. Consider approval delegation or escalation.`, severity: "warning" });
    }
    if (summary.unmatchedItems > 0) {
      insights.push({ title: "Unmatched Items", message: `${summary.unmatchedItems} reconciliation items unmatched. May require manual adjustment.`, severity: "info" });
    }
    if (summary.flaggedJournals > 0) {
      insights.push({ title: "Flagged Journals", message: `${summary.flaggedJournals} journal entries flagged for review. Ensure all flags are resolved before final close.`, severity: "warning" });
    }
    if (summary.closeProgress > 80 && summary.daysRemaining > 0) {
      insights.push({ title: "Close on Track", message: `Progress at ${summary.closeProgress.toFixed(0)}% with ${summary.daysRemaining} days remaining. Close is on schedule.`, severity: "info" });
    }
    if (periods.length > 1) {
      const prevClose = periods.filter((p) => p.actualCloseDate).sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[1];
      if (prevClose) {
        insights.push({ title: "Comparative Close Duration", message: `Last close took ${prevClose.daysToClose} days. Current target: ${periods.find((p) => p.status === "inProgress")?.daysToClose ?? "N/A"} days.`, severity: "info" });
      }
    }
    if (insights.length === 0) {
      insights.push({ title: "Close Progress Normal", message: "All close metrics within acceptable ranges.", severity: "info" });
    }

    return insights;
  }
}

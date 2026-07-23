import type { FinancialCloseService } from "./services/financial-close-service";
import type {
  ClosePeriod, CloseTask, CloseChecklist, ChecklistItem, CloseCalendarEntry,
  ReconciliationRecord, ReconciliationAdjustment, AccountReconciliation, ReconcilingItem,
  IntercompanyReconciliation, IntercompanyItem, JournalReviewRecord, JournalFlag,
  ApprovalRecord, VarianceAnalysisRecord, ExceptionRecord, CloseMetric, CloseRecommendation, CloseAlert,
} from "./types";

const NOW = new Date();
const DAY = 86400000;
const COMPANY = "company-1";

function daysAgo(n: number): Date { return new Date(NOW.getTime() - n * DAY); }
function daysAhead(n: number): Date { return new Date(NOW.getTime() + n * DAY); }
function rand(min: number, max: number): number { return Math.round((min + Math.random() * (max - min)) * 100) / 100; }

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function seedFCData(svc: FinancialCloseService): void {
  const currentPeriod: ClosePeriod = {
    id: "period-current", periodType: "monthEnd", fiscalYear: 2026, fiscalPeriod: 7,
    label: "July 2026 Month-End Close", status: "inProgress",
    startDate: daysAgo(10), endDate: daysAgo(0), targetCloseDate: daysAhead(5),
    daysToClose: 0, totalTasks: 45, completedTasks: 28,
    blockedTasks: 2, openExceptions: 4, criticalExceptions: 1,
    approvalsPending: 3, closeLead: "sarah.chen@perionyx.com",
    companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1),
  };
  const priorPeriod: ClosePeriod = {
    id: "period-prior", periodType: "monthEnd", fiscalYear: 2026, fiscalPeriod: 6,
    label: "June 2026 Month-End Close", status: "locked",
    startDate: daysAgo(45), endDate: daysAgo(38), targetCloseDate: daysAgo(38),
    actualCloseDate: daysAgo(36), daysToClose: 7, totalTasks: 45, completedTasks: 45,
    blockedTasks: 0, openExceptions: 0, criticalExceptions: 0,
    approvalsPending: 0, closeLead: "sarah.chen@perionyx.com",
    companyId: COMPANY, createdAt: daysAgo(50), updatedAt: daysAgo(35),
  };
  svc.closeManagement.add(currentPeriod);
  svc.closeManagement.add(priorPeriod);

  const closeTasks: CloseTask[] = [
    { id: "task-001", periodId: "period-current", taskCode: "AR-RECON", title: "AR Subledger vs GL Reconciliation", priority: "critical", status: "completed", assignedTo: "james.wilson", dependsOn: [], dueDate: daysAgo(2), completedDate: daysAgo(2), estimatedHours: 4, actualHours: 3.5, isRecurring: true, category: "reconciliation", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(2) },
    { id: "task-002", periodId: "period-current", taskCode: "AP-RECON", title: "AP Subledger vs GL Reconciliation", priority: "critical", status: "inProgress", assignedTo: "lisa.park", dependsOn: [], dueDate: daysAhead(1), estimatedHours: 4, isRecurring: true, category: "reconciliation", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(0) },
    { id: "task-003", periodId: "period-current", taskCode: "BANK-RECON", title: "Bank Account Reconciliation", priority: "critical", status: "inProgress", assignedTo: "mike.johnson", dependsOn: [], dueDate: daysAhead(2), estimatedHours: 6, isRecurring: true, category: "reconciliation", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-004", periodId: "period-current", taskCode: "ACCRUALS", title: "Accrual Journal Entries", priority: "high", status: "notStarted", assignedTo: "sarah.chen", dependsOn: ["task-001", "task-002"], dueDate: daysAhead(3), estimatedHours: 3, isRecurring: true, category: "journal", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-005", periodId: "period-current", taskCode: "DEPREC", title: "Depreciation Run", priority: "high", status: "completed", assignedTo: "finance-system", dependsOn: [], dueDate: daysAgo(1), completedDate: daysAgo(1), estimatedHours: 2, actualHours: 2, isRecurring: true, category: "journal", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-006", periodId: "period-current", taskCode: "FX-REVAL", title: "FX Revaluation", priority: "high", status: "inProgress", assignedTo: "james.wilson", dependsOn: ["task-003"], dueDate: daysAhead(2), estimatedHours: 3, isRecurring: true, category: "fx", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-007", periodId: "period-current", taskCode: "IC-RECON", title: "Intercompany Reconciliation", priority: "critical", status: "blocked", assignedTo: "lisa.park", dependsOn: ["task-002"], dueDate: daysAhead(3), estimatedHours: 5, isRecurring: true, category: "intercompany", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(2) },
    { id: "task-008", periodId: "period-current", taskCode: "IC-ENTRIES", title: "Intercompany Journal Entries", priority: "high", status: "notStarted", assignedTo: "lisa.park", dependsOn: ["task-007"], dueDate: daysAhead(4), estimatedHours: 3, isRecurring: true, category: "intercompany", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(2) },
    { id: "task-009", periodId: "period-current", taskCode: "INV-REVIEW", title: "Inventory Valuation Review", priority: "medium", status: "inProgress", assignedTo: "warehouse-team", dependsOn: [], dueDate: daysAhead(3), estimatedHours: 4, isRecurring: false, category: "reconciliation", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(0) },
    { id: "task-010", periodId: "period-current", taskCode: "TAX-ACCRUE", title: "Tax Accrual Calculation", priority: "critical", status: "notStarted", assignedTo: "tax-team", dependsOn: ["task-001", "task-002", "task-003"], dueDate: daysAhead(4), estimatedHours: 8, isRecurring: true, category: "compliance", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-011", periodId: "period-current", taskCode: "P&L-REVIEW", title: "P&L Review and Variance Analysis", priority: "high", status: "notStarted", assignedTo: "sarah.chen", dependsOn: ["task-004", "task-006", "task-008"], dueDate: daysAhead(5), estimatedHours: 6, isRecurring: true, category: "reporting", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-012", periodId: "period-current", taskCode: "BS-REVIEW", title: "Balance Sheet Review", priority: "critical", status: "notStarted", assignedTo: "sarah.chen", dependsOn: ["task-011"], dueDate: daysAhead(6), estimatedHours: 4, isRecurring: true, category: "reporting", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-013", periodId: "period-current", taskCode: "FS-PREP", title: "Financial Statement Preparation", priority: "critical", status: "notStarted", assignedTo: "reporting-team", dependsOn: ["task-012"], dueDate: daysAhead(7), estimatedHours: 8, isRecurring: true, category: "reporting", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-014", periodId: "period-current", taskCode: "TAX-RETURN", title: "Tax Return Review", priority: "medium", status: "notStarted", assignedTo: "tax-team", dependsOn: ["task-010", "task-011"], dueDate: daysAhead(8), estimatedHours: 4, isRecurring: false, category: "compliance", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
    { id: "task-015", periodId: "period-current", taskCode: "APPROVE", title: "Final Close Approval and Lock", priority: "critical", status: "notStarted", assignedTo: "sarah.chen", dependsOn: ["task-013", "task-014"], dueDate: daysAhead(8), estimatedHours: 2, isRecurring: true, category: "audit", companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
  ];
  for (const t of closeTasks) svc.taskEngine.add(t);

  svc.checklistEngine.add({
    id: "cl-001", periodId: "period-current", title: "Pre-Close Checklist", category: "reconciliation", sortOrder: 1, companyId: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1),
    items: [
      { id: "cli-001", checklistId: "cl-001", text: "All bank transactions posted", isCompleted: true, completedBy: "mike.johnson", completedAt: daysAgo(2), required: true },
      { id: "cli-002", checklistId: "cl-001", text: "AR transactions reconciled", isCompleted: true, completedBy: "james.wilson", completedAt: daysAgo(2), required: true },
      { id: "cli-003", checklistId: "cl-001", text: "AP transactions reconciled", isCompleted: false, required: true },
      { id: "cli-004", checklistId: "cl-001", text: "Payroll posted", isCompleted: true, completedBy: "hr-team", completedAt: daysAgo(3), required: true },
    ],
  });

  svc.closeCalendar.add({
    id: "cal-001", periodId: "period-current", title: "Close Kickoff Meeting", date: daysAgo(10), type: "meeting", assignedTo: "sarah.chen", isRecurring: true, companyId: COMPANY, createdAt: daysAgo(20), updatedAt: daysAgo(10),
  });
  svc.closeCalendar.add({
    id: "cal-002", periodId: "period-current", title: "Subledger Close Deadline", date: daysAhead(2), type: "deadline", assignedTo: "james.wilson", isRecurring: true, companyId: COMPANY, createdAt: daysAgo(20), updatedAt: daysAgo(1),
  });
  svc.closeCalendar.add({
    id: "cal-003", periodId: "period-current", title: "P&L Review Meeting", date: daysAhead(5), type: "meeting", assignedTo: "sarah.chen", isRecurring: true, companyId: COMPANY, createdAt: daysAgo(20), updatedAt: daysAgo(1),
  });
  svc.closeCalendar.add({
    id: "cal-004", periodId: "period-current", title: "Final Close Approval", date: daysAhead(8), type: "approval", assignedTo: "sarah.chen", isRecurring: true, companyId: COMPANY, createdAt: daysAgo(20), updatedAt: daysAgo(1),
  });

  svc.reconciliation.add({
    id: "recon-001", periodId: "period-current", reconciliationType: "bank", accountId: "acct-1001", accountCode: "1001", accountName: "Operating Account - Chase",
    status: "inProgress", sourceBalance: 2450000, targetBalance: 2449750, difference: 250, isBalanced: false,
    preparedBy: "mike.johnson", preparedDate: daysAgo(3), adjustments: [], companyId: COMPANY, createdAt: daysAgo(5), updatedAt: daysAgo(1),
  });
  svc.reconciliation.add({
    id: "recon-002", periodId: "period-current", reconciliationType: "arGl", accountId: "acct-1200", accountCode: "1200", accountName: "Accounts Receivable",
    status: "approved", sourceBalance: 3200000, targetBalance: 3200000, difference: 0, isBalanced: true,
    preparedBy: "james.wilson", reviewedBy: "sarah.chen", approvedBy: "sarah.chen", preparedDate: daysAgo(3), reviewedDate: daysAgo(2), approvedDate: daysAgo(2), adjustments: [], companyId: COMPANY, createdAt: daysAgo(5), updatedAt: daysAgo(2),
  });
  svc.reconciliation.add({
    id: "recon-003", periodId: "period-current", reconciliationType: "apGl", accountId: "acct-2000", accountCode: "2000", accountName: "Accounts Payable",
    status: "pending", sourceBalance: 1850000, targetBalance: 1845000, difference: 5000, isBalanced: false,
    preparedBy: "lisa.park", preparedDate: daysAgo(2), adjustments: [], companyId: COMPANY, createdAt: daysAgo(5), updatedAt: daysAgo(2),
  });

  svc.accountReconciliation.add({
    id: "arecon-001", periodId: "period-current", accountId: "acct-1200", accountCode: "1200", accountName: "Accounts Receivable",
    glBalance: 3200000, subledgerBalance: 3198000, difference: 2000, status: "inProgress", reconcilingItems: [
      { id: "ri-001", reconciliationId: "arecon-001", description: "Unapplied receipt #10234", amount: 2000, type: "subledger", date: daysAgo(5), cleared: false },
    ], preparedBy: "james.wilson", companyId: COMPANY, createdAt: daysAgo(4), updatedAt: daysAgo(1),
  });
  svc.accountReconciliation.add({
    id: "arecon-002", periodId: "period-current", accountId: "acct-2000", accountCode: "2000", accountName: "Accounts Payable",
    glBalance: 1850000, subledgerBalance: 1845000, difference: 5000, status: "inProgress", reconcilingItems: [], preparedBy: "lisa.park", companyId: COMPANY, createdAt: daysAgo(4), updatedAt: daysAgo(2),
  });

  svc.intercompanyReconciliation.add({
    id: "ic-001", periodId: "period-current", fromEntity: "Perionyx US", toEntity: "Perionyx EU",
    fromBalance: 550000, toBalance: 548000, difference: 2000, status: "inProgress", currency: "USD", fxRate: 1, baseDifference: 2000,
    items: [{ id: "ici-001", icReconciliationId: "ic-001", description: "Intercompany services", fromAmount: 550000, toAmount: 548000, difference: 2000, cleared: false }],
    preparedBy: "lisa.park", companyId: COMPANY, createdAt: daysAgo(3), updatedAt: daysAgo(1),
  });

  svc.journalReview.add({
    id: "jr-001", periodId: "period-current", journalId: "jrnl-001", journalNumber: "JRNL-2026-07-001",
    description: "Monthly Depreciation", totalDebit: 125000, totalCredit: 125000, isBalanced: true,
    status: "approved", preparer: "finance-system", reviewer: "james.wilson", reviewDate: daysAgo(1),
    flags: [], companyId: COMPANY, createdAt: daysAgo(3), updatedAt: daysAgo(1),
  });
  svc.journalReview.add({
    id: "jr-002", periodId: "period-current", journalId: "jrnl-002", journalNumber: "JRNL-2026-07-002",
    description: "Accrued Expenses - June",
    totalDebit: 89000, totalCredit: 89000, isBalanced: true,
    status: "flagged", preparer: "sarah.chen", flags: [
      { id: "flag-001", reviewId: "jr-002", type: "large", description: "Journal entry exceeds $50,000 threshold", severity: "medium", resolved: false },
    ], companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(1),
  });
  svc.journalReview.add({
    id: "jr-003", periodId: "period-current", journalId: "jrnl-003", journalNumber: "JRNL-2026-07-003",
    description: "FX Revaluation Adjustment", totalDebit: 4500, totalCredit: 4500, isBalanced: true,
    status: "pending", preparer: "james.wilson", flags: [], companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
  });

  svc.approvals.add({
    id: "appr-001", periodId: "period-current", entityType: "reconciliation", entityId: "recon-003", entityDescription: "AP Reconciliation",
    status: "pending", requestedBy: "lisa.park", requestedAt: daysAgo(1), escalationLevel: 1, companyId: COMPANY,
  });
  svc.approvals.add({
    id: "appr-002", periodId: "period-current", entityType: "journal", entityId: "jr-003", entityDescription: "FX Revaluation Journal",
    status: "pending", requestedBy: "james.wilson", requestedAt: daysAgo(1), escalationLevel: 1, companyId: COMPANY,
  });
  svc.approvals.add({
    id: "appr-003", periodId: "period-current", entityType: "journal", entityId: "jr-002", entityDescription: "Accrued Expenses (flagged)",
    status: "pending", requestedBy: "sarah.chen", requestedAt: daysAgo(1), escalationLevel: 1, companyId: COMPANY,
  });
  svc.approvals.add({
    id: "appr-004", periodId: "period-current", entityType: "close", entityId: "period-current", entityDescription: "July 2026 Close Approval",
    status: "pending", requestedBy: "sarah.chen", requestedAt: daysAgo(0), escalationLevel: 1, companyId: COMPANY,
  });

  svc.varianceAnalysis.add(svc.varianceAnalysis.calculateVariance("acct-4000", "4000", "Revenue", 5000000, 4750000, 10, "period-current", "favorable"));
  svc.varianceAnalysis.add(svc.varianceAnalysis.calculateVariance("acct-6000", "6000", "Operating Expenses", 3200000, 3400000, 10, "period-current", "favorable"));
  svc.varianceAnalysis.add(svc.varianceAnalysis.calculateVariance("acct-6100", "6100", "Payroll", 1800000, 1750000, 5, "period-current", "unfavorable"));

  svc.alerts.add({
    id: "fc-alert-001", type: "task", severity: "critical",
    title: "Critical task blocked: IC Reconciliation",
    message: "Intercompany Reconciliation is blocked pending AP reconciliation. Escalate to resolve dependency.",
    periodId: "period-current", entityId: "task-007", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(1),
  });
  svc.alerts.add({
    id: "fc-alert-002", type: "reconciliation", severity: "warning",
    title: "Bank reconciliation unbalanced",
    message: "Operating Account has $250 difference. Review outstanding items.",
    periodId: "period-current", entityId: "recon-001", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(1),
  });
  svc.alerts.add({
    id: "fc-alert-003", type: "approval", severity: "warning",
    title: "Approval queue: 3 pending approvals",
    message: "Review and approve pending items to avoid close delays.",
    periodId: "period-current", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(0),
  });

  svc.recommendations.add({
    id: "fc-rec-001", type: "task", title: "Resolve IC Reconciliation dependency", priority: "critical", status: "active",
    description: "Task IC-RECON is blocked by AP-RECON. Consider parallel processing or interim solution.",
    impact: "Blocks IC entries and consolidation", effort: "high", periodId: "period-current", entityId: "task-007",
    companyId: COMPANY, createdAt: daysAgo(1),
  });
  svc.recommendations.add({
    id: "fc-rec-002", type: "approval", title: "Approve pending reconciliations", priority: "high", status: "active",
    description: "AP Reconciliation pending approval for 2 days. Review and approve to unblock downstream tasks.",
    impact: "Unblocks 3 dependent tasks", effort: "low", periodId: "period-current",
    companyId: COMPANY, createdAt: daysAgo(1),
  });

  svc.analytics.addMetric({
    id: "fcm-001", periodId: "period-current", name: "Days to Close", value: 10, target: 7, unit: "days",
    trend: "worsening", category: "speed", status: "atRisk", companyId: COMPANY,
  });
  svc.analytics.addMetric({
    id: "fcm-002", periodId: "period-current", name: "Task Completion", value: 62, target: 100, unit: "%",
    trend: "improving", category: "speed", status: "onTrack", companyId: COMPANY,
  });
  svc.analytics.addMetric({
    id: "fcm-003", periodId: "period-current", name: "Reconciliation Rate", value: 33, target: 100, unit: "%",
    trend: "improving", category: "quality", status: "atRisk", companyId: COMPANY,
  });
  svc.analytics.addMetric({
    id: "fcm-004", periodId: "period-current", name: "Approval Rate", value: 0, target: 100, unit: "%",
    trend: "stable", category: "efficiency", status: "critical", companyId: COMPANY,
  });
  svc.analytics.addMetric({
    id: "fcm-005", periodId: "period-current", name: "Open Exceptions", value: 2, target: 0, unit: "count",
    trend: "stable", category: "quality", status: "atRisk", companyId: COMPANY,
  });
  svc.analytics.addMetric({
    id: "fcm-006", periodId: "period-current", name: "Flagged Journals", value: 1, target: 0, unit: "count",
    trend: "stable", category: "compliance", status: "atRisk", companyId: COMPANY,
  });
}

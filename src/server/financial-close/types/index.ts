export type ClosePeriodType = "monthEnd" | "quarterEnd" | "yearEnd" | "softClose" | "hardClose" | "reopen";
export type ClosePeriodStatus = "notStarted" | "inProgress" | "review" | "approved" | "locked" | "archived" | "reopened";
export type CloseTaskStatus = "notStarted" | "inProgress" | "inReview" | "completed" | "blocked" | "skipped" | "failed";
export type CloseTaskPriority = "critical" | "high" | "medium" | "low";
export type CloseTaskCategory = "reconciliation" | "journal" | "accrual" | "allocation" | "fx" | "intercompany" | "consolidation" | "reporting" | "compliance" | "audit";
export type ReconciliationType = "bank" | "gl" | "subledger" | "arGl" | "apGl" | "treasuryGl" | "taxGl" | "intercompany" | "manual";
export type ReconciliationStatus = "pending" | "inProgress" | "matched" | "unmatched" | "adjusted" | "approved" | "failed";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";
export type ApprovalEntityType = "task" | "reconciliation" | "journal" | "adjustment" | "reopen" | "close";
export type JournalReviewStatus = "pending" | "inReview" | "approved" | "rejected" | "flagged";
export type ExceptionSeverity = "info" | "warning" | "critical" | "blocker";
export type ExceptionCategory = "reconciliation" | "journal" | "variance" | "missingTask" | "lateApproval" | "system" | "compliance";
export type VarianceDirection = "favorable" | "unfavorable" | "neutral";
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertCategory = "close" | "reconciliation" | "journal" | "approval" | "task" | "variance" | "compliance";

export interface ClosePeriod {
  id: string;
  periodType: ClosePeriodType;
  fiscalYear: number;
  fiscalPeriod: number;
  label: string;
  status: ClosePeriodStatus;
  startDate: Date;
  endDate: Date;
  actualCloseDate?: Date;
  targetCloseDate: Date;
  daysToClose: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  openExceptions: number;
  criticalExceptions: number;
  approvalsPending: number;
  closeLead: string;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloseTask {
  id: string;
  periodId: string;
  taskCode: string;
  title: string;
  description?: string;
  category: CloseTaskCategory;
  priority: CloseTaskPriority;
  status: CloseTaskStatus;
  assignedTo: string;
  dependsOn: string[];
  startDate?: Date;
  dueDate: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  isRecurring: boolean;
  recurrenceRule?: string;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloseChecklist {
  id: string;
  periodId: string;
  title: string;
  category: CloseTaskCategory;
  items: ChecklistItem[];
  sortOrder: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  text: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  required: boolean;
}

export interface CloseCalendarEntry {
  id: string;
  periodId: string;
  title: string;
  description?: string;
  date: Date;
  type: "deadline" | "meeting" | "review" | "approval" | "lock" | "reminder";
  assignedTo?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationRecord {
  id: string;
  periodId: string;
  reconciliationType: ReconciliationType;
  accountId: string;
  accountCode: string;
  accountName: string;
  status: ReconciliationStatus;
  sourceBalance: number;
  targetBalance: number;
  difference: number;
  isBalanced: boolean;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  preparedDate: Date;
  reviewedDate?: Date;
  approvedDate?: Date;
  adjustments: ReconciliationAdjustment[];
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationAdjustment {
  id: string;
  reconciliationId: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  accountCode: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: "proposed" | "approved" | "posted" | "rejected";
}

export interface AccountReconciliation {
  id: string;
  periodId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  glBalance: number;
  subledgerBalance: number;
  difference: number;
  status: ReconciliationStatus;
  reconcilingItems: ReconcilingItem[];
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconcilingItem {
  id: string;
  reconciliationId: string;
  description: string;
  amount: number;
  type: "gl" | "subledger";
  reference?: string;
  date: Date;
  cleared: boolean;
}

export interface IntercompanyReconciliation {
  id: string;
  periodId: string;
  fromEntity: string;
  toEntity: string;
  fromBalance: number;
  toBalance: number;
  difference: number;
  status: ReconciliationStatus;
  currency: string;
  fxRate: number;
  baseDifference: number;
  items: IntercompanyItem[];
  preparedBy: string;
  approvedBy?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntercompanyItem {
  id: string;
  icReconciliationId: string;
  description: string;
  fromAmount: number;
  toAmount: number;
  difference: number;
  matchKey?: string;
  cleared: boolean;
}

export interface JournalReviewRecord {
  id: string;
  periodId: string;
  journalId: string;
  journalNumber: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: JournalReviewStatus;
  preparer: string;
  reviewer?: string;
  reviewDate?: Date;
  flags: JournalFlag[];
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalFlag {
  id: string;
  reviewId: string;
  type: "rounding" | "unusual" | "manual" | "large" | "recurring" | "intercompany" | "missingApproval";
  description: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
}

export interface ApprovalRecord {
  id: string;
  periodId: string;
  entityType: ApprovalEntityType;
  entityId: string;
  entityDescription: string;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  comments?: string;
  escalationLevel: number;
  companyId: string;
}

export interface VarianceAnalysisRecord {
  id: string;
  periodId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  currentPeriodAmount: number;
  priorPeriodAmount: number;
  variance: number;
  variancePercent: number;
  direction: VarianceDirection;
  explanation?: string;
  threshold: number;
  isSignificant: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExceptionRecord {
  id: string;
  periodId: string;
  severity: ExceptionSeverity;
  category: ExceptionCategory;
  title: string;
  description: string;
  entityType?: string;
  entityId?: string;
  assignedTo?: string;
  status: "open" | "inProgress" | "resolved" | "wontFix";
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloseMetric {
  id: string;
  periodId: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "improving" | "worsening" | "stable";
  category: "speed" | "quality" | "compliance" | "efficiency";
  status: "onTrack" | "atRisk" | "critical" | "exceeding";
  companyId: string;
}

export interface CloseRecommendation {
  id: string;
  type: "task" | "reconciliation" | "approval" | "variance" | "risk" | "process";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "implemented" | "dismissed";
  impact: string;
  effort: "low" | "medium" | "high";
  periodId?: string;
  entityId?: string;
  companyId: string;
  createdAt: Date;
}

export interface CloseAlert {
  id: string;
  type: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  periodId?: string;
  entityId?: string;
  isRead: boolean;
  isResolved: boolean;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  companyId: string;
  createdAt: Date;
}

export interface CloseProgress {
  periodId: string;
  periodLabel: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  notStartedTasks: number;
  progressPercent: number;
  daysElapsed: number;
  daysRemaining: number;
  onTrack: boolean;
}

export interface CloseReadinessScore {
  periodId: string;
  score: number;
  taskCompletion: number;
  reconciliationStatus: number;
  approvalStatus: number;
  exceptionCount: number;
  varianceCount: number;
  previousScore: number;
  trend: "improving" | "worsening" | "stable";
}

export interface AggregateCloseMetrics {
  totalPeriods: number;
  activePeriods: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  pendingApprovals: number;
  openReconciliations: number;
  completedReconciliations: number;
  openExceptions: number;
  criticalExceptions: number;
  averageDaysToClose: number;
  closeReadinessScore: number;
  onTimeCloses: number;
  totalCloses: number;
  onTimePercentage: number;
}

export interface ExecutiveCloseSummary {
  activePeriod: string;
  closeProgress: number;
  daysRemaining: number;
  onTrack: boolean;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  pendingApprovals: number;
  openExceptions: number;
  criticalExceptions: number;
  openReconciliations: number;
  unmatchedItems: number;
  journalEntriesToReview: number;
  flaggedJournals: number;
  averageDaysToClose: number;
  closeReadinessScore: number;
  lastCloseDuration: number;
  lastCloseOnTime: boolean;
}

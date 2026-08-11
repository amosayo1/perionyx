export type TaskCategoryId =
  | "high-priority-reviews"
  | "medium-priority-reviews"
  | "quick-approvals"
  | "policy-exceptions";

export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface TaskCategory {
  id: TaskCategoryId;
  label: string;
  count: number;
  urgency: UrgencyLevel;
  estimatedEffort: string;
  estimatedMinutes: number;
  navigationTarget: string;
  supportingReason: string;
}

export interface PrioritySignals {
  overdueInvoices: number;
  paymentsDueTodayCount: number;
  openExceptions: number;
  blockedInvoices: number;
  supplierRiskCount: number;
  approvalSlaBreachedCount: number;
  oldestInvoiceAgeDays: number;
  totalPendingInvoices: number;
}

export interface WorkloadEstimate {
  estimatedMinutes: number;
  highPriorityPercentage: number;
}

export interface TodaysWorkResult {
  categories: TaskCategory[];
  totalTasks: number;
  estimatedTotalMinutes: number;
  highPriorityPercentage: number;
}

export interface ITodaysWorkService {
  getTodaysWork(companyId: string): Promise<TodaysWorkResult>;
}

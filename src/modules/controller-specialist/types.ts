// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Close Types ─────────────────────────────────────────────

export type ClosePeriodType = "monthly" | "quarterly" | "yearly";

export type CloseStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "REVIEW"
  | "CLOSED"
  | "LOCKED";

export type CloseTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "OVERDUE"
  | "SKIPPED";

export type CloseTaskCategory =
  | "journal"
  | "reconciliation"
  | "approval"
  | "review"
  | "reporting"
  | "closing"
  | "document";

// ─── Journal Types ───────────────────────────────────────────

export type JournalType =
  | "manual"
  | "recurring"
  | "accrual"
  | "reversal"
  | "adjustment"
  | "intercompany";

export type JournalRiskType =
  | "unusual_amount"
  | "duplicate"
  | "late"
  | "large"
  | "policy_violation"
  | "missing_support"
  | "unusual_timing"
  | "round_amount";

// ─── Statement Types ─────────────────────────────────────────

export type StatementType =
  | "balance_sheet"
  | "income_statement"
  | "cash_flow"
  | "trial_balance"
  | "general_ledger"
  | "aged_receivables"
  | "aged_payables"
  | "equity_statement"
  | "budget_vs_actual"
  | "department_reports";

// ─── Exception Types ─────────────────────────────────────────

export type AccountingExceptionType =
  | "journal_anomaly"
  | "duplicate_posting"
  | "late_journal"
  | "large_journal"
  | "policy_violation"
  | "missing_support"
  | "suspense_account"
  | "unbalanced_entry"
  | "missing_approval"
  | "reconciliation_gap";

// ─── Recommendation Types ────────────────────────────────────

export type RecommendationCategory =
  | "close"
  | "journal"
  | "reconciliation"
  | "statement"
  | "governance"
  | "risk"
  | "efficiency";

// ─── Risk & Severity ─────────────────────────────────────────

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReviewStatus = "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "FLAGGED";

export type RiskStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";

export type MilestoneStatus = "PENDING" | "ACHIEVED" | "MISSED" | "SKIPPED";

export type DependencyStatus = "PENDING" | "SATISFIED" | "VIOLATED";

export type StatementReadinessStatus = "NOT_READY" | "PARTIAL" | "READY" | "GENERATED";

// ─── Interfaces ──────────────────────────────────────────────

export interface CloseProgress {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  percentComplete: number;
}

export interface EntityCompletion {
  [entityName: string]: { completed: number; total: number };
}

export interface DashboardData {
  activeClosePeriods: number;
  overallHealthScore: Prisma.Decimal;
  pendingApprovals: number;
  outstandingExceptions: number;
  lateJournals: number;
  openRecommendations: number;
  closeProgress: CloseProgress;
  recentBriefings: Array<{
    id: string;
    period: string;
    type: string;
    generatedAt: string;
  }>;
  topRisks: Array<{
    category: string;
    severity: RiskLevel;
    description: string;
    affectedEntities: string[];
  }>;
  statementReadiness: StatementReadinessSummary;
}

export interface CloseCalendarEntry {
  id: string;
  period: string;
  closeType: ClosePeriodType;
  status: CloseStatus;
  progress: Prisma.Decimal;
  estimatedCompletion: Date | null;
  actualCloseDate: Date | null;
  taskStats: {
    total: number;
    completed: number;
    blocked: number;
    overdue: number;
  };
}

export interface JournalReviewSummary {
  totalReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  approvedReviews: number;
  riskDistribution: Record<RiskLevel, number>;
  averageRiskLevel: number;
}

export interface StatementReadinessSummary {
  totalStatements: number;
  readyStatements: number;
  partialStatements: number;
  notReadyStatements: number;
  averageReadiness: Prisma.Decimal;
}

export interface AccountingHealthSummary {
  healthScore: Prisma.Decimal;
  riskScore: Prisma.Decimal;
  integrityScore: Prisma.Decimal;
  ledgerConsistency: Prisma.Decimal;
  journalQuality: Prisma.Decimal;
  reconciliationCompletion: Prisma.Decimal;
  policyCompliance: Prisma.Decimal;
  postingCompleteness: Prisma.Decimal;
  trends: Array<{
    date: string;
    healthScore: Prisma.Decimal;
    riskScore: Prisma.Decimal;
  }>;
}

export interface RecommendationInput {
  category: RecommendationCategory;
  title: string;
  description: string;
  businessReason: string;
  confidence: Prisma.Decimal;
  riskLevel: RiskLevel;
  evidence: string[];
  affectedModules: string[];
  requiredApprovals: string[];
}

// ─── Input Types ─────────────────────────────────────────────

export interface CreateClosePeriodInput {
  period: string;
  closeType: ClosePeriodType;
  estimatedCompletion?: Date;
  tasks?: CreateCloseTaskInput[];
}

export interface CreateCloseTaskInput {
  title: string;
  description?: string;
  category: CloseTaskCategory;
  priority?: string;
  assignedTo?: string;
  dueDate?: Date;
  entityName?: string;
  departmentName?: string;
  dependencyIds?: string[];
}

export interface UpdateCloseTaskInput {
  status?: CloseTaskStatus;
  assignedTo?: string;
  blockedReason?: string;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface ClosePeriodFilter {
  status?: CloseStatus;
  closeType?: ClosePeriodType;
  period?: string;
  from?: string;
  to?: string;
}

export interface JournalReviewFilter {
  status?: ReviewStatus;
  journalType?: JournalType;
  riskLevel?: RiskLevel;
  reviewerId?: string;
  from?: string;
  to?: string;
}

export interface CreateJournalReviewInput {
  journalId: string;
  journalType: JournalType;
  amount: Prisma.Decimal;
  currency?: string;
  postingDate?: Date;
  accountCode?: string;
  accountName?: string;
  description?: string;
  reference?: string;
  sourceSystem?: string;
  supportingDocs?: string[];
}

export interface UpdateJournalReviewInput {
  status?: ReviewStatus;
  reviewerId?: string;
  reviewNotes?: string;
  riskLevel?: RiskLevel;
  approvedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface UnusualJournalParams {
  threshold?: Prisma.Decimal;
  lookbackDays?: number;
  journalType?: JournalType;
  category?: JournalRiskType;
}

export interface GetJournalRiskSummaryParams {
  journalType?: JournalType;
  from?: string;
  to?: string;
}

export interface CreateMilestoneInput {
  closePeriodId: string;
  name: string;
  description?: string;
  targetDate: Date;
  requiredTaskIds?: string[];
}

export interface MilestoneRecord {
  id: string;
  companyId: string;
  closePeriodId: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate: Date | null;
  status: MilestoneStatus;
  requiredTaskIds: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

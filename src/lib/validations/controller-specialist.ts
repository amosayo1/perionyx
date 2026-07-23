import { z } from "zod";

// ── Close Period ──────────────────────────────────────────────────────

export const closePeriodTypeSchema = z.enum(["monthly", "quarterly", "yearly"]);

export const closeStatusSchema = z.enum([
  "OPEN", "IN_PROGRESS", "REVIEW", "CLOSED", "LOCKED",
]);

export const createClosePeriodSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be YYYY-MM format"),
  closeType: closePeriodTypeSchema,
});

export const closePeriodQuerySchema = z.object({
  status: closeStatusSchema.optional(),
  closeType: closePeriodTypeSchema.optional(),
  period: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ── Close Task ────────────────────────────────────────────────────────

export const closeTaskStatusSchema = z.enum([
  "PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "OVERDUE", "SKIPPED",
]);

export const closeTaskCategorySchema = z.enum([
  "journal", "reconciliation", "approval", "review", "reporting", "closing", "document",
]);

export const updateCloseTaskSchema = z.object({
  status: closeTaskStatusSchema.optional(),
  assignedTo: z.string().optional(),
  blockedReason: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

// ── Milestone ─────────────────────────────────────────────────────────

export const createMilestoneSchema = z.object({
  closePeriodId: z.string().cuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  targetDate: z.string().datetime(),
  requiredTaskIds: z.array(z.string()).default([]),
});

// ── Journal Review ────────────────────────────────────────────────────

export const journalTypeSchema = z.enum([
  "manual", "recurring", "accrual", "reversal", "adjustment", "intercompany",
]);

export const journalRiskTypeSchema = z.enum([
  "unusual_amount", "duplicate", "late", "large", "policy_violation",
  "missing_support", "unusual_timing", "round_amount",
]);

export const createJournalReviewSchema = z.object({
  journalId: z.string().min(1),
  journalType: journalTypeSchema,
  amount: z.number(),
  currency: z.string().length(3).default("USD"),
  postingDate: z.string().datetime().optional(),
  accountCode: z.string().optional(),
  accountName: z.string().optional(),
  description: z.string().min(1).max(1000),
  reference: z.string().optional(),
  sourceSystem: z.string().default("gl"),
});

export const updateJournalReviewSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "APPROVED", "REJECTED", "FLAGGED"]).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  reviewNotes: z.string().max(1000).optional(),
  reviewerId: z.string().optional(),
});

export const journalReviewQuerySchema = z.object({
  journalType: journalTypeSchema.optional(),
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  reviewerId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ── Statement Readiness ───────────────────────────────────────────────

export const statementTypeSchema = z.enum([
  "balance_sheet", "income_statement", "cash_flow", "trial_balance",
  "general_ledger", "aged_receivables", "aged_payables",
  "equity_statement", "budget_vs_actual", "department_reports",
]);

export const updateReadinessSchema = z.object({
  readinessScore: z.number().min(0).max(1).optional(),
  status: z.enum(["NOT_READY", "PARTIAL", "READY", "GENERATED"]).optional(),
  blockingIssues: z.array(z.record(z.string(), z.unknown())).optional(),
  missingAdjustments: z.number().int().min(0).optional(),
  outstandingReconciliations: z.number().int().min(0).optional(),
  unapprovedJournals: z.number().int().min(0).optional(),
  totalAccounts: z.number().int().min(0).optional(),
  reconciledAccounts: z.number().int().min(0).optional(),
});

// ── Accounting Exception ──────────────────────────────────────────────

export const accountingExceptionTypeSchema = z.enum([
  "journal_anomaly", "duplicate_posting", "late_journal", "large_journal",
  "policy_violation", "missing_support", "suspense_account",
  "unbalanced_entry", "missing_approval", "reconciliation_gap",
]);

export const createAccountingExceptionSchema = z.object({
  exceptionType: accountingExceptionTypeSchema,
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  sourceSystem: z.string().default("gl"),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  description: z.string().min(1).max(1000),
  amount: z.number().optional(),
  currency: z.string().length(3).optional(),
});

// ── Recommendations ───────────────────────────────────────────────────

export const recommendationCategorySchema = z.enum([
  "close", "journal", "reconciliation", "statement", "governance", "risk", "efficiency",
]);

export const createRecommendationSchema = z.object({
  category: recommendationCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  businessReason: z.string().max(500).optional(),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  evidence: z.array(z.record(z.string(), z.unknown())).default([]),
  affectedModules: z.array(z.string()).default([]),
  requiredApprovals: z.array(z.string()).default([]),
});

export const updateRecommendationSchema = z.object({
  status: z.enum(["OPEN", "ACCEPTED", "REJECTED", "IMPLEMENTED", "EXPIRED"]).optional(),
  assignedTo: z.string().optional(),
});

export const recommendationQuerySchema = z.object({
  category: recommendationCategorySchema.optional(),
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ── Briefing ──────────────────────────────────────────────────────────

export const briefingQuerySchema = z.object({
  period: z.string().optional(),
  briefingType: z.enum(["daily", "weekly", "period_close", "ad_hoc"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

import { z } from "zod";

// ── Case Types ───────────────────────────────────────────────────

export const caseTypeSchema = z.enum([
  "month_end_close",
  "bank_reconciliation",
  "liquidity_risk",
  "journal_investigation",
  "fraud_investigation",
  "treasury_exception",
  "audit_finding",
  "compliance_issue",
  "cash_forecast",
  "policy_violation",
  "general",
]);

export const caseStatusSchema = z.enum([
  "open",
  "in_progress",
  "awaiting_input",
  "escalated",
  "resolved",
  "closed",
]);

export const casePrioritySchema = z.enum(["low", "medium", "high", "critical"]);

// ── Assignment Types ─────────────────────────────────────────────

export const assignmentTypeSchema = z.enum([
  "investigation",
  "analysis",
  "review",
  "approval",
  "escalation",
]);

export const assignmentStatusSchema = z.enum([
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
]);

// ── Comment Types ────────────────────────────────────────────────

export const commentTypeSchema = z.enum([
  "update",
  "question",
  "answer",
  "escalation",
  "approval",
  "rejection",
]);

// ── Evidence Types ───────────────────────────────────────────────

export const evidenceTypeSchema = z.enum([
  "ledger",
  "transaction",
  "report",
  "policy",
  "document",
  "workflow",
  "audit",
  "bank_data",
  "treasury_data",
  "financial_statement",
]);

// ── Decision Types ───────────────────────────────────────────────

export const registryDecisionTypeSchema = z.enum([
  "strategic",
  "operational",
  "policy",
  "resource",
  "risk",
  "compliance",
]);

export const registryDecisionStatusSchema = z.enum([
  "proposed",
  "reviewing",
  "approved",
  "rejected",
  "implemented",
  "overturned",
]);

// ── Recommendation Types ─────────────────────────────────────────

export const recommendationCategorySchema = z.enum([
  "cash",
  "liquidity",
  "fx",
  "debt",
  "investment",
  "risk",
  "policy",
  "operations",
  "compliance",
  "audit",
  "accounting",
]);

export const sharedRecommendationStatusSchema = z.enum([
  "proposed",
  "approved",
  "rejected",
  "implementing",
  "completed",
  "expired",
]);

export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);

// ── Timeline Types ───────────────────────────────────────────────

export const timelineEventTypeSchema = z.enum([
  "assignment",
  "recommendation",
  "evidence",
  "approval",
  "comment",
  "investigation",
  "workflow_event",
  "system_event",
  "financial_event",
  "human_action",
  "ai_action",
  "escalation",
  "decision",
]);

export const eventSourceTypeSchema = z.enum(["specialist", "human", "system"]);

// ── Workload Types ───────────────────────────────────────────────

export const queueTypeSchema = z.enum([
  "specialist",
  "cross_specialist",
  "human_review",
  "approval",
]);

export const memoryTypeSchema = z.enum([
  "case_context",
  "decision_history",
  "risk_context",
  "policy_context",
  "investigation_context",
  "relationship_context",
]);

// ── Get Cases ────────────────────────────────────────────────────

export const getCasesSchema = z.object({
  status: caseStatusSchema.optional(),
  caseType: caseTypeSchema.optional(),
  priority: casePrioritySchema.optional(),
  ownerSpecialist: z.string().optional(),
});

// ── Create Case ──────────────────────────────────────────────────

export const createCaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  caseType: caseTypeSchema,
  priority: casePrioritySchema,
  ownerSpecialist: z.string().min(1),
});

// ── Update Case ──────────────────────────────────────────────────

export const updateCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: caseStatusSchema.optional(),
  priority: casePrioritySchema.optional(),
  ownerSpecialist: z.string().optional(),
});

// ── Get Assignments ──────────────────────────────────────────────

export const getAssignmentsSchema = z.object({
  caseId: z.string().optional(),
  fromSpecialist: z.string().optional(),
  toSpecialist: z.string().optional(),
  status: assignmentStatusSchema.optional(),
  assignmentType: assignmentTypeSchema.optional(),
});

// ── Create Assignment ────────────────────────────────────────────

export const createAssignmentSchema = z.object({
  caseId: z.string().min(1),
  fromSpecialist: z.string().min(1),
  toSpecialist: z.string().min(1),
  taskTitle: z.string().min(1).max(200),
  taskDescription: z.string().min(1).max(1000),
  assignmentType: assignmentTypeSchema,
  priority: casePrioritySchema,
  dueDate: z.string().datetime().optional(),
});

// ── Get Timeline ─────────────────────────────────────────────────

export const getTimelineSchema = z.object({
  caseId: z.string().optional(),
  eventType: timelineEventTypeSchema.optional(),
  sourceType: eventSourceTypeSchema.optional(),
  specialistName: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// ── Get Recommendations ──────────────────────────────────────────

export const getRecommendationsSchema = z.object({
  status: sharedRecommendationStatusSchema.optional(),
  category: recommendationCategorySchema.optional(),
  primarySpecialist: z.string().optional(),
  caseId: z.string().optional(),
});

// ── Create Shared Recommendation ─────────────────────────────────

export const createSharedRecommendationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: recommendationCategorySchema,
  primarySpecialist: z.string().min(1),
  contributors: z.array(z.string()).optional(),
  businessReason: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
  riskLevel: riskLevelSchema,
  caseId: z.string().optional(),
  requiredApprovals: z.array(z.string()).optional(),
  affectedModules: z.array(z.string()).optional(),
});

// ── Get Work Queue ───────────────────────────────────────────────

export const getWorkQueueSchema = z.object({
  queueName: z.string().optional(),
  queueType: queueTypeSchema.optional(),
  status: z.string().optional(),
});

// ── Get Analytics ────────────────────────────────────────────────

export const getAnalyticsSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  specialist: z.string().optional(),
});

// ── Get Memory ───────────────────────────────────────────────────

export const getMemorySchema = z.object({
  memoryType: memoryTypeSchema.optional(),
  contextKey: z.string().optional(),
  sourceSpecialist: z.string().optional(),
});

// ── Store Memory ─────────────────────────────────────────────────

export const storeMemorySchema = z.object({
  memoryType: memoryTypeSchema,
  contextKey: z.string().min(1),
  contextValue: z.record(z.string(), z.unknown()),
  sourceSpecialist: z.string().min(1),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ── Get Decisions ────────────────────────────────────────────────

export const getDecisionsSchema = z.object({
  status: registryDecisionStatusSchema.optional(),
  decisionType: registryDecisionTypeSchema.optional(),
  decidedBy: z.string().optional(),
});

// ── Create Decision ──────────────────────────────────────────────

export const createDecisionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  decisionType: registryDecisionTypeSchema,
  decidedBy: z.string().min(1),
  decidedByType: z.string().min(1),
  approvalRequired: z.boolean().optional(),
  alternatives: z.array(z.string()).optional(),
  businessImpact: z.string().max(1000).optional(),
  financialImpact: z.number().optional(),
  affectedSpecialists: z.array(z.string()).optional(),
  caseId: z.string().optional(),
});

// ── Get Workloads ────────────────────────────────────────────────

export const getWorkloadsSchema = z.object({
  specialist: z.string().optional(),
});

// ── Get Case Comments ────────────────────────────────────────────

export const getCaseCommentsSchema = z.object({
  caseId: z.string().min(1),
  commentType: commentTypeSchema.optional(),
});

// ── Add Comment ──────────────────────────────────────────────────

export const addCommentSchema = z.object({
  caseId: z.string().min(1),
  content: z.string().min(1).max(5000),
  commentType: commentTypeSchema,
});

// ── Get Case Evidence ────────────────────────────────────────────

export const getCaseEvidenceSchema = z.object({
  caseId: z.string().min(1),
  evidenceType: evidenceTypeSchema.optional(),
});

// ── Add Evidence ─────────────────────────────────────────────────

export const addEvidenceSchema = z.object({
  caseId: z.string().min(1),
  evidenceType: evidenceTypeSchema,
  referenceId: z.string().min(1),
  referenceType: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  source: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

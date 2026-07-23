import { z } from "zod";

// ── Case ──────────────────────────────────────────────────────────────

export const reconciliationTypeSchema = z.enum([
  "bank", "gl", "subledger", "intercompany", "ar", "ap",
  "fixed_asset", "treasury", "payroll", "tax", "multi_company", "multi_currency",
]);

export const reconciliationStatusSchema = z.enum([
  "OPEN", "IN_PROGRESS", "MATCHED", "PARTIALLY_MATCHED",
  "EXCEPTION", "CLOSED", "ESCALATED",
]);

export const createCaseSchema = z.object({
  title: z.string().min(1).max(200),
  reconciliationType: reconciliationTypeSchema,
  period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be YYYY-MM format"),
  entityName: z.string().max(200).optional(),
  currency: z.string().length(3).default("USD"),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const caseQuerySchema = z.object({
  status: reconciliationStatusSchema.optional(),
  reconciliationType: reconciliationTypeSchema.optional(),
  period: z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ── Exception ────────────────────────────────────────────────────────

export const exceptionTypeSchema = z.enum([
  "timing_difference", "duplicate_payment", "missing_journal",
  "missing_bank_entry", "wrong_account", "wrong_currency",
  "fx_difference", "bank_charges", "interest", "manual_adjustment",
  "data_import_error", "unknown",
]);

export const exceptionSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const exceptionStatusSchema = z.enum([
  "OPEN", "INVESTIGATING", "RESOLVED", "ESCALATED", "DISMISSED",
]);

export const sourceSystemSchema = z.enum([
  "bank", "gl", "subledger", "ar", "ap", "manual", "treasury", "payroll", "tax",
]);

export const createExceptionSchema = z.object({
  caseId: z.string().cuid(),
  exceptionType: exceptionTypeSchema,
  severity: exceptionSeveritySchema.default("MEDIUM"),
  sourceSystem: sourceSystemSchema,
  referenceNumber: z.string().max(100).optional(),
  description: z.string().min(1).max(1000),
  amount: z.number(),
  currency: z.string().length(3).default("USD"),
  expectedAmount: z.number().optional(),
  transactionDate: z.string().datetime().optional(),
});

export const updateExceptionSchema = z.object({
  status: exceptionStatusSchema.optional(),
  severity: exceptionSeveritySchema.optional(),
  assignedTo: z.string().optional(),
});

export const exceptionQuerySchema = z.object({
  caseId: z.string().cuid().optional(),
  exceptionType: exceptionTypeSchema.optional(),
  severity: exceptionSeveritySchema.optional(),
  status: exceptionStatusSchema.optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ── Matching ─────────────────────────────────────────────────────────

export const matchingRuleTypeSchema = z.enum([
  "exact", "amount", "reference", "date_tolerance", "currency_tolerance",
  "percentage_tolerance", "many_to_one", "one_to_many", "many_to_many",
  "split", "merged", "custom",
]);

export const matchingCriteriaSchema = z.object({
  matchFields: z.array(z.string()).min(1),
  exactFields: z.array(z.string()).optional(),
  amountTolerance: z.number().min(0).optional(),
  percentageTolerance: z.number().min(0).max(1).optional(),
  dateToleranceDays: z.number().int().min(0).optional(),
  currencyTolerance: z.number().min(0).max(1).optional(),
  maxAutoMatchConfidence: z.number().min(0).max(1).optional(),
  customLogic: z.string().optional(),
});

export const scoringWeightsSchema = z.object({
  amountWeight: z.number().min(0).max(1),
  referenceWeight: z.number().min(0).max(1),
  dateWeight: z.number().min(0).max(1),
  entityWeight: z.number().min(0).max(1),
  descriptionWeight: z.number().min(0).max(1),
}).refine(
  (data) => {
    const total = data.amountWeight + data.referenceWeight + data.dateWeight + data.entityWeight + data.descriptionWeight;
    return Math.abs(total - 1) < 0.01;
  },
  { message: "Scoring weights must sum to 1.0" }
);

export const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  ruleType: matchingRuleTypeSchema,
  priority: z.number().int().min(0).default(0),
  matchingCriteria: matchingCriteriaSchema,
  scoringWeights: scoringWeightsSchema,
  maxConfidenceThreshold: z.number().min(0).max(1).default(0.8),
  autoMatchEnabled: z.boolean().default(false),
});

export const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  priority: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  matchingCriteria: matchingCriteriaSchema.optional(),
  scoringWeights: scoringWeightsSchema.optional(),
  maxConfidenceThreshold: z.number().min(0).max(1).optional(),
  autoMatchEnabled: z.boolean().optional(),
});

// ── Investigation ────────────────────────────────────────────────────

export const investigationActionSchema = z.enum([
  "created", "investigated", "explained", "escalated",
  "resolved", "comment", "evidence_added", "assignment_changed",
]);

export const investigateExceptionSchema = z.object({
  exceptionId: z.string().cuid(),
  action: investigationActionSchema,
  description: z.string().min(1).max(1000),
});

// ── Journal Suggestion ───────────────────────────────────────────────

export const journalSuggestionTypeSchema = z.enum([
  "adjustment", "reclassification", "accrual", "write_off", "correction",
]);

export const journalDraftEntrySchema = z.object({
  accountCode: z.string().min(1),
  accountName: z.string().min(1),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().min(1),
  costCenter: z.string().optional(),
  profitCenter: z.string().optional(),
}).refine(
  (data) => data.debit > 0 || data.credit > 0,
  { message: "Either debit or credit must be greater than 0" }
);

export const suggestJournalSchema = z.object({
  caseId: z.string().cuid(),
  exceptionId: z.string().cuid().optional(),
  suggestionType: journalSuggestionTypeSchema,
  entries: z.array(journalDraftEntrySchema).min(2),
  explanation: z.string().min(1).max(1000),
  businessReason: z.string().min(1).max(1000),
}).refine(
  (data) => {
    const totalDebit = data.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = data.entries.reduce((sum, e) => sum + e.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total debits must equal total credits" }
);

// ── Assignment ───────────────────────────────────────────────────────

export const assignmentRoleSchema = z.enum([
  "reconciler", "reviewer", "approver", "escalation_contact",
]);

export const assignCaseSchema = z.object({
  caseId: z.string().cuid(),
  assignedTo: z.string().min(1),
  role: assignmentRoleSchema.default("reconciler"),
  notes: z.string().max(500).optional(),
});

// ── Escalation ──────────────────────────────────────────────────────

export const escalationTypeSchema = z.enum([
  "exception_age", "high_value", "close_blocker", "policy_violation", "manual",
]);

export const escalateCaseSchema = z.object({
  caseId: z.string().cuid(),
  escalationType: escalationTypeSchema,
  severity: exceptionSeveritySchema,
  reason: z.string().min(1).max(1000),
  escalatedTo: z.string().optional(),
});

// ── Matching History ─────────────────────────────────────────────────

export const matchingHistoryQuerySchema = z.object({
  caseId: z.string().cuid().optional(),
  sourceSystem: sourceSystemSchema.optional(),
  normalizedReference: z.string().optional(),
  normalizedVendor: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

import { z } from "zod";

// ── Audit Plans ───────────────────────────────────────────────────────

export const planTypeSchema = z.enum([
  "internal", "external", "compliance", "operational", "financial", "it", "forensic",
]);

export const planStatusSchema = z.enum([
  "DRAFT", "ACTIVE", "COMPLETED", "CANCELLED", "ARCHIVED",
]);

export const getAuditPlansSchema = z.object({
  planType: planTypeSchema.optional(),
  status: planStatusSchema.optional(),
  fiscalYear: z.string().optional(),
});

export const createAuditPlanSchema = z.object({
  planName: z.string().min(1).max(200),
  planType: planTypeSchema,
  fiscalYear: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  scope: z.string().min(1).max(2000),
});

// ── Audit Engagements ─────────────────────────────────────────────────

export const engagementTypeSchema = z.enum([
  "full_scope", "limited", " targeted", "follow_up", "special",
]);

export const engagementStatusSchema = z.enum([
  "PLANNING", "IN_PROGRESS", "REVIEW", "REPORTING", "COMPLETED", "CANCELLED",
]);

export const getAuditEngagementsSchema = z.object({
  planId: z.string().optional(),
  status: engagementStatusSchema.optional(),
  engagementType: engagementTypeSchema.optional(),
});

export const createAuditEngagementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  engagementType: engagementTypeSchema,
  leadAuditor: z.string().min(1).max(200),
  teamMembers: z.array(z.string()).optional(),
  scope: z.string().min(1).max(2000),
  objectives: z.array(z.string()).min(1),
});

// ── Controls ──────────────────────────────────────────────────────────

export const controlTypeSchema = z.enum([
  "preventive", "detective", "corrective", "compensating",
]);

export const controlCategorySchema = z.enum([
  "financial", "operational", "compliance", "it_general", "it_application",
  "fraud", "strategic", "environmental",
]);

export const controlStatusSchema = z.enum([
  "DRAFT", "ACTIVE", "INACTIVE", "UNDER_REVIEW", "ARCHIVED",
]);

export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const frequencySchema = z.enum([
  "continuous", "daily", "weekly", "monthly", "quarterly", "semi_annual", "annual",
]);

export const getControlsSchema = z.object({
  controlType: controlTypeSchema.optional(),
  category: controlCategorySchema.optional(),
  status: controlStatusSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
});

export const createControlSchema = z.object({
  controlName: z.string().min(1).max(200),
  controlCode: z.string().min(1).max(50),
  controlType: controlTypeSchema,
  category: controlCategorySchema,
  description: z.string().min(1).max(2000),
  frequency: frequencySchema,
  owner: z.string().min(1).max(200),
  riskLevel: riskLevelSchema,
});

// ── Control Tests ─────────────────────────────────────────────────────

export const testTypeSchema = z.enum([
  "walkthrough", "inquiry", "observation", "inspection", "re_performance", "analytical",
]);

export const testResultSchema = z.enum(["PASS", "FAIL", "PARTIAL", "EXCEPTION", "PENDING"]);

export const getControlTestsSchema = z.object({
  controlId: z.string().optional(),
  testType: testTypeSchema.optional(),
  result: testResultSchema.optional(),
});

export const createControlTestSchema = z.object({
  controlId: z.string().min(1),
  testType: testTypeSchema,
  testMethod: z.string().min(1).max(200),
  sampleSize: z.number().int().positive().optional(),
  tester: z.string().min(1).max(200),
  result: testResultSchema,
  findings: z.string().max(2000).optional(),
  exceptions: z.string().max(2000).optional(),
});

// ── Findings ──────────────────────────────────────────────────────────

export const findingTypeSchema = z.enum([
  "material_weakness", "significant_deficiency", "control_deficiency",
  "best_practice", "observation", "non_compliance",
]);

export const findingSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const findingStatusSchema = z.enum([
  "OPEN", "IN_REMEDIATION", "REMEDIATED", "VERIFIED", "CLOSED", "ACCEPTED",
]);

export const getFindingsSchema = z.object({
  severity: findingSeveritySchema.optional(),
  status: findingStatusSchema.optional(),
  findingType: findingTypeSchema.optional(),
  engagementId: z.string().optional(),
});

export const createFindingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  findingType: findingTypeSchema,
  severity: findingSeveritySchema,
  controlId: z.string().optional(),
  affectedAreas: z.array(z.string()).min(1),
  businessImpact: z.string().min(1).max(2000),
  financialImpact: z.number().optional(),
  recommendation: z.string().min(1).max(2000),
  owner: z.string().max(200).optional(),
});

// ── Evidence Packages ─────────────────────────────────────────────────

export const packageTypeSchema = z.enum([
  "financial_statements", "bank_statements", "contracts", "approvals",
  "reconciliations", "workpapers", "correspondence", "other",
]);

export const packageStatusSchema = z.enum([
  "COLLECTING", "REVIEWING", "COMPLETE", "EXCEPTION",
]);

export const getEvidencePackagesSchema = z.object({
  engagementId: z.string().optional(),
  packageType: packageTypeSchema.optional(),
  status: packageStatusSchema.optional(),
});

export const createEvidencePackageSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  packageType: packageTypeSchema,
  engagementId: z.string().min(1),
});

// ── Remediation Plans ─────────────────────────────────────────────────

export const remediationTypeSchema = z.enum([
  "immediate", "short_term", "long_term", "strategic",
]);

export const remediationStatusSchema = z.enum([
  "PLANNED", "IN_PROGRESS", "DELAYED", "COMPLETED", "VERIFIED", "OVERDUE",
]);

export const getRemediationPlansSchema = z.object({
  findingId: z.string().optional(),
  status: remediationStatusSchema.optional(),
  owner: z.string().optional(),
});

export const createRemediationPlanSchema = z.object({
  findingId: z.string().min(1),
  planTitle: z.string().min(1).max(200),
  planDescription: z.string().min(1).max(2000),
  remediationType: remediationTypeSchema,
  owner: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime(),
});

// ── Readiness Snapshots ───────────────────────────────────────────────

export const assessmentTypeSchema = z.enum([
  "annual", "quarterly", "ad_hoc", "regulatory", "pre_audit",
]);

export const getReadinessSnapshotsSchema = z.object({
  assessmentType: assessmentTypeSchema.optional(),
});

export const createReadinessSnapshotSchema = z.object({
  assessmentType: assessmentTypeSchema,
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1).max(2000),
});

// ── Risk Assessments ──────────────────────────────────────────────────

export const getRiskAssessmentsSchema = z.object({
  assessmentType: assessmentTypeSchema.optional(),
});

export const createRiskAssessmentSchema = z.object({
  assessmentType: assessmentTypeSchema,
  overallRiskScore: z.number().min(0).max(100),
  riskByCategory: z.record(z.string(), z.number()),
  assessedBy: z.string().min(1).max(200),
});

// ── Audit Calendar ────────────────────────────────────────────────────

export const calendarEventTypeSchema = z.enum([
  "audit_start", "audit_end", "fieldwork", "report_draft",
  "report_final", "review_meeting", "deadline", "training", "follow_up",
]);

export const getAuditCalendarSchema = z.object({
  eventType: calendarEventTypeSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const addCalendarEventSchema = z.object({
  eventTitle: z.string().min(1).max(200),
  eventType: calendarEventTypeSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  attendees: z.array(z.string()).optional(),
});

// ── Reports ───────────────────────────────────────────────────────────

export const reportTypeSchema = z.enum([
  "audit_report", "management_letter", "summary", "compliance",
  "executive_summary", "follow_up",
]);

export const reportStatusSchema = z.enum([
  "DRAFT", "UNDER_REVIEW", "FINAL", "ISSUED", "ARCHIVED",
]);

export const getReportsSchema = z.object({
  reportType: reportTypeSchema.optional(),
  status: reportStatusSchema.optional(),
  engagementId: z.string().optional(),
});

export const createAuditReportSchema = z.object({
  title: z.string().min(1).max(200),
  reportType: reportTypeSchema,
  content: z.string().min(1),
  engagementId: z.string().optional(),
});

// ── Analytics ─────────────────────────────────────────────────────────

export const getAuditAnalyticsSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metric: z.enum([
    "findings_by_severity", "control_effectiveness", "engagement_status",
    "remediation_progress", "audit_coverage", "risk_trends",
  ]).optional(),
});

// ── Continuous Audit ──────────────────────────────────────────────────

export const getContinuousAuditSchema = z.object({});

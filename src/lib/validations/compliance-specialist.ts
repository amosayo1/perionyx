import { z } from "zod";

const dateStr = z.string().datetime().transform((v) => new Date(v));

const frameworkType = z.enum([
  "sox", "gaap", "ifrs", "basel_iii", "mifid_ii", "gdpr", "ccpa",
  "aml_kyc", "pci_dss", "iso_27001", "soc_2", "coso", "nist",
  "hipaa", "fedramp", "dORA", "custom",
]);

const requirementType = z.enum([
  "control", "procedure", "disclosure", "reporting", "data_protection",
  "operational", "governance", "financial", "technical", "organizational",
]);

const obligationType = z.enum([
  "regulatory", "contractual", "internal_policy", "industry_standard",
  "legal", "tax", "disclosure", "reporting",
]);

const obligationStatus = z.enum([
  "active", "pending", "overdue", "completed", "suspended", "expired", "waived",
]);

const policyCategory = z.enum([
  "information_security", "data_privacy", "anti_fraud", "aml", "kyc",
  "conflict_of_interest", "whistleblower", "code_of_conduct",
  "vendor_management", "business_continuity", "incident_response",
  "access_control", "change_management", "retention", "ethics", "operational_risk",
]);

const policyStatus = z.enum([
  "draft", "under_review", "approved", "active", "superseded", "retired", "archived",
]);

const violationType = z.enum([
  "regulatory_breach", "policy_violation", "control_failure", "reporting_failure",
  "disclosure_failure", "data_breach", "unauthorized_access", "conflict_of_interest",
  "aml_suspicious_activity", "fiduciary_breach",
]);

const violationSeverity = z.enum(["low", "medium", "high", "critical", "systemic"]);

const violationStatus = z.enum([
  "detected", "under_investigation", "confirmed", "remediation_required",
  "remediation_in_progress", "resolved", "escalated", "closed", "false_positive",
]);

const assessmentType = z.enum([
  "gap_analysis", "risk_assessment", "maturity_assessment", "impact_assessment",
  "compliance_review", "control_effectiveness", "vendor_assessment",
  "incident_assessment", "annual_review", "regulatory_impact",
]);

const filingType = z.enum([
  "regulatory_return", "tax_filing", "statutory_return", "disclosure",
  "notification", "annual_report", "quarterly_report", "sar", "ctr",
  "suspicious_activity_report", "breach_notification", "board_report",
]);

const filingFrequency = z.enum([
  "one_time", "daily", "weekly", "monthly", "quarterly", "semi_annual", "annual", "on_event",
]);

const filingStatus = z.enum([
  "not_started", "in_preparation", "under_review", "pending_approval",
  "approved", "submitted", "accepted", "rejected", "overdue", "amended",
]);

const regulatoryUpdateType = z.enum([
  "new_regulation", "amendment", "guidance", "enforcement_action",
  "interpretation", "exemption", "consultation", "standard_update", "case_law",
]);

const remediationStatus = z.enum([
  "not_started", "in_progress", "on_track", "behind_schedule",
  "completed", "verified", "overdue", "cancelled",
]);

const briefingType = z.enum([
  "daily", "weekly", "monthly", "quarterly", "ad_hoc",
  "regulatory_change", "violation_alert", "filing_reminder", "board_summary",
]);

// ─── Framework Schemas ─────────────────────────────────────

export const getFrameworksQuerySchema = z.object({
  frameworkType: frameworkType.optional(),
  status: policyStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createFrameworkSchema = z.object({
  frameworkType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  version: z.string().max(50).default("1.0"),
  jurisdiction: z.string().max(200).optional(),
  effectiveDate: dateStr.optional(),
  regulatoryBody: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateFrameworkSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  version: z.string().max(50).optional(),
  status: policyStatus.optional(),
  jurisdiction: z.string().max(200).optional(),
  effectiveDate: dateStr.optional(),
  regulatoryBody: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Requirement Schemas ───────────────────────────────────

export const getRequirementsQuerySchema = z.object({
  frameworkId: z.string().optional(),
  requirementType: requirementType.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRequirementSchema = z.object({
  frameworkId: z.string().min(1, "Framework ID is required"),
  requirementType,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  controlObjective: z.string().max(1000).optional(),
  implementationGuidance: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Policy Schemas ────────────────────────────────────────

export const getPoliciesQuerySchema = z.object({
  category: policyCategory.optional(),
  status: policyStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createPolicySchema = z.object({
  category: policyCategory,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  content: z.string().max(50000).optional(),
  effectiveDate: dateStr.optional(),
  reviewDate: dateStr.optional(),
  owner: z.string().max(200).optional(),
  frameworkIds: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updatePolicySchema = z.object({
  category: policyCategory.optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  content: z.string().max(50000).optional(),
  status: policyStatus.optional(),
  effectiveDate: dateStr.optional(),
  reviewDate: dateStr.optional(),
  owner: z.string().max(200).optional(),
  frameworkIds: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Obligation Schemas ────────────────────────────────────

export const getObligationsQuerySchema = z.object({
  obligationType: obligationType.optional(),
  status: obligationStatus.optional(),
  frameworkId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createObligationSchema = z.object({
  obligationType,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  frameworkId: z.string().optional(),
  policyId: z.string().optional(),
  dueDate: dateStr.optional(),
  assignee: z.string().max(200).optional(),
  frequency: filingFrequency.optional(),
  jurisdiction: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Violation Schemas ─────────────────────────────────────

export const getViolationsQuerySchema = z.object({
  violationType: violationType.optional(),
  severity: violationSeverity.optional(),
  status: violationStatus.optional(),
  frameworkId: z.string().optional(),
  policyId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createViolationSchema = z.object({
  violationType,
  severity: violationSeverity,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  frameworkId: z.string().optional(),
  policyId: z.string().optional(),
  obligationId: z.string().optional(),
  detectedDate: dateStr.optional(),
  reportedBy: z.string().max(200).optional(),
  jurisdiction: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateViolationStatusSchema = z.object({
  status: violationStatus,
});

// ─── Filing Schemas ────────────────────────────────────────

export const getFilingsQuerySchema = z.object({
  filingType: filingType.optional(),
  status: filingStatus.optional(),
  frequency: filingFrequency.optional(),
  jurisdiction: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createFilingSchema = z.object({
  filingType,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  frequency: filingFrequency,
  dueDate: dateStr,
  jurisdiction: z.string().max(200).optional(),
  regulatoryBody: z.string().max(200).optional(),
  frameworkId: z.string().optional(),
  assignee: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateFilingStatusSchema = z.object({
  status: filingStatus,
});

// ─── Assessment Schemas ────────────────────────────────────

export const getAssessmentsQuerySchema = z.object({
  assessmentType: assessmentType.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createAssessmentSchema = z.object({
  assessmentType,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  scope: z.string().max(2000).optional(),
  assessedBy: z.string().max(200).optional(),
  overallRiskScore: z.number().min(0).max(1).optional(),
  risksByCategory: z.record(z.string(), z.number()).default({}),
  highRiskAreas: z.array(z.string()).default([]),
  notes: z.string().max(5000).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Regulatory Update Schemas ─────────────────────────────

export const getRegulatoryUpdatesQuerySchema = z.object({
  updateType: regulatoryUpdateType.optional(),
  jurisdiction: z.string().optional(),
  impactLevel: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRegulatoryUpdateSchema = z.object({
  updateType: regulatoryUpdateType,
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().max(5000).default(""),
  fullText: z.string().max(50000).optional(),
  jurisdiction: z.string().min(1, "Jurisdiction is required").max(200),
  regulatoryBody: z.string().max(200).optional(),
  publishedDate: dateStr.optional(),
  effectiveDate: dateStr.optional(),
  impactLevel: z.string().max(50).optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const assessRegulatoryUpdateSchema = z.object({
  impactLevel: z.string().min(1, "Impact level is required").max(50),
  affectedFrameworks: z.array(z.string()).default([]),
  affectedPolicies: z.array(z.string()).default([]),
  assessmentNotes: z.string().max(5000).default(""),
  actionRequired: z.boolean().default(false),
  deadline: dateStr.optional(),
});

// ─── Remediation Schemas ───────────────────────────────────

export const getRemediationsQuerySchema = z.object({
  status: remediationStatus.optional(),
  violationId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRemediationSchema = z.object({
  violationId: z.string().min(1, "Violation ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  actionPlan: z.string().max(5000).optional(),
  targetDate: dateStr,
  owner: z.string().max(200).optional(),
  priority: violationSeverity.optional(),
  estimatedCost: z.number().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateRemediationStatusSchema = z.object({
  status: remediationStatus,
});

// ─── Health Snapshot Schemas ────────────────────────────────

export const getHealthSnapshotsQuerySchema = z.object({
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

export const createHealthSnapshotSchema = z.object({
  domainScores: z.record(z.string(), z.number()).default({}),
  notes: z.string().max(5000).optional(),
});

// ─── Risk Assessment Schemas ───────────────────────────────

export const getRiskAssessmentsQuerySchema = z.object({
  assessmentType: assessmentType.optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRiskAssessmentSchema = z.object({
  assessmentType,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  overallRiskScore: z.number().min(0).max(1).optional(),
  risksByCategory: z.record(z.string(), z.number()).default({}),
  highRiskAreas: z.array(z.string()).default([]),
  assessedBy: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
});

// ─── Briefing Schemas ──────────────────────────────────────

export const getBriefingsQuerySchema = z.object({
  briefingType: briefingType.optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

export const createBriefingSchema = z.object({
  briefingType,
  period: z.string().max(100).optional(),
  customNotes: z.string().max(5000).optional(),
});

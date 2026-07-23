import { z } from "zod";

const dateStr = z.string().datetime().transform((v) => new Date(v));

// ─── Shared Enums ──────────────────────────────────────────

const jurisdictionType = z.enum([
  "federal", "state", "local", "international", "municipal", "regional", "special_economic_zone",
]);

const rateType = z.enum([
  "corporate_income", "personal_income", "sales_tax", "vat", "gst", "withholding",
  "capital_gains", "stamp_duty", "property_tax", "excise", "carbon", "digital_services", "transfer_pricing",
]);

const provisionType = z.enum([
  "current_tax", "deferred_tax", "uncertain_tax_position", "tax_contingency",
  "valuation_allowance", "tax_credit", "tax_loss_carryforward", "tax_loss_carryback",
]);

const provisionStatus = z.enum(["draft", "under_review", "approved", "filed", "amended", "closed", "disputed"]);

const temporaryDifferenceType = z.enum([
  "accelerated_depreciation", "straight_line_depreciation", "installment_sales", "warranty_reserves",
  "unrealized_gains_losses", "pension_obligations", "stock_compensation", "foreign_tax_credits",
  "net_operating_loss", "research_credits", "lease_accounting", "intangible_amortization",
  "bad_debt_reserves", "inventory_write_downs", "restructuring_reserves",
]);

const returnType = z.enum([
  "federal_income", "state_income", "local_income", "vat_return", "gst_return",
  "withholding_return", "property_tax_return", "excise_return", "sales_tax_return",
  "franchise_tax", "capital_gains", "information_return", "estimated_tax",
]);

const returnStatus = z.enum([
  "not_started", "in_progress", "review", "approved", "filed", "accepted",
  "rejected", "amended", "extension_filed", "closed",
]);

const filingType = z.enum([
  "original", "amended", "superseded", "extension", "refund_claim",
  "carryback_claim", "refund_amendment", "information_only",
]);

const filingStatus = z.enum([
  "pending_preparation", "pending_review", "pending_approval", "approved",
  "submitted", "accepted", "rejected", "resubmitted", "closed",
]);

const deadlineType = z.enum([
  "filing", "payment", "estimated_payment", "extension", "response", "audit",
  "transfer_pricing_documentation", "information_return", "annual_return", "quarterly_return",
]);

const deadlineStatus = z.enum(["upcoming", "due_soon", "overdue", "completed", "extended", "cancelled", "waived"]);

const paymentType = z.enum([
  "estimated_quarterly", "annual_return", "extension_payment", "amended_return",
  "refund", "penalty", "interest", "audit_assessment", "installment_agreement",
]);

const paymentStatus = z.enum(["pending", "scheduled", "processing", "completed", "failed", "refunded", "cancelled", "overdue"]);

const intercompanyType = z.enum([
  "goods_sale", "services", "royalty", "license_fee", "management_fee",
  "cost_sharing", "guarantee_fee", "loan", "commission", "rental", "insurance", "cost_contribution",
]);

const armLengthMethod = z.enum([
  "comparable_uncontrolled_price", "resale_price_method", "cost_plus_method",
  "transactional_net_margin_method", "profit_split_method", "other_method",
]);

const assessmentType = z.enum([
  "risk_rating", "compliance_audit", "transfer_pricing_audit", "tax_controversy",
  "voluntary_disclosure", "map_adjustment", "competent_authority", "mutual_agreement_procedure",
]);

const assessmentStatus = z.enum(["identified", "assessed", "in_progress", "mitigated", "resolved", "escalated", "closed"]);

const scenarioType = z.enum([
  "tax_optimization", "restructuring", "expansion", "repatriation", "exit_strategy",
  "r_and_d_credit", "green_incentive", "custom",
]);

const scenarioStatus = z.enum(["draft", "analyzing", "analyzed", "recommended", "approved", "implemented", "rejected", "archived"]);

const recommendationCategory = z.enum([
  "tax_credit_optimization", "deduction_maximization", "entity_restructuring", "transfer_pricing",
  "tax_loss_utilization", "incentive_program", "compliance_improvement", "risk_mitigation",
  "international_planning", "research_and_development",
]);

const riskLevel = z.enum(["low", "medium", "high", "critical"]);

const recommendationStatus = z.enum([
  "proposed", "under_evaluation", "approved_for_action", "in_implementation",
  "completed", "rejected", "deferred",
]);

const priority = z.enum(["critical", "high", "medium", "low", "backlog"]);

const briefingType = z.enum([
  "daily", "weekly", "monthly", "quarterly", "ad_hoc", "board_summary",
  "audit_briefing", "planning_review", "risk_assessment",
]);

// ─── Jurisdiction Schemas ──────────────────────────────────

export const getJurisdictionsQuerySchema = z.object({
  jurisdictionType: jurisdictionType.optional(),
  country: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createJurisdictionSchema = z.object({
  jurisdictionType,
  name: z.string().min(1, "Name is required").max(200),
  code: z.string().min(1, "Code is required").max(50),
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  taxAuthority: z.string().max(200).optional().default(""),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Rate Schemas ──────────────────────────────────────────

export const getRatesQuerySchema = z.object({
  jurisdictionId: z.string().optional(),
  rateType: rateType.optional(),
  isActive: z.string().transform((v) => v === "true").optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRateSchema = z.object({
  jurisdictionId: z.string().min(1, "Jurisdiction ID is required"),
  rateType,
  name: z.string().min(1, "Name is required").max(200),
  rate: z.number().min(0, "Rate must be positive"),
  minRate: z.number().optional(),
  maxRate: z.number().optional(),
  effectiveFrom: dateStr,
  effectiveTo: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Return Schemas ────────────────────────────────────────

export const getTaxReturnsQuerySchema = z.object({
  returnType: returnType.optional(),
  status: returnStatus.optional(),
  jurisdictionId: z.string().optional(),
  fiscalYear: z.string().transform((v) => parseInt(v, 10)).optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createReturnSchema = z.object({
  jurisdictionId: z.string().min(1, "Jurisdiction ID is required"),
  returnType,
  name: z.string().min(1, "Name is required").max(200),
  taxPeriod: z.string().min(1, "Tax period is required").max(50),
  fiscalYear: z.number().int().min(2020).max(2050),
  dueDate: dateStr,
  totalIncome: z.number(),
  totalDeductions: z.number(),
  taxableIncome: z.number(),
  taxLiability: z.number(),
  credits: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateReturnStatusSchema = z.object({
  status: returnStatus,
});

// ─── Payment Schemas ───────────────────────────────────────

export const getPaymentsQuerySchema = z.object({
  paymentType: paymentType.optional(),
  status: paymentStatus.optional(),
  jurisdictionId: z.string().optional(),
  taxPeriod: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createPaymentSchema = z.object({
  jurisdictionId: z.string().min(1, "Jurisdiction ID is required"),
  paymentType,
  name: z.string().min(1, "Name is required").max(200),
  amount: z.number().min(0, "Amount must be positive"),
  taxPeriod: z.string().min(1, "Tax period is required").max(50),
  dueDate: dateStr,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Filing Schemas ────────────────────────────────────────

export const getFilingsQuerySchema = z.object({
  filingType: filingType.optional(),
  status: filingStatus.optional(),
  jurisdictionId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createFilingSchema = z.object({
  returnId: z.string().optional(),
  filingType,
  name: z.string().min(1, "Name is required").max(200),
  jurisdictionId: z.string().min(1, "Jurisdiction ID is required"),
  taxType: z.string().min(1, "Tax type is required").max(100),
  period: z.string().min(1, "Period is required").max(50),
  dueDate: dateStr,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Deadline Schemas ──────────────────────────────────────

export const getDeadlinesQuerySchema = z.object({
  deadlineType: deadlineType.optional(),
  status: deadlineStatus.optional(),
  jurisdictionId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createDeadlineSchema = z.object({
  jurisdictionId: z.string().min(1, "Jurisdiction ID is required"),
  deadlineType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  dueDate: dateStr,
  extendedUntil: dateStr.optional(),
  assignedTo: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateDeadlineStatusSchema = z.object({
  status: deadlineStatus,
});

// ─── Provision Schemas ─────────────────────────────────────

export const getProvisionsQuerySchema = z.object({
  provisionType: provisionType.optional(),
  status: provisionStatus.optional(),
  fiscalYear: z.string().transform((v) => parseInt(v, 10)).optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createProvisionSchema = z.object({
  provisionType,
  name: z.string().min(1, "Name is required").max(200),
  taxPeriod: z.string().min(1, "Tax period is required").max(50),
  fiscalYear: z.number().int().min(2020).max(2050),
  currentTaxLiability: z.number(),
  deferredTaxLiability: z.number().optional(),
  deferredTaxAsset: z.number().optional(),
  uncertainTaxPositions: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateProvisionStatusSchema = z.object({
  status: provisionStatus,
});

export const createDeferredTaxSchema = z.object({
  provisionId: z.string().min(1, "Provision ID is required"),
  differenceType: temporaryDifferenceType,
  description: z.string().min(1, "Description is required").max(500),
  carryingAmount: z.number(),
  taxBase: z.number(),
  enactedRate: z.number().min(0).max(100),
  reversalPeriod: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Transfer Pricing Schemas ──────────────────────────────

export const getTransferPricingQuerySchema = z.object({
  intercompanyType: intercompanyType.optional(),
  armLengthMethod: armLengthMethod.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createTransferPricingSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  intercompanyType,
  armLengthMethod,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateTransferPricingSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  armLengthMethod: armLengthMethod.optional(),
  documentationStatus: z.string().max(50).optional(),
  nextReviewDate: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createIntercompanyRuleSchema = z.object({
  policyId: z.string().min(1, "Policy ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  fromEntity: z.string().min(1, "From entity is required").max(200),
  toEntity: z.string().min(1, "To entity is required").max(200),
  transactionType: intercompanyType,
  pricingMethod: armLengthMethod,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Risk Schemas ──────────────────────────────────────────

export const getRiskAssessmentsQuerySchema = z.object({
  assessmentType: assessmentType.optional(),
  riskLevel: riskLevel.optional(),
  status: assessmentStatus.optional(),
  jurisdictionId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRiskAssessmentSchema = z.object({
  assessmentType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  jurisdictionId: z.string().optional(),
  riskLevel,
  estimatedExposure: z.number().min(0),
  probability: z.number().min(0).max(1),
  mitigationPlan: z.string().max(2000).optional(),
  assignedTo: z.string().max(200).optional(),
  dueDate: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Planning Schemas ──────────────────────────────────────

export const getPlanningScenariosQuerySchema = z.object({
  scenarioType: scenarioType.optional(),
  status: scenarioStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createPlanningScenarioSchema = z.object({
  scenarioType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  taxSavings: z.number(),
  implementationCost: z.number(),
  riskLevel,
  timeline: z.string().max(200).default(""),
  assumptions: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateScenarioStatusSchema = z.object({
  status: scenarioStatus,
});

// ─── Recommendation Schemas ────────────────────────────────

export const getRecommendationsQuerySchema = z.object({
  category: recommendationCategory.optional(),
  riskLevel: riskLevel.optional(),
  priority: priority.optional(),
  status: recommendationStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createRecommendationSchema = z.object({
  category: recommendationCategory,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  rationale: z.string().max(2000).default(""),
  riskLevel,
  priority,
  estimatedSavings: z.number(),
  assignedTo: z.string().max(200).optional(),
  dueDate: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateRecommendationStatusSchema = z.object({
  status: recommendationStatus,
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

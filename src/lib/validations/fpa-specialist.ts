import { z } from "zod";

const dateStr = z.string().datetime().transform((v) => new Date(v));

// ─── Shared Enums ──────────────────────────────────────────

const planType = z.enum([
  "strategic", "annual", "rolling", "projected", "long_range", "contingency",
]);

const planningCycleType = z.enum([
  "annual", "quarterly", "monthly", "rolling_12", "rolling_3", "ad_hoc",
]);

const budgetType = z.enum([
  "operating", "capital", "project", "department", "zero_based", "incremental", "activity_based",
]);

const forecastType = z.enum([
  "revenue", "expense", "cash_flow", "balance_sheet", "headcount", "working_capital",
]);

const forecastHorizon = z.enum([
  "weekly", "monthly", "quarterly", "semi_annual", "annual", "multi_year",
]);

const scenarioType = z.enum([
  "base", "optimistic", "pessimistic", "stress_test", "what_if", "monte_carlo", "sensitivity", "custom",
]);

const driverCategory = z.enum([
  "revenue", "cost", "volume", "price", "headcount", "productivity",
  "market", "macroeconomic", "operational", "financial",
]);

const varianceAnalysisType = z.enum([
  "budget_vs_actual", "forecast_vs_actual", "period_over_period",
  "year_over_year", "rolling_variance", "bridge_analysis",
]);

const capitalPlanStatus = z.enum([
  "draft", "submitted", "under_review", "approved", "rejected", "implemented", "completed",
]);

const investmentType = z.enum([
  "infrastructure", "technology", "acquisition", "rnd", "market_expansion",
  "working_capital", "maintenance", "strategic",
]);

const investmentStatus = z.enum([
  "proposed", "evaluated", "approved", "funded", "in_progress", "completed", "deferred", "cancelled",
]);

const investmentPriority = z.enum(["critical", "high", "medium", "low", "backlog"]);

const initiativeType = z.enum([
  "cost_reduction", "revenue_growth", "efficiency", "digital_transformation",
  "market_entry", "product_development", "compliance", "sustainability",
]);

const initiativeStatus = z.enum([
  "proposed", "planned", "active", "on_track", "at_risk", "delayed", "completed", "cancelled",
]);

const recommendationCategory = z.enum([
  "cost_optimization", "revenue_enhancement", "capital_allocation", "risk_mitigation",
  "process_improvement", "strategic_realignment", "resource_optimization", "compliance_action",
]);

const riskLevel = z.enum(["low", "medium", "high", "critical"]);

const briefingType = z.enum([
  "daily", "weekly", "monthly", "quarterly", "ad_hoc", "board_summary",
  "variance_deep_dive", "forecast_review", "capital_review",
]);

// ─── Plan Schemas ──────────────────────────────────────────

export const getPlansQuerySchema = z.object({
  planType: planType.optional(),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createPlanSchema = z.object({
  planType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  startDate: dateStr,
  endDate: dateStr,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.string().max(50).optional(),
  startDate: dateStr.optional(),
  endDate: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Cycle Schemas ─────────────────────────────────────────

export const getCyclesQuerySchema = z.object({
  cycleType: planningCycleType.optional(),
  status: z.string().optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createCycleSchema = z.object({
  cycleType: planningCycleType,
  name: z.string().min(1, "Name is required").max(200),
  startDate: dateStr,
  endDate: dateStr,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const lockCycleSchema = z.object({
  cycleId: z.string().min(1, "Cycle ID is required"),
});

// ─── Budget Schemas ────────────────────────────────────────

export const getBudgetsQuerySchema = z.object({
  budgetType: budgetType.optional(),
  fiscalYear: z.string().transform((v) => parseInt(v, 10)).optional(),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createBudgetSchema = z.object({
  budgetType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  fiscalYear: z.number().int().min(2020).max(2050),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const createBudgetVersionSchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  name: z.string().min(1, "Name is required").max(200),
});

export const getBudgetLinesQuerySchema = z.object({
  versionId: z.string().optional(),
  department: z.string().optional(),
  accountCode: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(200, Math.max(1, parseInt(v, 10) || 100))).optional(),
});

export const createBudgetLineSchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
  accountCode: z.string().min(1, "Account code is required").max(50),
  accountName: z.string().min(1, "Account name is required").max(200),
  department: z.string().max(200).optional(),
  description: z.string().max(2000).default(""),
  budgetAmount: z.number().min(0, "Amount must be positive"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateBudgetLineSchema = z.object({
  accountName: z.string().min(1).max(200).optional(),
  department: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  budgetAmount: z.number().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const lockBudgetSchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
});

// ─── Forecast Schemas ──────────────────────────────────────

export const getForecastsQuerySchema = z.object({
  forecastType: forecastType.optional(),
  horizon: forecastHorizon.optional(),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createForecastSchema = z.object({
  forecastType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  horizon: forecastHorizon,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const createForecastVersionSchema = z.object({
  forecastId: z.string().min(1, "Forecast ID is required"),
  name: z.string().min(1, "Name is required").max(200),
});

export const getForecastTrendQuerySchema = z.object({
  forecastType: forecastType.default("revenue"),
});

// ─── Scenario Schemas ──────────────────────────────────────

export const getScenariosQuerySchema = z.object({
  scenarioType: scenarioType.optional(),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createScenarioSchema = z.object({
  scenarioType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  assumptions: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const executeScenarioSchema = z.object({
  period: z.string().min(1, "Period is required").max(50),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

export const compareScenariosSchema = z.object({
  scenarioIds: z.array(z.string()).min(2, "At least 2 scenarios required"),
  metrics: z.array(z.string()).optional(),
});

// ─── Driver Schemas ────────────────────────────────────────

export const getDriversQuerySchema = z.object({
  category: driverCategory.optional(),
  isActive: z.string().transform((v) => v === "true").optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createDriverSchema = z.object({
  category: driverCategory,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  unit: z.string().min(1, "Unit is required").max(50),
  currentValue: z.number(),
  baseValue: z.number(),
  lowerBound: z.number().optional(),
  upperBound: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateDriverSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  unit: z.string().min(1).max(50).optional(),
  currentValue: z.number().optional(),
  baseValue: z.number().optional(),
  lowerBound: z.number().optional(),
  upperBound: z.number().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createAssumptionSchema = z.object({
  driverId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  value: z.number(),
  confidence: z.number().min(0).max(1),
  source: z.string().min(1, "Source is required").max(200),
  validFrom: dateStr,
  validTo: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const sensitivityAnalysisSchema = z.object({
  lowerBound: z.number(),
  upperBound: z.number(),
  steps: z.number().int().min(1).max(100).default(10),
});

// ─── Variance Analysis Schemas ─────────────────────────────

export const getAnalysesQuerySchema = z.object({
  analysisType: varianceAnalysisType.optional(),
  period: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createAnalysisSchema = z.object({
  analysisType: varianceAnalysisType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  period: z.string().min(1, "Period is required").max(50),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Capital Plan Schemas ──────────────────────────────────

export const getCapitalPlansQuerySchema = z.object({
  status: capitalPlanStatus.optional(),
  fiscalYear: z.string().transform((v) => parseInt(v, 10)).optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createCapitalPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  totalBudget: z.number().min(0, "Budget must be positive"),
  fiscalYear: z.number().int().min(2020).max(2050),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── Proposal Schemas ──────────────────────────────────────

export const getProposalsQuerySchema = z.object({
  investmentType: investmentType.optional(),
  status: investmentStatus.optional(),
  priority: investmentPriority.optional(),
  capitalPlanId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
});

export const createProposalSchema = z.object({
  capitalPlanId: z.string().optional(),
  investmentType,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).default(""),
  requestedAmount: z.number().min(0, "Amount must be positive"),
  priority: investmentPriority,
  expectedROI: z.number().min(0).max(1000).optional(),
  paybackPeriod: z.number().int().min(1).max(100).optional(),
  proposedBy: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateProposalStatusSchema = z.object({
  status: investmentStatus,
});

// ─── Recommendation Schemas ────────────────────────────────

export const getRecommendationsQuerySchema = z.object({
  category: recommendationCategory.optional(),
  riskLevel: riskLevel.optional(),
  status: z.string().optional(),
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
  estimatedImpact: z.number(),
  impactType: z.string().min(1, "Impact type is required").max(100),
  assignedTo: z.string().max(200).optional(),
  dueDate: dateStr.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateRecommendationStatusSchema = z.object({
  status: z.string().min(1, "Status is required").max(50),
});

// ─── Board Pack Schemas ────────────────────────────────────

export const getBoardPacksQuerySchema = z.object({
  period: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional(),
});

// ─── Initiative Schemas ────────────────────────────────────

export const getInitiativesQuerySchema = z.object({
  initiativeType: initiativeType.optional(),
  status: initiativeStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 50))).optional(),
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

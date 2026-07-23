import { z } from "zod";

// ── Cash Position ─────────────────────────────────────────────────────

export const getCashPositionSchema = z.object({
  region: z.string().optional(),
  currency: z.string().length(3).optional(),
  classification: z.enum(["operating", "reserve", "restricted", "in_transit"]).optional(),
});

// ── Liquidity Forecast ────────────────────────────────────────────────

export const forecastHorizonSchema = z.enum(["daily", "weekly", "monthly", "quarterly", "annual"]);

export const forecastScenarioSchema = z.enum(["best", "expected", "worst"]);

export const getLiquidityForecastSchema = z.object({
  horizon: forecastHorizonSchema.optional(),
  scenario: forecastScenarioSchema.optional(),
});

// ── FX Exposure ───────────────────────────────────────────────────────

export const getFXExposureSchema = z.object({
  currency: z.string().length(3).optional(),
  region: z.string().optional(),
});

// ── Bank Relationships ────────────────────────────────────────────────

export const getBankRelationshipsSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "CLOSED"]).optional(),
  relationshipType: z.enum(["operating", "depository", "credit", "custody", "correspondent"]).optional(),
});

// ── Debt Instruments ──────────────────────────────────────────────────

export const getDebtInstrumentsSchema = z.object({
  instrumentType: z.enum(["term_loan", "revolver", "bond", "commercial_paper", "lease", "note"]).optional(),
  status: z.enum(["ACTIVE", "MATURED", "DEFAULTED", "RESTRUCTURED", "PENDING"]).optional(),
});

// ── Investment Holdings ───────────────────────────────────────────────

export const getInvestmentHoldingsSchema = z.object({
  instrumentType: z.enum(["treasury_bill", "money_market", "bond", "equity", "fund", "cd", "commercial_paper"]).optional(),
  liquidityClassification: z.enum(["immediate", "same_day", "t_plus_1", "t_plus_2", "weekly", "monthly"]).optional(),
});

// ── Treasury Risks ────────────────────────────────────────────────────

export const getTreasuryRisksSchema = z.object({
  riskType: z.enum(["interest_rate", "fx", "liquidity", "counterparty", "operational", "compliance"]).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["OPEN", "MITIGATING", "ACCEPTED", "CLOSED"]).optional(),
});

// ── Recommendations ───────────────────────────────────────────────────

export const treasuryRecommendationCategorySchema = z.enum([
  "cash_management", "investment", "debt", "fx", "risk", "compliance", "efficiency",
]);

export const treasuryRecommendationStatusSchema = z.enum([
  "OPEN", "ACCEPTED", "REJECTED", "IMPLEMENTED", "EXPIRED",
]);

export const getRecommendationsSchema = z.object({
  category: treasuryRecommendationCategorySchema.optional(),
  status: treasuryRecommendationStatusSchema.optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

// ── Briefings ─────────────────────────────────────────────────────────

export const briefingTypeSchema = z.enum(["daily", "weekly", "monthly", "ad_hoc"]);

export const getBriefingsSchema = z.object({
  briefingType: briefingTypeSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// ── Alerts ────────────────────────────────────────────────────────────

export const alertTypeSchema = z.enum([
  "balance_threshold", "payment_overdue", "fx_rate", "maturity", "covenant_breach",
  "cash_shortage", "compliance", "counterparty", "liquidity", "rate_change",
]);

export const alertSeveritySchema = z.enum(["INFO", "WARNING", "CRITICAL", "URGENT"]);

export const alertStatusSchema = z.enum(["ACTIVE", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"]);

export const getAlertsSchema = z.object({
  alertType: alertTypeSchema.optional(),
  severity: alertSeveritySchema.optional(),
  status: alertStatusSchema.optional(),
});

// ── Analytics ─────────────────────────────────────────────────────────

export const getAnalyticsSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metric: z.enum([
    "cash_position", "liquidity", "fx_exposure", "bank_relationships",
    "debt_instruments", "investment_holdings", "risks",
  ]).optional(),
});

// ── Generate Briefing ─────────────────────────────────────────────────

export const generateBriefingSchema = z.object({
  briefingType: briefingTypeSchema,
  date: z.string().datetime().optional(),
});

// ── Create Recommendation ─────────────────────────────────────────────

export const createTreasuryRecommendationSchema = z.object({
  category: treasuryRecommendationCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  businessReason: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  financialImpact: z.number().optional(),
  affectedModules: z.array(z.string()).default([]),
  requiredApprovals: z.array(z.string()).default([]),
});

// ── Update Recommendation ─────────────────────────────────────────────

export const updateTreasuryRecommendationSchema = z.object({
  id: z.string().min(1),
  status: treasuryRecommendationStatusSchema.optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

// ── Command Center ────────────────────────────────────────────────────

export const getCashCommandCenterSchema = z.object({
  includeRestricted: z.boolean().optional(),
  includeInTransit: z.boolean().optional(),
});

// ── Forecast ──────────────────────────────────────────────────────────

export const getForecastSchema = z.object({
  horizon: forecastHorizonSchema,
  scenario: forecastScenarioSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ── Debt Management ──────────────────────────────────────────────────

export const getDebtManagementSchema = z.object({
  includeCovenants: z.boolean().optional(),
  includeAlerts: z.boolean().optional(),
});

// ── Investment Portfolio ──────────────────────────────────────────────

export const getInvestmentPortfolioSchema = z.object({
  includeRecommendations: z.boolean().optional(),
});

// ── Risk Center ───────────────────────────────────────────────────────

export const getRiskCenterSchema = z.object({
  includeTrends: z.boolean().optional(),
  includeHeatmap: z.boolean().optional(),
});

// ── Workspace Preferences ─────────────────────────────────────────────

export const getWorkspacePreferencesSchema = z.object({});

export const updateWorkspacePreferencesSchema = z.object({
  defaultCurrency: z.string().length(3).optional(),
  defaultHorizon: forecastHorizonSchema.optional(),
  defaultScenario: forecastScenarioSchema.optional(),
  alertThresholds: z.record(z.string(), z.unknown()).optional(),
  dashboardLayout: z.record(z.string(), z.unknown()).optional(),
  currencyPairs: z.array(z.string()).optional(),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
});

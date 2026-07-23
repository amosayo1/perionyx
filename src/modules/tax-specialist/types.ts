// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Jurisdiction Types ────────────────────────────────────

export type JurisdictionType =
  | "federal"
  | "state"
  | "local"
  | "international"
  | "municipal"
  | "regional"
  | "special_economic_zone";

export type RateType =
  | "corporate_income"
  | "personal_income"
  | "sales_tax"
  | "vat"
  | "gst"
  | "withholding"
  | "capital_gains"
  | "stamp_duty"
  | "property_tax"
  | "excise"
  | "carbon"
  | "digital_services"
  | "transfer_pricing";

// ─── Provision Types ───────────────────────────────────────

export type ProvisionType =
  | "current_tax"
  | "deferred_tax"
  | "uncertain_tax_position"
  | "tax_contingency"
  | "valuation_allowance"
  | "tax_credit"
  | "tax_loss_carryforward"
  | "tax_loss_carryback";

export type ProvisionStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "filed"
  | "amended"
  | "closed"
  | "disputed";

// ─── Deferred Tax Types ────────────────────────────────────

export type TemporaryDifferenceType =
  | "accelerated_depreciation"
  | "straight_line_depreciation"
  | "installment_sales"
  | "warranty_reserves"
  | "unrealized_gains_losses"
  | "pension_obligations"
  | "stock_compensation"
  | "foreign_tax_credits"
  | "net_operating_loss"
  | "research_credits"
  | "lease_accounting"
  | "intangible_amortization"
  | "bad_debt_reserves"
  | "inventory_write_downs"
  | "restructuring_reserves";

// ─── Return Types ──────────────────────────────────────────

export type ReturnType =
  | "federal_income"
  | "state_income"
  | "local_income"
  | "vat_return"
  | "gst_return"
  | "withholding_return"
  | "property_tax_return"
  | "excise_return"
  | "sales_tax_return"
  | "franchise_tax"
  | "capital_gains"
  | "information_return"
  | "estimated_tax";

export type ReturnStatus =
  | "not_started"
  | "in_progress"
  | "review"
  | "approved"
  | "filed"
  | "accepted"
  | "rejected"
  | "amended"
  | "extension_filed"
  | "closed";

// ─── Filing Types ──────────────────────────────────────────

export type FilingType =
  | "original"
  | "amended"
  | "superseded"
  | "extension"
  | "refund_claim"
  | "carryback_claim"
  | "refund_amendment"
  | "information_only";

export type FilingStatus =
  | "pending_preparation"
  | "pending_review"
  | "pending_approval"
  | "approved"
  | "submitted"
  | "accepted"
  | "rejected"
  | "resubmitted"
  | "closed";

// ─── Deadline Types ────────────────────────────────────────

export type DeadlineType =
  | "filing"
  | "payment"
  | "estimated_payment"
  | "extension"
  | "response"
  | "audit"
  | "transfer_pricing_documentation"
  | "information_return"
  | "annual_return"
  | "quarterly_return";

export type DeadlineStatus =
  | "upcoming"
  | "due_soon"
  | "overdue"
  | "completed"
  | "extended"
  | "cancelled"
  | "waived";

// ─── Payment Types ─────────────────────────────────────────

export type PaymentType =
  | "estimated_quarterly"
  | "annual_return"
  | "extension_payment"
  | "amended_return"
  | "refund"
  | "penalty"
  | "interest"
  | "audit_assessment"
  | "installment_agreement";

export type PaymentStatus =
  | "pending"
  | "scheduled"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled"
  | "overdue";

// ─── Transfer Pricing Types ────────────────────────────────

export type IntercompanyType =
  | "goods_sale"
  | "services"
  | "royalty"
  | "license_fee"
  | "management_fee"
  | "cost_sharing"
  | "guarantee_fee"
  | "loan"
  | "commission"
  | "rental"
  | "insurance"
  | "cost_contribution";

export type ArmLengthMethod =
  | "comparable_uncontrolled_price"
  | "resale_price_method"
  | "cost_plus_method"
  | "transactional_net_margin_method"
  | "profit_split_method"
  | "other_method";

// ─── Assessment Types ──────────────────────────────────────

export type AssessmentType =
  | "risk_rating"
  | "compliance_audit"
  | "transfer_pricing_audit"
  | "tax_controversy"
  | "voluntary_disclosure"
  | "map_adjustment"
  | "competent_authority"
  | "mutual_agreement_procedure";

export type AssessmentStatus =
  | "identified"
  | "assessed"
  | "in_progress"
  | "mitigated"
  | "resolved"
  | "escalated"
  | "closed";

// ─── Planning Types ────────────────────────────────────────

export type ScenarioType =
  | "tax_optimization"
  | "restructuring"
  | "expansion"
  | "repatriation"
  | "exit_strategy"
  | "r_and_d_credit"
  | "green_incentive"
  | "custom";

export type ScenarioStatus =
  | "draft"
  | "analyzing"
  | "analyzed"
  | "recommended"
  | "approved"
  | "implemented"
  | "rejected"
  | "archived";

// ─── Recommendation Types ──────────────────────────────────

export type RecommendationCategory =
  | "tax_credit_optimization"
  | "deduction_maximization"
  | "entity_restructuring"
  | "transfer_pricing"
  | "tax_loss_utilization"
  | "incentive_program"
  | "compliance_improvement"
  | "risk_mitigation"
  | "international_planning"
  | "research_and_development";

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type RecommendationStatus =
  | "proposed"
  | "under_evaluation"
  | "approved_for_action"
  | "in_implementation"
  | "completed"
  | "rejected"
  | "deferred";

export type Priority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "backlog";

// ─── Briefing Types ────────────────────────────────────────

export type BriefingType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "ad_hoc"
  | "board_summary"
  | "audit_briefing"
  | "planning_review"
  | "risk_assessment";

// ─── Dashboard Interfaces ──────────────────────────────────

export interface TaxDashboardData {
  period: string;
  overallTaxHealth: Prisma.Decimal;
  totalJurisdictions: number;
  activeReturns: number;
  pendingPayments: number;
  openDeadlines: number;
  overdueDeadlines: number;
  effectiveTaxRate: Prisma.Decimal;
  totalTaxLiability: Prisma.Decimal;
  totalTaxPaid: Prisma.Decimal;
  transferPricingScore: Prisma.Decimal;
  topRisks: TaxRiskSummaryRecord[];
  upcomingDeadlines: TaxDeadlineSummaryRecord[];
  recentRecommendations: TaxRecommendationSummaryRecord[];
}

export interface TaxRiskSummaryRecord {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  jurisdictionName: string;
  estimatedExposure: Prisma.Decimal;
  status: string;
}

export interface TaxDeadlineSummaryRecord {
  id: string;
  deadlineType: string;
  title: string;
  dueDate: Date;
  status: string;
  daysUntilDue: number;
}

export interface TaxRecommendationSummaryRecord {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  estimatedSavings: Prisma.Decimal;
  status: string;
}

// ─── Jurisdiction Interfaces ───────────────────────────────

export interface TaxJurisdiction {
  id: string;
  companyId: string;
  jurisdictionType: JurisdictionType;
  name: string;
  code: string;
  country: string;
  state?: string;
  city?: string;
  taxAuthority: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface TaxRate {
  id: string;
  jurisdictionId: string;
  rateType: RateType;
  name: string;
  rate: Prisma.Decimal;
  minRate?: Prisma.Decimal;
  maxRate?: Prisma.Decimal;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

// ─── Return Interfaces ─────────────────────────────────────

export interface TaxReturn {
  id: string;
  companyId: string;
  jurisdictionId: string;
  returnType: ReturnType;
  name: string;
  taxPeriod: string;
  fiscalYear: number;
  status: ReturnStatus;
  filingDate?: Date;
  dueDate: Date;
  extensionDate?: Date;
  totalIncome: Prisma.Decimal;
  totalDeductions: Prisma.Decimal;
  taxableIncome: Prisma.Decimal;
  taxLiability: Prisma.Decimal;
  credits: Prisma.Decimal;
  netTax: Prisma.Decimal;
  metadata?: Record<string, unknown>;
}

// ─── Filing Interfaces ─────────────────────────────────────

export interface TaxFiling {
  id: string;
  companyId: string;
  returnId?: string;
  filingType: FilingType;
  name: string;
  jurisdictionId: string;
  taxType: string;
  period: string;
  status: FilingStatus;
  filedDate?: Date;
  dueDate: Date;
  confirmationNumber?: string;
  metadata?: Record<string, unknown>;
}

// ─── Payment Interfaces ────────────────────────────────────

export interface TaxPayment {
  id: string;
  companyId: string;
  jurisdictionId: string;
  paymentType: PaymentType;
  name: string;
  amount: Prisma.Decimal;
  taxPeriod: string;
  dueDate: Date;
  status: PaymentStatus;
  paidDate?: Date;
  confirmationNumber?: string;
  metadata?: Record<string, unknown>;
}

// ─── Deadline Interfaces ───────────────────────────────────

export interface TaxDeadline {
  id: string;
  companyId: string;
  jurisdictionId: string;
  deadlineType: DeadlineType;
  name: string;
  description: string;
  dueDate: Date;
  status: DeadlineStatus;
  extendedUntil?: Date;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

// ─── Provision Interfaces ──────────────────────────────────

export interface TaxProvision {
  id: string;
  companyId: string;
  provisionType: ProvisionType;
  name: string;
  taxPeriod: string;
  fiscalYear: number;
  status: ProvisionStatus;
  currentTaxLiability: Prisma.Decimal;
  deferredTaxLiability: Prisma.Decimal;
  deferredTaxAsset: Prisma.Decimal;
  netDeferredTax: Prisma.Decimal;
  uncertainTaxPositions: Prisma.Decimal;
  totalProvision: Prisma.Decimal;
  effectiveRate: Prisma.Decimal;
  metadata?: Record<string, unknown>;
}

export interface DeferredTaxItem {
  id: string;
  provisionId: string;
  differenceType: TemporaryDifferenceType;
  description: string;
  carryingAmount: Prisma.Decimal;
  taxBase: Prisma.Decimal;
  temporaryDifference: Prisma.Decimal;
  enactedRate: Prisma.Decimal;
  deferredTaxAsset?: Prisma.Decimal;
  deferredTaxLiability?: Prisma.Decimal;
  reversalPeriod?: string;
  metadata?: Record<string, unknown>;
}

export interface ProvisionReconciliation {
  provisionId: string;
  openingBalance: Prisma.Decimal;
  currentPeriodCharge: Prisma.Decimal;
  priorPeriodAdjustments: Prisma.Decimal;
  taxCredits: Prisma.Decimal;
  foreignRateDifferential: Prisma.Decimal;
  stateTaxEffect: Prisma.Decimal;
  permanentDifferences: Prisma.Decimal;
  uncertainPositions: Prisma.Decimal;
  closingBalance: Prisma.Decimal;
  effectiveRateReconciliation: EffectiveRateComponent[];
}

export interface EffectiveRateComponent {
  component: string;
  amount: Prisma.Decimal;
  rateImpact: Prisma.Decimal;
}

// ─── Transfer Pricing Interfaces ───────────────────────────

export interface TransferPricingPolicy {
  id: string;
  companyId: string;
  name: string;
  description: string;
  intercompanyType: IntercompanyType;
  armLengthMethod: ArmLengthMethod;
  documentationStatus: string;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  isActive: boolean;
  riskScore: Prisma.Decimal;
  metadata?: Record<string, unknown>;
}

export interface IntercompanyRule {
  id: string;
  policyId: string;
  name: string;
  description: string;
  fromEntity: string;
  toEntity: string;
  transactionType: IntercompanyType;
  pricingMethod: ArmLengthMethod;
  benchmarkRange?: { low: Prisma.Decimal; median: Prisma.Decimal; high: Prisma.Decimal };
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface ArmLengthAnalysis {
  policyId: string;
  policyName: string;
  method: ArmLengthMethod;
  intercompanyTransactions: number;
  totalValue: Prisma.Decimal;
  benchmarkRange: { low: Prisma.Decimal; median: Prisma.Decimal; high: Prisma.Decimal };
  actualResults: { median: Prisma.Decimal; margin: Prisma.Decimal };
  complianceStatus: string;
  adjustmentRequired: boolean;
  adjustmentAmount?: Prisma.Decimal;
  riskScore: Prisma.Decimal;
}

export interface TransferPricingRisk {
  overallRiskScore: Prisma.Decimal;
  totalPolicies: number;
  highRiskPolicies: number;
  documentationGap: number;
  overdueReviews: number;
  pendingAdjustments: number;
  jurisdictionRisks: JurisdictionTPRisk[];
}

export interface JurisdictionTPRisk {
  jurisdiction: string;
  riskScore: Prisma.Decimal;
  policyCount: number;
  lastAudit?: Date;
}

// ─── Tax Risk Interfaces ───────────────────────────────────

export interface TaxRiskAssessment {
  id: string;
  companyId: string;
  assessmentType: AssessmentType;
  name: string;
  description: string;
  jurisdictionId?: string;
  riskLevel: RiskLevel;
  estimatedExposure: Prisma.Decimal;
  probability: Prisma.Decimal;
  expectedLoss: Prisma.Decimal;
  status: AssessmentStatus;
  mitigationPlan?: string;
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface TaxRiskByJurisdiction {
  jurisdiction: string;
  riskCount: number;
  totalExposure: Prisma.Decimal;
  highRiskCount: number;
  topRisk: TaxRiskAssessment;
}

export interface TaxHealthScore {
  overallScore: Prisma.Decimal;
  complianceScore: Prisma.Decimal;
  riskScore: Prisma.Decimal;
  planningScore: Prisma.Decimal;
  transferPricingScore: Prisma.Decimal;
  filingScore: Prisma.Decimal;
  paymentScore: Prisma.Decimal;
  components: TaxHealthComponent[];
}

export interface TaxHealthComponent {
  name: string;
  score: Prisma.Decimal;
  weight: Prisma.Decimal;
  status: "pass" | "warn" | "fail";
  details: string;
}

export interface TaxExposure {
  totalExposure: Prisma.Decimal;
  byJurisdiction: ExposureByJurisdiction[];
  byCategory: ExposureByCategory[];
  trend: ExposureTrend[];
}

export interface ExposureByJurisdiction {
  jurisdiction: string;
  exposure: Prisma.Decimal;
  percentage: Prisma.Decimal;
}

export interface ExposureByCategory {
  category: string;
  exposure: Prisma.Decimal;
  percentage: Prisma.Decimal;
}

export interface ExposureTrend {
  period: string;
  exposure: Prisma.Decimal;
  change: Prisma.Decimal;
}

// ─── Tax Planning Interfaces ───────────────────────────────

export interface PlanningScenario {
  id: string;
  companyId: string;
  scenarioType: ScenarioType;
  name: string;
  description: string;
  status: ScenarioStatus;
  taxSavings: Prisma.Decimal;
  implementationCost: Prisma.Decimal;
  netBenefit: Prisma.Decimal;
  riskLevel: RiskLevel;
  timeline: string;
  assumptions: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface TaxRecommendation {
  id: string;
  companyId: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  rationale: string;
  riskLevel: RiskLevel;
  priority: Priority;
  estimatedSavings: Prisma.Decimal;
  status: RecommendationStatus;
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface TaxOptimizationOpportunity {
  category: RecommendationCategory;
  name: string;
  description: string;
  estimatedAnnualSavings: Prisma.Decimal;
  implementationComplexity: "low" | "medium" | "high";
  timelineMonths: number;
  prerequisites: string[];
}

// ─── Input Types ───────────────────────────────────────────

export interface GetJurisdictionsInput {
  jurisdictionType?: JurisdictionType;
  country?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateJurisdictionInput {
  jurisdictionType: JurisdictionType;
  name: string;
  code: string;
  country: string;
  state?: string;
  city?: string;
  taxAuthority: string;
  metadata?: Record<string, unknown>;
}

export interface GetRatesInput {
  jurisdictionId?: string;
  rateType?: RateType;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRateInput {
  jurisdictionId: string;
  rateType: RateType;
  name: string;
  rate: number;
  minRate?: number;
  maxRate?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetTaxReturnsInput {
  returnType?: ReturnType;
  status?: ReturnStatus;
  jurisdictionId?: string;
  fiscalYear?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateReturnInput {
  jurisdictionId: string;
  returnType: ReturnType;
  name: string;
  taxPeriod: string;
  fiscalYear: number;
  dueDate: Date;
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxLiability: number;
  credits?: number;
  metadata?: Record<string, unknown>;
}

export interface GetPaymentsInput {
  paymentType?: PaymentType;
  status?: PaymentStatus;
  jurisdictionId?: string;
  taxPeriod?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePaymentInput {
  jurisdictionId: string;
  paymentType: PaymentType;
  name: string;
  amount: number;
  taxPeriod: string;
  dueDate: Date;
  metadata?: Record<string, unknown>;
}

export interface GetFilingsInput {
  filingType?: FilingType;
  status?: FilingStatus;
  jurisdictionId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateFilingInput {
  returnId?: string;
  filingType: FilingType;
  name: string;
  jurisdictionId: string;
  taxType: string;
  period: string;
  dueDate: Date;
  metadata?: Record<string, unknown>;
}

export interface GetDeadlinesInput {
  deadlineType?: DeadlineType;
  status?: DeadlineStatus;
  jurisdictionId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateDeadlineInput {
  jurisdictionId: string;
  deadlineType: DeadlineType;
  name: string;
  description: string;
  dueDate: Date;
  extendedUntil?: Date;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

export interface GetProvisionsInput {
  provisionType?: ProvisionType;
  status?: ProvisionStatus;
  fiscalYear?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateProvisionInput {
  provisionType: ProvisionType;
  name: string;
  taxPeriod: string;
  fiscalYear: number;
  currentTaxLiability: number;
  deferredTaxLiability?: number;
  deferredTaxAsset?: number;
  uncertainTaxPositions?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateDeferredTaxInput {
  provisionId: string;
  differenceType: TemporaryDifferenceType;
  description: string;
  carryingAmount: number;
  taxBase: number;
  enactedRate: number;
  reversalPeriod?: string;
  metadata?: Record<string, unknown>;
}

export interface GetTransferPricingInput {
  intercompanyType?: IntercompanyType;
  armLengthMethod?: ArmLengthMethod;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTransferPricingInput {
  name: string;
  description: string;
  intercompanyType: IntercompanyType;
  armLengthMethod: ArmLengthMethod;
  metadata?: Record<string, unknown>;
}

export interface UpdateTransferPricingInput {
  name?: string;
  description?: string;
  armLengthMethod?: ArmLengthMethod;
  documentationStatus?: string;
  nextReviewDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateIntercompanyRuleInput {
  policyId: string;
  name: string;
  description: string;
  fromEntity: string;
  toEntity: string;
  transactionType: IntercompanyType;
  pricingMethod: ArmLengthMethod;
  metadata?: Record<string, unknown>;
}

export interface GetRiskAssessmentsInput {
  assessmentType?: AssessmentType;
  riskLevel?: RiskLevel;
  status?: AssessmentStatus;
  jurisdictionId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRiskAssessmentInput {
  assessmentType: AssessmentType;
  name: string;
  description: string;
  jurisdictionId?: string;
  riskLevel: RiskLevel;
  estimatedExposure: number;
  probability: number;
  mitigationPlan?: string;
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetPlanningScenariosInput {
  scenarioType?: ScenarioType;
  status?: ScenarioStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePlanningScenarioInput {
  scenarioType: ScenarioType;
  name: string;
  description: string;
  taxSavings: number;
  implementationCost: number;
  riskLevel: RiskLevel;
  timeline: string;
  assumptions: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface GetRecommendationsInput {
  category?: RecommendationCategory;
  riskLevel?: RiskLevel;
  priority?: Priority;
  status?: RecommendationStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRecommendationInput {
  category: RecommendationCategory;
  title: string;
  description: string;
  rationale: string;
  riskLevel: RiskLevel;
  priority: Priority;
  estimatedSavings: number;
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetBriefingsInput {
  briefingType?: BriefingType;
  limit?: number;
  offset?: number;
}

// ─── Executive Tax Summary ─────────────────────────────────

export interface ExecutiveTaxSummary {
  totalTaxLiability: Prisma.Decimal;
  totalTaxPaid: Prisma.Decimal;
  effectiveTaxRate: Prisma.Decimal;
  complianceScore: Prisma.Decimal;
  riskExposure: Prisma.Decimal;
  pendingPayments: number;
  openDeadlines: number;
  activeReturns: number;
  transferPricingScore: Prisma.Decimal;
  yearOverYearChange: Prisma.Decimal;
  jurisdictionCount: number;
  taxSavingsYTD: Prisma.Decimal;
}

// ─── Briefing Interface ────────────────────────────────────

export interface TaxBriefing {
  briefingType: BriefingType;
  generatedAt: Date;
  period: string;
  summary: string;
  keyMetrics: BriefingMetric[];
  criticalItems: BriefingItem[];
  upcomingDeadlines: TaxDeadlineSummaryRecord[];
  recommendations: TaxRecommendationSummaryRecord[];
}

export interface BriefingMetric {
  label: string;
  value: Prisma.Decimal;
}

export interface BriefingItem {
  id: string;
  type: "deadline" | "return" | "payment" | "assessment" | "filing" | "risk";
  title: string;
  description: string;
  severity: RiskLevel;
  actionRequired: boolean;
}

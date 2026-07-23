export type RiskCategory =
  | "market"
  | "credit"
  | "liquidity"
  | "fx"
  | "interest-rate"
  | "operational"
  | "counterparty"
  | "country"
  | "concentration"
  | "settlement"
  | "funding"
  | "investment"
  | "treasury"
  | "bank";

export type RiskStatus =
  | "identified"
  | "assessed"
  | "mitigated"
  | "monitored"
  | "closed"
  | "historical"
  | "emerging";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type Likelihood =
  | "rare"
  | "unlikely"
  | "possible"
  | "likely"
  | "almost-certain";

export type Impact =
  | "negligible"
  | "minor"
  | "moderate"
  | "major"
  | "severe";

export type Velocity = "slow" | "moderate" | "fast" | "immediate";

export type ControlEffectiveness =
  | "strong"
  | "satisfactory"
  | "weak"
  | "ineffective"
  | "not-tested";

export type HeatLevel = "extreme" | "high" | "elevated" | "moderate" | "low";

export type Priority = "critical" | "high" | "medium" | "low";

export type ReviewCycle =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi-annually"
  | "annually";

export type RegisterType =
  | "enterprise"
  | "business-unit"
  | "regional"
  | "entity"
  | "bank"
  | "investment"
  | "treasury"
  | "operational"
  | "closed"
  | "historical"
  | "emerging";

export type ScenarioType =
  | "base"
  | "optimistic"
  | "pessimistic"
  | "financial-crisis"
  | "liquidity-crisis"
  | "currency-crash"
  | "interest-shock"
  | "bank-failure"
  | "counterparty-default"
  | "black-swan"
  | "custom";

export type ScenarioCategory =
  | "revenue-drop"
  | "inflation"
  | "fx-shock"
  | "interest-increase"
  | "acquisition"
  | "rapid-growth"
  | "recession"
  | "supply-chain-failure";

export type LimitType =
  | "exposure"
  | "credit"
  | "bank"
  | "issuer"
  | "country"
  | "liquidity"
  | "fx"
  | "investment";

export type LimitStatus =
  | "within-limit"
  | "approaching-limit"
  | "at-limit"
  | "exceeded"
  | "breached"
  | "escalated";

export type ComplianceStatus =
  | "compliant"
  | "non-compliant"
  | "pending-review"
  | "under-remediation";

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export type AlertStatus = "active" | "acknowledged" | "resolved" | "dismissed";

export type OperationalRiskSubType =
  | "human-error"
  | "fraud"
  | "system-failure"
  | "process-failure"
  | "compliance-failure"
  | "near-miss"
  | "external-event";

export interface RiskScore {
  likelihood: Likelihood;
  impact: Impact;
  velocity: Velocity;
  detectability: "high" | "medium" | "low";
  controlEffectiveness: ControlEffectiveness;
  inherentRisk: number;
  residualRisk: number;
  weightedScore: number;
  riskAppetitePercent: number;
  heatLevel: HeatLevel;
}

export interface EnterpriseRisk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  subCategory?: string;
  status: RiskStatus;
  registerType: RegisterType;
  score: RiskScore;
  priority: Priority;
  owner: string;
  ownerEmail?: string;
  businessUnit?: string;
  entityId?: string;
  region?: string;
  counterpartyId?: string;
  bankId?: string;
  tags: string[];
  source?: string;
  lastReviewed: Date;
  reviewCycle: ReviewCycle;
  nextReviewDate: Date;
  mitigationPlan?: string;
  contingencyPlan?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketRiskData {
  riskId: string;
  portfolioExposure: number;
  dailyPnL: number;
  var95: number;
  var99: number;
  expectedShortfall: number;
  volatility: number;
  sensitivity: number;
  correlation: number;
  duration: number;
  convexity: number;
  beta?: number;
  sharpeRatio?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditRiskData {
  riskId: string;
  creditLimit: number;
  creditUtilization: number;
  exposure: number;
  probabilityOfDefault: number;
  lossGivenDefault: number;
  exposureAtDefault: number;
  expectedCreditLoss: number;
  internalRating: string;
  externalRating?: string;
  daysPastDue?: number;
  collateralValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiquidityRiskData {
  riskId: string;
  liquidityCoverageRatio: number;
  fundingGap: number;
  liquidityBuffer: number;
  emergencyLiquidity: number;
  cashReserve: number;
  refinancingRisk: number;
  netStableFunding?: number;
  loanToDepositRatio?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FXRiskData {
  riskId: string;
  grossExposure: number;
  netExposure: number;
  openPosition: number;
  closedPosition: number;
  naturalHedge: number;
  syntheticHedge: number;
  fxGainLoss: number;
  sensitivity: number;
  valueAtRisk?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterestRateRiskData {
  riskId: string;
  yieldCurveExposure: number;
  duration: number;
  modifiedDuration: number;
  repricingGap: number;
  interestSensitivity: number;
  rateShock100bp: number;
  rateShock200bp: number;
  convexity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationalRiskData {
  riskId: string;
  subType: OperationalRiskSubType;
  operationalLoss: number;
  rootCause?: string;
  mitigationPlan?: string;
  fraudType?: string;
  systemName?: string;
  processName?: string;
  isNearMiss: boolean;
  occurrenceDate: Date;
  resolutionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CounterpartyRiskData {
  riskId: string;
  counterpartyId: string;
  creditLimit: number;
  creditUtilization: number;
  currentExposure: number;
  potentialFutureExposure: number;
  defaultProbability: number;
  collateralHeld: number;
  nettingBenefit: number;
  settlementRisk: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryRiskData {
  riskId: string;
  countryCode: string;
  countryName: string;
  sovereignRating: string;
  exposureAmount: number;
  transferRestriction: number;
  politicalRisk: "high" | "medium" | "low";
  economicRisk: "high" | "medium" | "low";
  legalRisk: "high" | "medium" | "low";
  createdAt: Date;
  updatedAt: Date;
}

export interface ConcentrationRiskData {
  riskId: string;
  sector: string;
  exposureAmount: number;
  exposurePercent: number;
  limitPercent: number;
  topExposures: number;
  herfindahlIndex: number;
  counterpartyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyViolation {
  id: string;
  riskId?: string;
  title: string;
  description: string;
  policyRef?: string;
  severity: RiskLevel;
  status: ComplianceStatus;
  detectedAt: Date;
  remediatedAt?: Date;
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  id: string;
  riskId: string;
  title: string;
  description: string;
  priority: Priority;
  status: "open" | "in-progress" | "implemented" | "rejected" | "deprecated";
  owner: string;
  estimatedEffort?: string;
  expectedImpact?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  riskId?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: RiskCategory;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Counterparty {
  id: string;
  name: string;
  type: "bank" | "corporate" | "government" | "fund" | "other";
  rating: string;
  creditLimit: number;
  utilizedAmount: number;
  countryCode: string;
  sector: string;
  status: "active" | "restricted" | "suspended" | "defaulted";
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessUnit {
  id: string;
  name: string;
  region: string;
  head: string;
  riskAppetite: number;
  totalExposure: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface Entity {
  id: string;
  name: string;
  type: "corporation" | "subsidiary" | "joint-venture" | "fund";
  region: string;
  industry: string;
  totalAssets: number;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Control {
  id: string;
  riskId: string;
  name: string;
  description: string;
  type: "preventive" | "detective" | "corrective" | "directive";
  effectiveness: ControlEffectiveness;
  owner: string;
  lastTested: Date;
  nextTestDate: Date;
  frequency: ReviewCycle;
  status: "active" | "inactive" | "expired" | "pending-review";
  createdAt: Date;
  updatedAt: Date;
}

export interface StressTest {
  id: string;
  name: string;
  description: string;
  scenarioType: ScenarioType;
  parameters: Record<string, number>;
  results?: Record<string, number>;
  status: "draft" | "running" | "completed" | "failed";
  performedBy: string;
  performedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  type: ScenarioType;
  assumptions: string[];
  financialImpact: number;
  probability: number;
  timeHorizon: string;
  riskCategories: RiskCategory[];
  status: "draft" | "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoricalLossEvent {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  lossAmount: number;
  currency: string;
  eventDate: Date;
  recoveryAmount?: number;
  rootCause: string;
  lessonsLearned?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Limit {
  id: string;
  name: string;
  description: string;
  type: LimitType;
  limitValue: number;
  currentUtilization: number;
  threshold: number;
  softLimit: number;
  hardLimit: number;
  status: LimitStatus;
  owner: string;
  counterpartyId?: string;
  countryCode?: string;
  businessUnit?: string;
  lastEscalatedAt?: Date;
  escalationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Escalation {
  id: string;
  limitId?: string;
  riskId?: string;
  reason: string;
  level: 1 | 2 | 3;
  escalatedTo: string;
  escalatedBy: string;
  status: "open" | "acknowledged" | "resolved" | "rejected";
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskKPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  category: RiskCategory;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
  date: Date;
}

export interface RiskForecast {
  id: string;
  riskId?: string;
  category: RiskCategory;
  metric: string;
  period: string;
  currentValue: number;
  forecastValue: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
  date: Date;
}

export interface RiskInsight {
  id: string;
  type: "early-warning" | "trend" | "anomaly" | "recommendation" | "summary";
  title: string;
  description: string;
  severity: AlertSeverity;
  category: RiskCategory;
  relatedRiskId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type RiskResponseStrategy = "avoid" | "reduce" | "transfer" | "accept" | "escalate";
export type ControlType = "preventive" | "detective" | "corrective" | "directive";
export type RiskTrend = "improving" | "stable" | "deteriorating";
export type KRIStatus = "normal" | "warning" | "breach";
export type ResponseStatus = "planned" | "in-progress" | "completed" | "overdue";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";
export type ReportType = "dashboard" | "summary" | "detailed" | "regulatory";

export interface RiskRegister {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  riskLevel: RiskLevel;
  status: RiskStatus;
  owner: string;
  department: string;
  businessUnit?: string;
  dateIdentified: Date;
  lastReviewed: Date;
  targetDate?: Date;
  closureDate?: Date;
  trend: RiskTrend;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  id: string;
  registerId: string;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentScore: number;
  residualLikelihood: number;
  residualImpact: number;
  residualScore: number;
  assessmentDate: Date;
  assessedBy: string;
  methodology: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskResponse {
  id: string;
  registerId: string;
  strategy: RiskResponseStrategy;
  description: string;
  responsibleParty: string;
  timeline: Date;
  cost?: number;
  status: ResponseStatus;
  effectiveness?: ControlEffectiveness;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskControl {
  id: string;
  registerId: string;
  name: string;
  description: string;
  type: ControlType;
  owner: string;
  frequency: string;
  effectiveness: ControlEffectiveness;
  lastTested?: Date;
  nextTestDate?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskEvent {
  id: string;
  registerId?: string;
  title: string;
  description: string;
  date: Date;
  impact: string;
  response: string;
  lessons: string;
  status: IncidentStatus;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskIndicator {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  value: number;
  threshold: number;
  warningThreshold: number;
  status: KRIStatus;
  frequency: string;
  owner: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskReport {
  id: string;
  title: string;
  type: ReportType;
  period: string;
  generatedAt: Date;
  section: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskScenario {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  likelihood: number;
  impact: number;
  stressFactors: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskHeatmap {
  id: string;
  period: string;
  data: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskKPIItem {
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  category: string;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export interface RiskAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  type: string;
  title: string;
  message: string;
  actionRequired: boolean;
  dismissed: boolean;
  companyId: string;
  createdAt: Date;
}

export interface RiskRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  companyId: string;
  implemented: boolean;
  createdAt: Date;
}

export interface RiskAggregateMetrics {
  totalRisks: number;
  openRisks: number;
  criticalRisks: number;
  highRisks: number;
  totalControls: number;
  ineffectiveControls: number;
  totalIncidents: number;
  openIncidents: number;
  totalAssessments: number;
  totalScenarios: number;
  kriBreaches: number;
}

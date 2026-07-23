export type EntityType =
  | "holding" | "parent" | "subsidiary" | "jointVenture" | "associate"
  | "branch" | "businessUnit" | "profitCenter" | "costCenter";

export type ConsolidationMethod = "full" | "proportional" | "equity";

export type OwnershipType = "direct" | "indirect" | "cross";

export type CurrencyTranslationMethod = "average" | "closing" | "historical";

export type IntercompanyType =
  | "sales" | "purchases" | "loans" | "interest" | "dividends"
  | "receivables" | "payables" | "inventoryProfit" | "fixedAssetProfit";

export type IntercompanyStatus = "identified" | "matched" | "eliminated" | "unmatched" | "disputed";

export type ConsolidationRunStatus = "draft" | "dataCollection" | "translation" | "elimination" | "minorityInterest" | "adjustments" | "review" | "approved" | "locked";

export type ConsolidationRunType = "monthly" | "quarterly" | "yearly" | "adHoc";

export type FinancialStatementType =
  | "balanceSheet" | "incomeStatement" | "cashFlow" | "equityChanges"
  | "trialBalance" | "managementPack" | "boardPack";

export type AdjustmentType =
  | "fairValue" | "goodwill" | "purchasePriceAllocation" | "restructuring"
  | "reorganization" | "accountingPolicy" | "errorCorrection" | "other";

export type AdjustmentStatus = "draft" | "review" | "approved" | "posted" | "rejected";

export type AlertSeverity = "info" | "warning" | "critical" | "emergency";

export type AlertCategory =
  | "consolidation" | "translation" | "elimination" | "ownership"
  | "entity" | "compliance" | "reporting" | "deadline";

export type RecommendationType =
  | "elimination" | "translation" | "ownership" | "consolidation"
  | "reporting" | "governance" | "process" | "compliance";

export interface LegalEntity {
  id: string;
  entityCode: string;
  legalName: string;
  tradingName?: string;
  entityType: EntityType;
  countryOfIncorporation: string;
  taxId: string;
  registrationNumber: string;
  functionalCurrency: string;
  presentationCurrency?: string;
  consolidationMethod: ConsolidationMethod;
  isConsolidated: boolean;
  consolidationScope: "full" | "proportional" | "equity" | "none";
  fiscalYearEnd: string;
  fiscalPeriod: number;
  address: string;
  city: string;
  country: string;
  status: "active" | "dormant" | "dissolved" | "acquired" | "divested";
  parentEntityId?: string;
  subsidiaries: string[];
  createdById: string;
  approvedById?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnershipRecord {
  id: string;
  parentEntityId: string;
  subsidiaryEntityId: string;
  ownershipType: OwnershipType;
  ownershipPercentage: number;
  votingPercentage: number;
  effectiveDate: Date;
  endDate?: Date;
  consolidationMethod: ConsolidationMethod;
  goodwillAmount?: number;
  fairValueAdjustments?: number;
  acquisitionDate: Date;
  considerationTransferred?: number;
  contingentConsideration?: number;
  isDirect: boolean;
  ultimateParentId?: string;
  consolidationScope: "full" | "proportional" | "equity" | "none";
  approvedById?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupNode {
  entityId: string;
  entityCode: string;
  legalName: string;
  entityType: EntityType;
  parentId?: string;
  children: GroupNode[];
  ownershipPercentage: number;
  consolidationMethod: ConsolidationMethod;
  depth: number;
  path: string;
}

export interface ConsolidationRun {
  id: string;
  periodId: string;
  runType: ConsolidationRunType;
  fiscalYear: number;
  fiscalPeriod: number;
  label: string;
  status: ConsolidationRunStatus;
  startDate: Date;
  completedDate?: Date;
  currency: string;
  entitiesIncluded: string[];
  entitiesCompleted: string[];
  totalSteps: number;
  completedSteps: number;
  hasTranslationRun: boolean;
  hasEliminationsRun: boolean;
  hasMinorityInterest: boolean;
  hasAdjustments: boolean;
  hasFinancialStatements: boolean;
  reviewNotes?: string;
  approvedById?: string;
  approvedAt?: Date;
  lockedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyTranslationRun {
  id: string;
  consolidationRunId: string;
  periodId: string;
  sourceCurrency: string;
  targetCurrency: string;
  translationMethod: CurrencyTranslationMethod;
  averageRate: number;
  closingRate: number;
  historicalRates: HistoricalRate[];
  status: "draft" | "inProgress" | "completed" | "review" | "approved";
  ctaAmount: number;
  translatedBy: string;
  reviewedById?: string;
  approvedById?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoricalRate {
  id: string;
  translationRunId: string;
  accountCategory: string;
  rate: number;
  rateType: "average" | "closing" | "historical";
  effectiveDate: Date;
}

export interface IntercompanyRecord {
  id: string;
  consolidationRunId: string;
  periodId: string;
  intercompanyType: IntercompanyType;
  status: IntercompanyStatus;
  fromEntityId: string;
  toEntityId: string;
  fromAmount: number;
  toAmount: number;
  difference: number;
  currency: string;
  eliminationAmount: number;
  eliminationDate?: Date;
  eliminationJournalId?: string;
  matchedWithId?: string;
  notes?: string;
  createdBy: string;
  approvedById?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MinorityInterestRecord {
  id: string;
  consolidationRunId: string;
  periodId: string;
  entityId: string;
  entityName: string;
  minorityPercentage: number;
  totalEquity: number;
  minorityEquity: number;
  totalNetIncome: number;
  minorityNetIncome: number;
  beginningBalance: number;
  endingBalance: number;
  dividendsPaid?: number;
  otherMovements?: number;
  currency: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquityAccountRecord {
  id: string;
  consolidationRunId: string;
  periodId: string;
  entityId: string;
  investmentCost: number;
  equityShare: number;
  goodwill: number;
  fairValueAdjustment: number;
  postAcquisitionReserves: number;
  carryingAmount: number;
  currency: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsolidationAdjustment {
  id: string;
  consolidationRunId: string;
  periodId: string;
  adjustmentType: AdjustmentType;
  status: AdjustmentStatus;
  description: string;
  amount: number;
  debitAccount: string;
  creditAccount: string;
  entityId?: string;
  currency: string;
  fxRate: number;
  glJournalId?: string;
  createdBy: string;
  reviewedById?: string;
  approvedById?: string;
  rejectedById?: string;
  rejectionReason?: string;
  postedDate?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialStatementEntry {
  id: string;
  consolidationRunId: string;
  periodId: string;
  statementType: FinancialStatementType;
  lineItem: string;
  entityId?: string;
  amount: number;
  currency: string;
  comparisonAmount?: number;
  variance?: number;
  variancePercent?: number;
  sortOrder: number;
  section: string;
  isTotal: boolean;
  isCalculated: boolean;
  companyId: string;
  createdAt: Date;
}

export interface FinancialStatementSet {
  id: string;
  consolidationRunId: string;
  periodId: string;
  statementType: FinancialStatementType;
  label: string;
  currency: string;
  entries: FinancialStatementEntry[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashFromOperations: number;
  cashFromInvesting: number;
  cashFromFinancing: number;
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
  isBalanced: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardReportSection {
  title: string;
  content: string;
  metrics: { label: string; value: string; trend?: "up" | "down" | "stable" }[];
  charts?: { type: string; labels: string[]; datasets: { label: string; data: number[] }[] }[];
}

export interface BoardReport {
  id: string;
  consolidationRunId: string;
  periodId: string;
  title: string;
  preparedDate: Date;
  currency: string;
  sections: BoardReportSection[];
  executiveSummary: string;
  keyHighlights: string[];
  keyRisks: string[];
  recommendations: string[];
  approvedById?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagementReportEntry {
  id: string;
  consolidationRunId: string;
  periodId: string;
  entityId: string;
  entityName: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  revenueVariance: number;
  expenseVariance: number;
  netIncomeVariance: number;
  currency: string;
  fxRate: number;
  companyId: string;
  createdAt: Date;
}

export interface ConsolidationAlert {
  id: string;
  type: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  consolidationRunId?: string;
  entityId?: string;
  isRead: boolean;
  isResolved: boolean;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  companyId: string;
  createdAt: Date;
}

export interface ConsolidationRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "implemented" | "dismissed";
  impact: string;
  effort: "low" | "medium" | "high";
  consolidationRunId?: string;
  entityId?: string;
  companyId: string;
  createdAt: Date;
}

export interface ConsolidationKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "improving" | "worsening" | "stable";
  category: "speed" | "quality" | "compliance" | "efficiency" | "coverage";
  status: "onTrack" | "atRisk" | "critical" | "exceeding";
  companyId: string;
}

export interface AggregateConsolidationMetrics {
  totalEntities: number;
  consolidatedEntities: number;
  equityMethodEntities: number;
  dormantEntities: number;
  totalOwnershipRecords: number;
  activeRuns: number;
  completedRuns: number;
  totalIntercompanyTransactions: number;
  eliminatedTransactions: number;
  unmatchedTransactions: number;
  pendingAdjustments: number;
  approvedAdjustments: number;
  pendingTranslations: number;
  completedTranslations: number;
  totalCTA: number;
  totalMinorityInterest: number;
  totalGoodwill: number;
  boardReportsGenerated: number;
  averageConsolidationDays: number;
  consolidationReadinessScore: number;
}

export interface ExecutiveConsolidationSummary {
  groupName: string;
  reportingCurrency: string;
  totalEntities: number;
  consolidatedEntities: number;
  activeRunLabel: string;
  activeRunStatus: string;
  consolidationProgress: number;
  unmatchedICTransactions: number;
  pendingAdjustments: number;
  pendingApprovals: number;
  openAlerts: number;
  criticalAlerts: number;
  totalRevenue: number;
  totalNetIncome: number;
  totalAssets: number;
  totalEquity: number;
  totalMinorityInterest: number;
  totalCTA: number;
  lastCloseDuration: number;
  readinesScore: number;
}

export interface FXExposureReport {
  entityId: string;
  entityName: string;
  functionalCurrency: string;
  presentationCurrency: string;
  netAssets: number;
  exposureAmount: number;
  averageRate: number;
  closingRate: number;
  ctaImpact: number;
  hedgedAmount: number;
  unhedgedExposure: number;
}

export interface IntercompanyExposureReport {
  entityId: string;
  entityName: string;
  totalICReceivables: number;
  totalICPayables: number;
  netICPosition: number;
  unmatchedReceivables: number;
  unmatchedPayables: number;
  currencyExposure: number;
}

export interface EntityPerformanceReport {
  entityId: string;
  entityName: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  roe: number;
  profitMargin: number;
  revenueShare: number;
  revenueGrowth: number;
}

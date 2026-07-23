export enum CashClassification {
  OPERATING = "OPERATING",
  TREASURY = "TREASURY",
  PAYROLL = "PAYROLL",
  TAX = "TAX",
  INVESTMENT = "INVESTMENT",
  RESERVE = "RESERVE",
  RESTRICTED = "RESTRICTED",
  ESCROW = "ESCROW",
  COLLATERAL = "COLLATERAL",
  PETTY_CASH = "PETTY_CASH",
}

export enum LiquidityCategory {
  IMMEDIATE = "IMMEDIATE",
  SAME_DAY = "SAME_DAY",
  T_PLUS_1 = "T_PLUS_1",
  SHORT_TERM = "SHORT_TERM",
  MEDIUM_TERM = "MEDIUM_TERM",
  LONG_TERM = "LONG_TERM",
}

export enum PoolType {
  PHYSICAL = "PHYSICAL",
  NOTIONAL = "NOTIONAL",
  REGIONAL = "REGIONAL",
  CURRENCY = "CURRENCY",
  VIRTUAL = "VIRTUAL",
}

export enum FundingType {
  INTERCOMPANY_LOAN = "INTERCOMPANY_LOAN",
  TREASURY_TRANSFER = "TREASURY_TRANSFER",
  WORKING_CAPITAL = "WORKING_CAPITAL",
  EMERGENCY_FUNDING = "EMERGENCY_FUNDING",
  INVESTMENT_ALLOCATION = "INVESTMENT_ALLOCATION",
}

export enum FundingStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  EXECUTING = "EXECUTING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum TreasuryAlertSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
  EMERGENCY = "EMERGENCY",
}

export enum TreasuryAlertCategory {
  MINIMUM_CASH_BREACH = "MINIMUM_CASH_BREACH",
  TARGET_CASH_BREACH = "TARGET_CASH_BREACH",
  LIQUIDITY_BUFFER_BREACH = "LIQUIDITY_BUFFER_BREACH",
  FUNDING_REQUIRED = "FUNDING_REQUIRED",
  FUNDING_FAILED = "FUNDING_FAILED",
  FX_EXPOSURE_LIMIT = "FX_EXPOSURE_LIMIT",
  COUNTERPARTY_LIMIT = "COUNTERPARTY_LIMIT",
  INVESTMENT_MATURITY = "INVESTMENT_MATURITY",
  RESTRICTED_CASH_VIOLATION = "RESTRICTED_CASH_VIOLATION",
  POLICY_VIOLATION = "POLICY_VIOLATION",
  POOL_IMBALANCE = "POOL_IMBALANCE",
  FORECAST_DEVIATION = "FORECAST_DEVIATION",
}

export enum ForecastHorizon {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  QUARTER = "QUARTER",
  YEAR = "YEAR",
}

export enum ForecastConfidence {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum FXExposureDirection {
  LONG = "LONG",
  SHORT = "SHORT",
  FLAT = "FLAT",
}

export enum CurrencyType {
  BASE = "BASE",
  FUNCTIONAL = "FUNCTIONAL",
  REPORTING = "REPORTING",
  SETTLEMENT = "SETTLEMENT",
}

export interface CurrencyPosition {
  currency: string;
  currencyType: CurrencyType;
  totalBalance: number;
  availableBalance: number;
  restrictedBalance: number;
  classificationBreakdown: Record<CashClassification, number>;
  liquidityBreakdown: Record<LiquidityCategory, number>;
  fxExposure: number;
  fxExposureDirection: FXExposureDirection;
  exchangeRateToBase: number;
  exchangeRateTimestamp: string;
}

export interface CashPosition {
  id: string;
  companyId: string;
  legalEntityId: string;
  region: string;
  currency: string;
  classification: CashClassification;
  totalBalance: number;
  availableBalance: number;
  ledgerBalance: number;
  floatBalance: number;
  bankBalance: number;
  bankAccountId: string;
  bankConnectionId: string;
  providerKind: string;
  institutionName: string;
  lastSyncedAt: string;
  recordedAt: string;
}

export interface LiquidityPosition {
  id: string;
  companyId: string;
  legalEntityId: string;
  region: string;
  currency: string;
  category: LiquidityCategory;
  amount: number;
  percentageOfTotal: number;
  daysToLiquidate: number;
  instruments: LiquidityInstrument[];
  lastCalculatedAt: string;
}

export interface LiquidityInstrument {
  type: string;
  description: string;
  amount: number;
  currency: string;
  maturityDate: string | null;
  daysToLiquidate: number;
  haircut: number;
}

export interface TreasuryAccount {
  id: string;
  companyId: string;
  legalEntityId: string;
  businessUnit: string;
  region: string;
  bankAccountId: string;
  institutionName: string;
  currency: string;
  classification: CashClassification;
  treasuryRole: TreasuryRole;
  isSweepTarget: boolean;
  isConcentrationAccount: boolean;
  poolMembership: string[];
  minimumBalance: number;
  targetBalance: number;
  maximumBalance: number;
  status: AccountStatus;
}

export enum TreasuryRole {
  PRIMARY_OPERATING = "PRIMARY_OPERATING",
  SECONDARY_OPERATING = "SECONDARY_OPERATING",
  DISBURSEMENT = "DISBURSEMENT",
  CONCENTRATION = "CONCENTRATION",
  RESERVE = "RESERVE",
  INVESTMENT = "INVESTMENT",
  COLLECTION = "COLLECTION",
  PAYROLL = "PAYROLL",
  TAX = "TAX",
  SETTLEMENT = "SETTLEMENT",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  DORMANT = "DORMANT",
  FROZEN = "FROZEN",
  CLOSED = "CLOSED",
}

export interface CashPool {
  id: string;
  companyId: string;
  name: string;
  poolType: PoolType;
  currency: string;
  region: string;
  memberAccounts: CashPoolMember[];
  totalBalance: number;
  availableBalance: number;
  targetUtilization: number;
  currentUtilization: number;
  interestRate: number | null;
  notionalValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CashPoolMember {
  accountId: string;
  institutionName: string;
  balance: number;
  targetBalance: number;
  contributionRatio: number;
  isLeadAccount: boolean;
}

export interface CashMovement {
  id: string;
  companyId: string;
  sourceLegalEntityId: string;
  targetLegalEntityId: string;
  sourceAccountId: string;
  targetAccountId: string;
  currency: string;
  amount: number;
  fundingType: FundingType;
  status: FundingStatus;
  reason: string;
  approvalRequired: boolean;
  approvedById: string | null;
  executedAt: string | null;
  requestedAt: string;
  completedAt: string | null;
  failureReason: string | null;
  referenceId: string;
}

export interface CashForecast {
  id: string;
  companyId: string;
  legalEntityId: string;
  currency: string;
  horizon: ForecastHorizon;
  confidence: ForecastConfidence;
  generatedAt: string;
  validFrom: string;
  validTo: string;
  predictedInflows: ForecastLineItem[];
  predictedOutflows: ForecastLineItem[];
  netPrediction: number;
  openingBalance: number;
  closingBalance: number;
  minimumProjectedBalance: number;
  maximumProjectedBalance: number;
  keyRisks: string[];
  keyAssumptions: string[];
  aiConfidenceScore: number | null;
}

export interface ForecastLineItem {
  category: string;
  description: string;
  predictedAmount: number;
  probability: number;
  expectedDate: string;
  isRecurring: boolean;
  variance: number | null;
}

export interface FundingRequest {
  id: string;
  companyId: string;
  sourceLegalEntityId: string;
  targetLegalEntityId: string;
  currency: string;
  requestedAmount: number;
  approvedAmount: number | null;
  fundingType: FundingType;
  priority: number;
  reason: string;
  status: FundingStatus;
  requestedById: string;
  approvedById: string | null;
  requiredByDate: string;
  approvedAt: string | null;
  executedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface FundingDecision {
  fundingRequestId: string;
  decision: "APPROVED" | "REJECTED" | "MODIFIED";
  approvedAmount: number | null;
  decisionById: string;
  decisionAt: string;
  reason: string;
  conditions: string[];
}

export interface InvestmentBucket {
  id: string;
  companyId: string;
  legalEntityId: string;
  name: string;
  currency: string;
  totalAllocated: number;
  currentValue: number;
  availableForInvestment: number;
  strategy: InvestmentStrategy;
  holdings: InvestmentHolding[];
  maturityProfile: MaturityProfile;
  restrictions: string[];
  createdAt: string;
  updatedAt: string;
}

export enum InvestmentStrategy {
  CONSERVATIVE = "CONSERVATIVE",
  MODERATE = "MODERATE",
  AGGRESSIVE = "AGGRESSIVE",
  CUSTOM = "CUSTOM",
}

export interface InvestmentHolding {
  type: string;
  description: string;
  amount: number;
  currency: string;
  purchaseDate: string;
  maturityDate: string | null;
  yield: number;
  counterparty: string;
  rating: string;
}

export interface MaturityProfile {
  under30Days: number;
  under90Days: number;
  under180Days: number;
  under365Days: number;
  over365Days: number;
}

export interface RestrictedCash {
  id: string;
  companyId: string;
  legalEntityId: string;
  accountId: string;
  currency: string;
  totalAmount: number;
  restrictionType: RestrictionType;
  restrictionDescription: string;
  counterparty: string;
  releaseDate: string | null;
  isReleased: boolean;
  regulatoryReference: string | null;
  createdAt: string;
}

export enum RestrictionType {
  REGULATORY = "REGULATORY",
  CONTRACTUAL = "CONTRACTUAL",
  LEGAL = "LEGAL",
  COLLATERAL = "COLLATERAL",
  ESCROW = "ESCROW",
  TAX = "TAX",
  OTHER = "OTHER",
}

export interface WorkingCapital {
  id: string;
  companyId: string;
  legalEntityId: string;
  currency: string;
  currentAssets: number;
  currentLiabilities: number;
  netWorkingCapital: number;
  currentRatio: number;
  quickRatio: number;
  cashConversionCycleDays: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventory: number;
  calculatedAt: string;
}

export interface FXExposure {
  id: string;
  companyId: string;
  legalEntityId: string;
  sourceCurrency: string;
  targetCurrency: string;
  exposureAmount: number;
  exposureDirection: FXExposureDirection;
  currentRate: number;
  previousRate: number;
  rateChange: number;
  unrealizedPnl: number;
  realizedPnl: number;
  hedgeStatus: HedgeStatus;
  hedgeInstrument: string | null;
  policyLimit: number | null;
  breachLimit: boolean;
}

export enum HedgeStatus {
  NONE = "NONE",
  PARTIALLY_HEDGED = "PARTIALLY_HEDGED",
  FULLY_HEDGED = "FULLY_HEDGED",
  EXPIRED = "EXPIRED",
}

export interface CounterpartyRisk {
  counterpartyId: string;
  counterpartyName: string;
  counterpartyType: CounterpartyType;
  creditRating: string;
  exposureAmount: number;
  exposureLimit: number;
  utilizationPercent: number;
  collateralHeld: number;
  daysOverLimit: number;
  status: CounterpartyStatus;
  lastReviewDate: string;
  nextReviewDate: string;
  riskScore: number;
}

export enum CounterpartyType {
  BANK = "BANK",
  FINANCIAL_INSTITUTION = "FINANCIAL_INSTITUTION",
  CORPORATE = "CORPORATE",
  GOVERNMENT = "GOVERNMENT",
  CLEARING_HOUSE = "CLEARING_HOUSE",
}

export enum CounterpartyStatus {
  ACTIVE = "ACTIVE",
  WATCH = "WATCH",
  RESTRICTED = "RESTRICTED",
  SUSPENDED = "SUSPENDED",
}

export interface CashPolicy {
  id: string;
  companyId: string;
  name: string;
  policyType: CashPolicyType;
  currency: string;
  region: string;
  legalEntityId: string | null;
  minimumBalance: number | null;
  targetBalance: number | null;
  maximumBalance: number | null;
  liquidityBufferPercent: number;
  concentrationLimit: number;
  counterpartyLimit: number;
  investmentLimit: number;
  rules: CashPolicyRule[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CashPolicyType {
  MINIMUM_CASH = "MINIMUM_CASH",
  TARGET_CASH = "TARGET_CASH",
  LIQUIDITY_BUFFER = "LIQUIDITY_BUFFER",
  CONCENTRATION = "CONCENTRATION",
  COUNTERPARTY = "COUNTERPARTY",
  INVESTMENT = "INVESTMENT",
  REGIONAL = "REGIONAL",
  FUNDING = "FUNDING",
}

export interface CashPolicyRule {
  field: string;
  operator: "EQ" | "GT" | "GTE" | "LT" | "LTE" | "BETWEEN";
  value: number | [number, number];
  severity: TreasuryAlertSeverity;
  message: string;
}

export interface TreasuryPolicy {
  id: string;
  companyId: string;
  name: string;
  description: string;
  policies: CashPolicy[];
  approvalMatrix: TreasuryApprovalMatrix;
  reportingSchedule: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

export interface TreasuryApprovalMatrix {
  fundingBelow1M: string;
  fundingBelow10M: string;
  fundingAbove10M: string;
  intercompanyBelow1M: string;
  intercompanyAbove1M: string;
  investmentBelow5M: string;
  investmentAbove5M: string;
}

export interface TreasuryAlert {
  id: string;
  companyId: string;
  legalEntityId: string | null;
  severity: TreasuryAlertSeverity;
  category: TreasuryAlertCategory;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedById: string | null;
  acknowledgedAt: string | null;
  resolved: boolean;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface TreasurySnapshot {
  id: string;
  companyId: string;
  legalEntityId: string;
  region: string;
  recordedAt: string;
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  idleCash: number;
  netLiquidity: number;
  workingCapital: WorkingCapital | null;
  positionsByCurrency: CurrencyPosition[];
  liquidityByCategory: Record<LiquidityCategory, number>;
  cashByClassification: Record<CashClassification, number>;
  totalExposure: number;
  openFundingRequests: number;
  activePools: number;
  policyViolations: number;
  alerts: TreasuryAlert[];
}

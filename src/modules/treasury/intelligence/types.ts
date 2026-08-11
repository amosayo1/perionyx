/**
 * Program 1 — Treasury Intelligence Platform: Canonical Domain Types
 *
 * The intelligence layer of the Treasury platform. These types describe the
 * domain records the platform consumes and the artifacts it produces. They are
 * deliberately platform-neutral: data arrives through the `TreasuryDataSource`
 * boundary (Prisma today, any provider later) and every judgment is produced by
 * the canonical platform services — Evidence Engine (Phase 22.4), Decision
 * Intelligence (Phase 22.5), Enterprise Workflow (Phase 23). Nothing here
 * recreates a platform service.
 *
 * No LLM. No random. No formatted-money in the decision path — amounts are
 * decimal strings at full precision; the Decision Intelligence engine receives
 * measured numeric facts only.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Entity types (canonical ids — the contract for evidence + decisions)
// ──────────────────────────────────────────────────────────────────────────────

export type TreasuryEntityType =
  | "treasury.payment"
  | "treasury.transfer"
  | "treasury.funding"
  | "treasury.cash-position"
  | "treasury.forecast"
  | "treasury.bank-account";

export const TREASURY_ENTITY_TYPES: readonly TreasuryEntityType[] = [
  "treasury.payment",
  "treasury.transfer",
  "treasury.funding",
  "treasury.cash-position",
  "treasury.forecast",
  "treasury.bank-account",
];

// ──────────────────────────────────────────────────────────────────────────────
// Shared value types
// ──────────────────────────────────────────────────────────────────────────────

/** Risk bands — duck-typed from Decision Intelligence (RiskLevel). */
export type RiskLevel = "low" | "medium" | "high" | "critical";

export const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/** Recommendation bands — duck-typed from Decision Intelligence. */
export type RecommendationCategory =
  | "approve"
  | "approve-with-warning"
  | "needs-review"
  | "escalate"
  | "reject"
  | "cannot-decide";

// ──────────────────────────────────────────────────────────────────────────────
// Cash position
// ──────────────────────────────────────────────────────────────────────────────

export type CashClassification =
  | "operating"
  | "reserve"
  | "restricted"
  | "float"
  | "other";

export interface CashPositionRecord {
  tenantId: string;
  id: string;
  entityId: string;
  region: string;
  currency: string;
  classification: CashClassification;
  /** Full-precision decimal strings — never formatted in the decision path. */
  totalBalance: string;
  availableBalance: string;
  ledgerBalance: string;
  floatBalance: string;
  bankBalance: string;
  bankAccountId: string;
  institutionName: string;
  lastSyncedAt: string | null;
  recordedAt: string;
}

export interface LiquidityPositionRecord {
  tenantId: string;
  id: string;
  entityId: string;
  region: string;
  currency: string;
  category: string;
  amount: string;
  daysToLiquidate: number;
  lastCalculatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Cash forecast
// ──────────────────────────────────────────────────────────────────────────────

export interface ForecastLineItem {
  label: string;
  amount: string;
  currency: string;
  dueAt: string;
}

export type ForecastHorizon = "week" | "month" | "quarter";

export type ForecastConfidence = "high" | "medium" | "low";

export interface CashForecastRecord {
  tenantId: string;
  id: string;
  entityId: string;
  currency: string;
  horizon: ForecastHorizon;
  confidence: ForecastConfidence;
  generatedAt: string;
  validFrom: string;
  validTo: string;
  predictedInflows: ForecastLineItem[];
  predictedOutflows: ForecastLineItem[];
  netPrediction: string;
  openingBalance: string;
  closingBalance: string;
  minimumProjectedBalance: string;
  maximumProjectedBalance: string;
  keyRisks: string[];
  keyAssumptions: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Bank accounts
// ──────────────────────────────────────────────────────────────────────────────

export interface BankAccountRecord {
  tenantId: string;
  id: string;
  entityId: string;
  name: string;
  currency: string;
  accountNumber: string | null;
  bankName: string;
  bankCode: string;
  country: string;
  balance: string;
  isActive: boolean;
  lastSyncedAt: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Payments
// ──────────────────────────────────────────────────────────────────────────────

export type TreasuryPaymentStatus =
  | "draft"
  | "scheduled"
  | "pending-approval"
  | "approved"
  | "rejected"
  | "processing"
  | "released"
  | "failed"
  | "returned"
  | "cancelled";

export interface TreasuryPaymentRecord {
  tenantId: string;
  id: string;
  entityId: string;
  beneficiaryName: string;
  beneficiaryRiskLevel: RiskLevel;
  amount: string;
  currency: string;
  method: string;
  status: TreasuryPaymentStatus;
  scheduledDate: string;
  initiatorId: string;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
  reference: string | null;
  /** Bank confirmation record id — evidence of counterparty settlement. */
  bankConfirmationId: string | null;
  /** Mandate/signatory verification completed for this beneficiary. */
  mandateVerified: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Transfers (intra-entity cash movement)
// ──────────────────────────────────────────────────────────────────────────────

export type TreasuryMovementStatus =
  | "draft"
  | "pending-approval"
  | "approved"
  | "rejected"
  | "processing"
  | "executed"
  | "failed"
  | "cancelled";

export interface TreasuryTransferRecord {
  tenantId: string;
  id: string;
  entityId: string;
  sourceAccountId: string;
  targetAccountId: string;
  currency: string;
  amount: string;
  fundingType: string;
  status: TreasuryMovementStatus;
  reason: string;
  approvalRequired: boolean;
  approvedById: string | null;
  requestedAt: string;
  executedAt: string | null;
  failureReason: string | null;
  referenceId: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Intercompany funding (cross-entity)
// ──────────────────────────────────────────────────────────────────────────────

export interface TreasuryFundingRecord {
  tenantId: string;
  id: string;
  entityId: string;
  sourceEntityId: string;
  targetEntityId: string;
  currency: string;
  amount: string;
  purpose: string;
  status: TreasuryMovementStatus;
  /** Intercompany agreement reference — the supporting-document evidence. */
  intercompanyAgreementRef: string | null;
  approvedById: string | null;
  requestedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// FX exposure
// ──────────────────────────────────────────────────────────────────────────────

export interface FxExposureRecord {
  tenantId: string;
  id: string;
  entityId: string;
  currency: string;
  exposure: string;
  rate: string;
  counterpartyRiskLevel: RiskLevel;
  hedged: boolean;
  measuredAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Alerts (recorded treasury alerts — surfaced, never invented)
// ──────────────────────────────────────────────────────────────────────────────

export type TreasuryAlertSeverity = "info" | "warning" | "critical";

export type TreasuryAlertCategory =
  | "liquidity"
  | "balance-staleness"
  | "sla-breach"
  | "failed-payment"
  | "fx"
  | "concentration"
  | "approval"
  | "mandate";

export interface TreasuryAlertRecord {
  tenantId: string;
  id: string;
  severity: TreasuryAlertSeverity;
  category: TreasuryAlertCategory;
  title: string;
  message: string;
  createdAt: string;
  target: { type: TreasuryEntityType; id: string } | null;
}

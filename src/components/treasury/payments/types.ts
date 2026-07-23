export type PaymentStatus = "draft" | "pending_approval" | "approved" | "queued" | "processing" | "settled" | "failed" | "cancelled";
export type PaymentType = "wire" | "ach" | "sepa" | "swift" | "rtgs" | "rtp" | "fednow" | "fps" | "chaps" | "bacs" | "instant" | "internal" | "book" | "cross_border" | "cheque";
export type PaymentPriority = "urgent" | "high" | "normal" | "low";
export type CollectionMethod = "wire" | "ach" | "sepa_direct" | "rtp" | "card" | "direct_debit" | "check" | "cash";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "changes_requested";
export type IntercompanyStatus = "draft" | "pending_approval" | "approved" | "settled" | "failed" | "cancelled";
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertCategory = "approval_sla" | "failed_payment" | "settlement_delay" | "duplicate_payment" | "large_payment" | "policy_violation" | "liquidity_impact" | "counterparty_risk" | "fx_timing" | "fraud_review";
export type RecommendationPriority = "critical" | "high" | "medium" | "low";
export type RecommendationCategory = "timing" | "collections" | "rail_optimization" | "consolidation" | "risk" | "liquidity" | "duplicate" | "fx";

export interface DashboardFilters {
  region: string | null;
  legalEntity: string | null;
  businessUnit: string | null;
  bank: string | null;
  currency: string | null;
  paymentType: string | null;
  paymentRail: string | null;
  priority: string | null;
  status: string | null;
  approver: string | null;
  dateRange: [string, string] | null;
  amountRange: [number, number] | null;
  counterparty: string | null;
}

export interface PaymentMetrics {
  outgoingCount: number;
  outgoingValue: number;
  incomingCount: number;
  incomingValue: number;
  netCashFlow: number;
  pendingCount: number;
  pendingValue: number;
  awaitingApproval: number;
  awaitingApprovalValue: number;
  completedToday: number;
  completedTodayValue: number;
  failedToday: number;
  failedTodayValue: number;
  averageProcessingMinutes: number;
  averageSettlementHours: number;
  dailyVolume: number;
  entities: number;
  banks: number;
  currencies: number;
  alerts: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface Counterparty {
  id: string;
  name: string;
  type: "customer" | "vendor" | "bank" | "entity" | "government" | "other";
  region: string;
  currency: string;
  riskScore: number;
}

export interface Payment {
  id: string;
  entity: string;
  region: string;
  businessUnit: string;
  counterparty: string;
  counterpartyId: string;
  bank: string;
  currency: string;
  amount: number;
  paymentType: PaymentType;
  rail: string;
  priority: PaymentPriority;
  status: PaymentStatus;
  requestedDate: string;
  executionDate: string;
  settlementDate: string;
  approvedBy: string;
  purpose: string;
  reference: string;
  risk: "low" | "medium" | "high";
  slaMinutes: number;
  cost: number;
  errorMessage?: string;
}

export interface Collection {
  id: string;
  customer: string;
  entity: string;
  region: string;
  currency: string;
  amount: number;
  expectedDate: string;
  receivedDate: string;
  method: CollectionMethod;
  status: "expected" | "received" | "overdue" | "short" | "disputed" | "cancelled";
  variance: number;
  variancePercent: number;
  risk: "low" | "medium" | "high";
  reference: string;
}

export interface ApprovalRequest {
  id: string;
  paymentId: string;
  paymentReference: string;
  entity: string;
  counterparty: string;
  currency: string;
  amount: number;
  paymentType: string;
  requestedBy: string;
  approver: string;
  approvalLevel: number;
  approvalChain: string[];
  status: ApprovalStatus;
  slaMinutes: number;
  slaRemainingMinutes: number;
  policy: string;
  risk: "low" | "medium" | "high";
  requestedDate: string;
  responseDate: string;
  escalationLevel: number;
  notes: string;
}

export interface IntercompanyPayment {
  id: string;
  fromEntity: string;
  fromRegion: string;
  toEntity: string;
  toRegion: string;
  amount: number;
  currency: string;
  purpose: string;
  interestRate: number;
  settlementDate: string;
  expectedCompletion: string;
  approvalStatus: IntercompanyStatus;
  settlementMethod: string;
  status: IntercompanyStatus;
  loanTermDays: number;
}

export interface TreasuryTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  fromEntity: string;
  toEntity: string;
  amount: number;
  currency: string;
  purpose: string;
  status: PaymentStatus;
  requestedDate: string;
  executionDate: string;
  settlementDate: string;
  authorizedBy: string;
  reference: string;
}

export interface CashMovement {
  category: string;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
  runningBalance: number;
  type: "collection" | "payment" | "transfer" | "funding" | "investment" | "fx" | "fees" | "payroll" | "tax" | "intercompany";
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: "large_payment" | "payroll" | "tax" | "debt" | "treasury" | "intercompany" | "recurring" | "settlement";
  label: string;
  entity: string;
  currency: string;
  amount: number;
  status: PaymentStatus;
  priority: PaymentPriority;
}

export interface PaymentRail {
  id: string;
  name: string;
  code: string;
  type: "domestic" | "cross_border" | "instant" | "internal";
  volume: number;
  value: number;
  averageSettlementMinutes: number;
  averageCost: number;
  successRate: number;
  supportedCurrencies: string[];
  supportedRegions: string[];
  maxAmount: number;
  minAmount: number;
}

export interface PaymentRoute {
  id: string;
  currency: string;
  country: string;
  preferredRail: string;
  fallbackRail: string;
  averageTime: number;
  averageCost: number;
  riskScore: number;
  provider: string;
  maxAmount: number;
}

export interface Settlement {
  id: string;
  paymentId: string;
  paymentReference: string;
  bank: string;
  rail: string;
  currency: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "delayed";
  initiatedAt: string;
  expectedAt: string;
  completedAt: string;
  confirmationCode: string;
  errorDetail: string;
}

export interface PaymentAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  entity: string;
  paymentReference: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface PaymentRecommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  impactLabel: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  entity: string;
  roi: string;
}

export interface PaymentInsight {
  label: string;
  value: string;
  description: string;
  metric: string;
  entity: string;
  severity: "positive" | "warning" | "critical";
}

export interface TrendPoint {
  date: string;
  value: number;
  label: string;
}

export interface AnalyticsSeries {
  name: string;
  data: TrendPoint[];
  color: string;
}

export interface PaymentRiskItem {
  id: string;
  category: string;
  label: string;
  description: string;
  value: number;
  count: number;
  severity: "healthy" | "watch" | "critical";
  entity: string;
}

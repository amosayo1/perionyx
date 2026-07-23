export type CustomerStatus = "active" | "inactive" | "suspended" | "closed";
export type CustomerType = "individual" | "business" | "government" | "nonprofit";
export type PaymentTermType = "net30" | "net45" | "net60" | "dueUponReceipt" | "custom" | "prepaid" | "eom" | "eom45" | "eom60" | "prox10" | "prox25" | "cashOnDelivery";
export type InvoiceStatus = "draft" | "pending" | "approved" | "sent" | "partial" | "paid" | "overdue" | "disputed" | "creditMemos" | "writeOff" | "cancelled" | "void";
export type ReceiptStatus = "pending" | "applied" | "partial" | "unapplied" | "onAccount" | "disputed" | "voided";
export type CollectionStatus = "open" | "inProgress" | "escalated" | "resolved" | "closed";
export type CollectionPriority = "low" | "medium" | "high" | "urgent";
export type CollectionAction = "email" | "phone" | "letter" | "escalation" | "visit" | "reminder" | "dunning" | "legal";
export type DisputeStatus = "open" | "investigating" | "resolved" | "rejected" | "cancelled";
export type DisputeReason = "duplicate" | "incorrectAmount" | "missingPO" | "serviceNotRendered" | "damagedGoods" | "lateDelivery" | "contractual" | "creditNotApplied" | "other";
export type AdjustmentType = "creditNote" | "debitNote" | "discount" | "rebate" | "correction" | "writeOff" | "promotional";
export type AdjustmentStatus = "draft" | "pending" | "approved" | "applied" | "rejected" | "cancelled";
export type WriteOffStatus = "pending" | "approved" | "applied" | "rejected" | "cancelled";
export type WriteOffReason = "bankruptcy" | "uncollectible" | "smallBalance" | "deceased" | "disputed" | "statuteBarred" | "credit" | "other";
export type CreditLimitStatus = "active" | "suspended" | "expired" | "revoked";
export type RiskRating = "low" | "medium" | "high" | "critical";
export type StatementStatus = "generated" | "sent" | "paid" | "partial";
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertCategory = "payment" | "credit" | "collection" | "dispute" | "aging" | "forecast" | "compliance" | "system";
export type ForecastPeriod = "daily" | "weekly" | "monthly" | "quarterly";
export type PaymentMethod = "bankTransfer" | "check" | "creditCard" | "ach" | "wire" | "cash" | "onlinePayment" | "lockbox";
export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CHF" | "CAD" | "AUD" | "MXN" | "BRL" | "CNY" | "INR" | "SAR" | "AED";
export type TaxType = "vat" | "gst" | "sales" | "withholding" | "none";
export type DunningLevel = "level1" | "level2" | "level3" | "final";
export type MatchingMethod = "automatic" | "manual" | "ruleBased";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PaymentTerms {
  type: PaymentTermType;
  netDays: number;
  discountPercent?: number;
  discountDays?: number;
  dueDateOffset?: number;
}

export interface CustomerContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  isPrimary: boolean;
  department?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  email: string;
  phone?: string;
  website?: string;
  taxId?: string;
  taxExempt: boolean;
  taxType: TaxType;
  taxRate: number;
  currency: CurrencyCode;
  paymentTerms: PaymentTerms;
  billingAddress: Address;
  shippingAddress?: Address;
  contacts: CustomerContact[];
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  riskRating: RiskRating;
  riskScore: number;
  totalOutstanding: number;
  totalOverdue: number;
  dso: number;
  lifetimeValue: number;
  averagePaymentDays: number;
  lastPaymentDate?: Date;
  lastInvoiceDate?: Date;
  notes?: string;
  onboardingDate: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLine {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  netTotal: number;
  productCode?: string;
  serviceDate?: Date;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  type: "standard" | "creditNote" | "debitNote" | "proforma" | "recurring";
  currency: CurrencyCode;
  lines: InvoiceLine[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxType: TaxType;
  taxExempt: boolean;
  grandTotal: number;
  amountDue: number;
  amountPaid: number;
  paymentTerms: PaymentTerms;
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  lastPaymentDate?: Date;
  poNumber?: string;
  referenceNumber?: string;
  billingAddress: Address;
  shippingAddress?: Address;
  notes?: string;
  internalNotes?: string;
  dunningLevel: DunningLevel;
  dunningCount: number;
  agingBucket: string;
  daysOverdue: number;
  disputeId?: string;
  creditNoteReference?: string;
  recurringScheduleId?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: CurrencyCode;
  fxRate: number;
  baseAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptDate: Date;
  status: ReceiptStatus;
  appliedAmount: number;
  unappliedAmount: number;
  onAccountAmount: number;
  bankAccountId?: string;
  checkNumber?: string;
  wireReference?: string;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAllocation {
  id: string;
  receiptId: string;
  invoiceId: string;
  amount: number;
  discountTaken: number;
  writeOffAmount: number;
  allocatedDate: Date;
  method: MatchingMethod;
  notes?: string;
}

export interface CashApplication {
  id: string;
  receiptId: string;
  customerId: string;
  customerName: string;
  allocations: PaymentAllocation[];
  totalAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  isFullyApplied: boolean;
  appliedDate: Date;
  method: MatchingMethod;
  status: "pending" | "completed" | "partial" | "exception";
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionActivity {
  id: string;
  collectionId: string;
  action: CollectionAction;
  description: string;
  performedBy: string;
  performedAt: Date;
  outcome?: string;
  followUpDate?: Date;
  notes?: string;
}

export interface CollectionRecord {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amountDue: number;
  currency: CurrencyCode;
  daysOverdue: number;
  agingBucket: string;
  status: CollectionStatus;
  priority: CollectionPriority;
  collector: string;
  assignedAt: Date;
  lastActivity?: Date;
  activities: CollectionActivity[];
  promiseToPay?: Date;
  promiseAmount?: number;
  promiseKept?: boolean;
  escalationLevel: number;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditLimit {
  id: string;
  customerId: string;
  customerName: string;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  currency: CurrencyCode;
  riskRating: RiskRating;
  riskScore: number;
  status: CreditLimitStatus;
  approvedBy: string;
  approvalDate: Date;
  reviewDate: Date;
  lastReviewDate?: Date;
  nextReviewDate: Date;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditReview {
  id: string;
  customerId: string;
  customerName: string;
  previousLimit: number;
  requestedLimit: number;
  approvedLimit: number;
  riskRating: RiskRating;
  riskScore: number;
  reason: string;
  reviewedBy: string;
  reviewDate: Date;
  effectiveDate: Date;
  status: "pending" | "approved" | "rejected" | "modified";
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dispute {
  id: string;
  disputeNumber: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: CurrencyCode;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedAmount?: number;
  resolvedDate?: Date;
  assignedTo?: string;
  dueDate: Date;
  evidence?: string[];
  customerContact?: string;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  type: AdjustmentType;
  status: AdjustmentStatus;
  amount: number;
  currency: CurrencyCode;
  reason: string;
  description: string;
  taxImpact: number;
  glAccountCode?: string;
  approvedBy?: string;
  approvalDate?: Date;
  appliedDate?: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WriteOff {
  id: string;
  writeOffNumber: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  originalAmount: number;
  writeOffAmount: number;
  remainingAmount: number;
  currency: CurrencyCode;
  reason: WriteOffReason;
  status: WriteOffStatus;
  glAccountCode: string;
  approvedBy?: string;
  approvalDate?: Date;
  appliedDate?: Date;
  recoveryAmount: number;
  recoveryDate?: Date;
  notes?: string;
  companyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatementLine {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  originalAmount: number;
  payments: number;
  adjustments: number;
  outstanding: number;
  daysOverdue: number;
  agingBucket: string;
}

export interface CustomerStatement {
  id: string;
  statementNumber: string;
  customerId: string;
  customerName: string;
  billingAddress: Address;
  currency: CurrencyCode;
  statementDate: Date;
  dueDate: Date;
  status: StatementStatus;
  beginningBalance: number;
  invoiceTotal: number;
  paymentTotal: number;
  adjustmentTotal: number;
  endingBalance: number;
  lines: StatementLine[];
  agingSummary: AgingSummary;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgingBucket {
  bucket: "current" | "1to30" | "31to60" | "61to90" | "91plus";
  amount: number;
  count: number;
  percentage: number;
}

export interface AgingSummary {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days91plus: number;
  total: number;
  totalOverdue: number;
  overduePercentage: number;
  buckets: AgingBucket[];
}

export interface DSOReport {
  period: string;
  dso: number;
  bestPossibleDSO: number;
  averageDSO: number;
  trend: "improving" | "worsening" | "stable";
  revenue: number;
  receivables: number;
  comparativeDSO?: number;
}

export interface CEIReport {
  period: string;
  cei: number;
  beginningReceivables: number;
  collections: number;
  newCharges: number;
  endingReceivables: number;
  targetCEI: number;
  trend: "improving" | "worsening" | "stable";
}

export interface AgingReport {
  asOfDate: Date;
  customerId: string;
  customerName: string;
  totalOutstanding: number;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days91plus: number;
  totalOverdue: number;
  overduePercentage: number;
}

export interface ARForecast {
  id: string;
  period: ForecastPeriod;
  forecastDate: Date;
  projectedCollections: number;
  projectedInvoices: number;
  projectedReceipts: number;
  confidenceLow: number;
  confidenceHigh: number;
  confidenceLevel: number;
  expectedDSO: number;
  expectedCashInflow: number;
  expectedCashOutflow?: number;
  scenarios: ForecastScenario[];
  methodology: "statistical" | "ml" | "hybrid" | "manual";
  accuracy?: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastScenario {
  name: string;
  probability: number;
  collections: number;
  assumptions: string[];
}

export interface Recommendation {
  id: string;
  type: "collection" | "credit" | "dispute" | "writeOff" | "discount" | "paymentPlan" | "riskAlert" | "process" | "customer";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "implemented" | "dismissed" | "expired";
  impact: number;
  impactCurrency: CurrencyCode;
  effort: "low" | "medium" | "high";
  customerId?: string;
  customerName?: string;
  invoiceId?: string;
  createdAt: Date;
  expiresAt?: Date;
  implementedAt?: Date;
  companyId: string;
}

export interface ARAlert {
  id: string;
  type: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  customerId?: string;
  customerName?: string;
  invoiceId?: string;
  isRead: boolean;
  isResolved: boolean;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  companyId: string;
  createdAt: Date;
}

export interface ARKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  period: string;
  category: "aging" | "efficiency" | "credit" | "collection" | "cash" | "customer";
  status: "onTrack" | "atRisk" | "critical" | "exceeding";
}

export interface PaymentPrediction {
  invoiceId: string;
  customerId: string;
  customerName: string;
  predictedPaymentDate: Date;
  paymentProbability: number;
  expectedAmount: number;
  confidenceScore: number;
  factors: string[];
}

export interface GLJournalEntry {
  id: string;
  entryNumber: string;
  type: "invoice" | "receipt" | "writeOff" | "adjustment" | "creditNote" | "debitNote" | "discount";
  referenceId: string;
  referenceType: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  debitAmount: number;
  creditAmount: number;
  currency: CurrencyCode;
  fxRate: number;
  baseAmount: number;
  entryDate: Date;
  posted: boolean;
  postedDate?: Date;
  companyId: string;
}

export interface ARPaymentProjection {
  date: Date;
  expectedAmount: number;
  confidence: number;
  fromInvoices: number;
  fromRecurring: number;
  fromCollections: number;
}

export interface ARExecutiveSummary {
  totalOutstanding: number;
  totalOverdue: number;
  overduePercentage: number;
  dso: number;
  dsoTrend: string;
  cei: number;
  ceiTrend: string;
  collectionRate: number;
  cashInflow30Days: number;
  cashInflow60Days: number;
  cashInflow90Days: number;
  highRiskExposure: number;
  totalDisputed: number;
  pendingWriteOffs: number;
  customerCount: number;
  activeCollections: number;
  forecastAccuracy: number;
}

export interface ARAggregateMetrics {
  totalInvoices: number;
  totalPaid: number;
  totalOverdue: number;
  totalDisputed: number;
  totalDraft: number;
  totalOutstanding: number;
  totalReceipts: number;
  totalWriteOffs: number;
  totalAdjustments: number;
  activeCollections: number;
  activeDisputes: number;
  highRiskCustomers: number;
  averageDSO: number;
  averageCEI: number;
  cashInflow30Days: number;
  cashInflow60Days: number;
  cashInflow90Days: number;
  totalCreditExposure: number;
  creditUtilization: number;
  collectionEfficiency: number;
  forecastAccuracy: number;
}

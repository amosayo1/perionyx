export type TaxJurisdictionLevel = "country" | "state" | "region" | "city";
export type TaxType = "corporate-income" | "vat" | "gst" | "sales-tax" | "use-tax" | "withholding" | "payroll" | "property" | "import-duty" | "export-duty" | "digital-services" | "custom";
export type TaxCategory = "indirect" | "direct" | "withholding" | "duty" | "payroll" | "property" | "digital" | "other";
export type TaxRateType = "standard" | "reduced" | "zero" | "exempt" | "mixed" | "reverse-charge";
export type TaxReturnStatus = "draft" | "reviewed" | "approved" | "submitted" | "amended" | "cancelled";
export type TaxPaymentStatus = "scheduled" | "pending" | "paid" | "partial" | "overpaid" | "refunded";
export type TaxCalendarStatus = "upcoming" | "due" | "overdue" | "completed" | "waived";
export type ComplianceStatus = "compliant" | "at-risk" | "non-compliant" | "pending-review" | "under-audit";
export type AuditEventType = "rule-change" | "return-change" | "payment-change" | "approval" | "user-activity" | "compliance-event";
export type TaxAdjustmentType = "provision" | "true-up" | "reassessment" | "amendment" | "penalty" | "interest";
export type TransferPricingMethod = "cup" | "resale-price" | "cost-plus" | "tnmm" | "profit-split";
export type WithholdingType = "supplier" | "customer" | "interest" | "dividends" | "royalties" | "services";

export interface TaxJurisdiction {
  id: string; name: string; level: TaxJurisdictionLevel; country: string; countryCode: string;
  state?: string; stateCode?: string; region?: string; city?: string;
  taxTypes: TaxType[]; currency: string; standardRate: number;
  isActive: boolean; effectiveFrom: Date; effectiveTo?: Date; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxAuthority {
  id: string; jurisdictionId: string; name: string; code: string;
  contactName: string; contactEmail: string; contactPhone: string; website?: string;
  filingFrequency: string; paymentTerms: string; isActive: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxRegistration {
  id: string; jurisdictionId: string; authorityId: string; taxNumber: string;
  taxType: TaxType; registrationDate: Date; status: string; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxRule {
  id: string; jurisdictionId: string; taxType: TaxType; taxCategory: TaxCategory;
  rateType: TaxRateType; rate: number; effectiveFrom: Date; effectiveTo?: Date;
  description: string; conditions?: string; isActive: boolean;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface IndirectTaxTransaction {
  id: string; transactionId: string; transactionType: string;
  jurisdictionId: string; authorityId?: string; taxType: TaxType; rateType?: TaxRateType;
  taxableAmount: number; taxAmount: number; inputTax: number; outputTax: number;
  netTax: number; currency: string; exchangeRate: number;
  transactionDate: Date; postingDate?: Date; invoiceReference?: string;
  customerId?: string; vendorId?: string; isReverseCharge: boolean;
  isExempt: boolean; exemptionReason?: string; description?: string;
  companyId: string; entityId?: string; createdAt: Date; updatedAt: Date;
}

export interface DirectTaxProvision {
  id: string; jurisdictionId: string; authorityId?: string;
  provisionType: "current" | "deferred" | "estimated"; taxType: TaxType;
  accountingProfit: number; taxableIncome: number; taxRate: number;
  taxPayable: number; deferredTaxAsset: number; deferredTaxLiability: number;
  adjustments: number; period: string; fiscalYear: string; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface WithholdingTaxRecord {
  id: string; withholdingType: WithholdingType; jurisdictionId: string; authorityId?: string;
  payeeId: string; payeeName: string; payeeType: "supplier" | "customer" | "employee" | "investor";
  grossAmount: number; withholdingRate: number; withholdingAmount: number; netAmount: number;
  currency: string; exchangeRate: number;
  certificateNumber?: string; certificateDate?: Date;
  isRecoverable: boolean; recoveredAmount: number;
  status: "certified" | "pending" | "cancelled";
  transactionDate: Date; paymentDate?: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TransferPricingRecord {
  id: string; relatedPartyId: string; relatedPartyName: string;
  transactionType: "goods" | "services" | "intangibles" | "loans" | "management-fees";
  method: TransferPricingMethod;
  controlledAmount: number; armLengthAmount: number; adjustment: number;
  currency: string; tnmmMargin?: number;
  documentationStatus: string; riskRating: string;
  fiscalYear: string; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxCalendarEntry {
  id: string; jurisdictionId: string; authorityId?: string;
  obligationType: "filing" | "payment" | "registration" | "other";
  title: string; description?: string;
  dueDate: Date; status: TaxCalendarStatus;
  estimatedAmount?: number; actualAmount?: number;
  reminderDays: number; recurring: boolean; recurrencePattern?: string;
  completedDate?: Date; assignedTo?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxReturn {
  id: string; returnNumber: string; jurisdictionId: string; authorityId?: string;
  returnType: TaxType; period: string; fiscalYear: string;
  status: TaxReturnStatus;
  totalLiability: number; totalPaid: number; amountDue: number; amountRefund: number;
  currency: string; dueDate: Date; submittedDate?: Date;
  approvedBy?: string; amendedDate?: Date; amendmentReason?: string; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxPayment {
  id: string; paymentNumber?: string; jurisdictionId: string; authorityId?: string;
  returnId?: string; paymentType: "estimated" | "filing" | "penalty" | "interest" | "refund";
  amount: number; currency: string; exchangeRate: number;
  status: TaxPaymentStatus; dueDate: Date; paidDate?: Date;
  method: "wire" | "ach" | "check" | "credit-card" | "direct-debit";
  reference?: string; bankAccount?: string;
  interestAmount: number; penaltyAmount: number; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxReconciliation {
  id: string; period: string; fiscalYear: string; jurisdictionId: string;
  glTaxLiability: number; taxReturnLiability: number; difference: number;
  adjustments: number; deferredTaxAdjustment: number;
  status: "balanced" | "unbalanced" | "reviewing";
  exceptions: string[]; reconciledBy?: string; reconciledAt?: Date; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxAdjustment {
  id: string; adjustmentType: TaxAdjustmentType; jurisdictionId: string;
  taxType: TaxType; period: string; fiscalYear: string;
  amount: number; currency: string; reason: string;
  approvedBy: string; approvedAt: Date; effectiveDate: Date; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ComplianceRecord {
  id: string; jurisdictionId: string; authorityId?: string; taxType?: TaxType;
  period: string; fiscalYear?: string;
  status: ComplianceStatus; complianceScore: number; riskLevel: "low" | "medium" | "high" | "critical";
  lastFiledDate?: Date; nextFilingDue?: Date; lastPaymentDate?: Date; nextPaymentDue?: Date;
  violations: string[]; notes?: string; reviewedBy?: string; reviewedAt?: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface AuditEvent {
  id: string; eventType: AuditEventType;
  entityType: "jurisdiction" | "rule" | "return" | "payment" | "compliance";
  entityId: string; description: string;
  userId: string; userName: string; details?: string; ipAddress?: string;
  severity: "info" | "warning" | "critical";
  timestamp: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface TaxKPI {
  id: string; name: string; value: number; previousValue: number; target: number;
  unit: string; category: string;
  trend: "up" | "down" | "stable"; status: "good" | "warning" | "critical";
  companyId: string; period: string; date: Date;
}

export interface TaxForecast {
  id: string; companyId: string; metric: string; period: string;
  currentValue: number; forecastValue: number; lowerBound: number; upperBound: number;
  confidence: number; trend: "increasing" | "decreasing" | "stable"; date: Date;
}

export interface TaxAlert {
  id: string; severity: "critical" | "warning" | "info"; type: string;
  title: string; message: string;
  actionRequired: boolean; dismissed: boolean;
  companyId: string; createdAt: Date;
}

export interface TaxRecommendation {
  id: string; type: string; title: string; description: string;
  impact: string; confidence: number;
  companyId: string; implemented: boolean; createdAt: Date;
}

export interface TaxAggregateMetrics {
  totalJurisdictions: number;
  totalAuthorities: number;
  totalRules: number;
  totalTransactions: number;
  totalProvisions: number;
  totalWithholding: number;
  totalTransferPricing: number;
  totalReturns: number;
  totalPayments: number;
  totalReconciliations: number;
  totalComplianceRecords: number;
  totalAlerts: number;
  activeAlerts: number;
  totalRecommendations: number;
  pendingRecommendations: number;
  totalUpcomingCalendarEntries: number;
  totalOverdueCalendarEntries: number;
  totalNonCompliant: number;
  totalAtRisk: number;
}

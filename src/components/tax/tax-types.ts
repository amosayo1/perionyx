import type {
  TaxJurisdiction,
  TaxAuthority,
  TaxRegistration,
  TaxRule as ServerTaxRule,
  IndirectTaxTransaction as ServerIndirectTaxTransaction,
  DirectTaxProvision as ServerDirectTaxProvision,
  WithholdingTaxRecord as ServerWithholdingTaxRecord,
  TransferPricingRecord,
  TaxCalendarEntry,
  TaxReturn,
  TaxPayment,
  TaxReconciliation,
  TaxAdjustment,
  ComplianceRecord as ServerComplianceRecord,
  AuditEvent as ServerAuditEvent,
  TaxKPI,
  TaxForecast,
  TaxAlert as ServerTaxAlert,
  TaxRecommendation as ServerTaxRecommendation,
} from "../../server/tax/types";

export type { TaxJurisdiction, TaxAuthority, TaxRegistration, TransferPricingRecord, TaxCalendarEntry, TaxReturn, TaxPayment, TaxReconciliation, TaxAdjustment, TaxKPI, TaxForecast };

export type TaxRule = ServerTaxRule;
export type IndirectTaxTransaction = ServerIndirectTaxTransaction;
export type DirectTaxProvision = ServerDirectTaxProvision;
export type WithholdingTaxRecord = ServerWithholdingTaxRecord;
export type ComplianceRecord = ServerComplianceRecord;
export type AuditEvent = ServerAuditEvent;
export type TaxAlert = ServerTaxAlert;
export type TaxRecommendation = ServerTaxRecommendation;

export interface TaxOverviewMetrics {
  totalJurisdictions: number; activeRules: number; totalTransactions: number;
  totalVatCollected: number; totalVatPaid: number; netVat: number;
  totalCorporateTax: number; totalDeferredTax: number;
  totalWithholding: number; totalTransferPricing: number;
  totalReturns: number; returnsSubmitted: number; returnsDraft: number;
  totalPayments: number; paymentsPaid: number; paymentsOverdue: number;
  complianceScore: number; atRiskJurisdictions: number;
  upcomingDeadlines: number; overdueDeadlines: number;
}

export interface ExecutiveTaxHeaderProps {
  totalTaxLiability: number; effectiveTaxRate: number;
  vatCollected: number; vatPaid: number;
  corporateTax: number; deferredTax: number;
  complianceScore: number; upcomingDeadlines: number;
}

export interface TaxChartDataPoint {
  period: string; value: number; previousValue?: number;
  forecast?: number; upperBound?: number; lowerBound?: number;
}

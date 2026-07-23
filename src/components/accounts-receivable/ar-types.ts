import type {
  Customer as ServerCustomer, Invoice as ServerInvoice, Receipt as ServerReceipt,
  CashApplication as ServerCashApplication, CollectionRecord as ServerCollectionRecord,
  CreditLimit as ServerCreditLimit, Dispute as ServerDispute, Adjustment as ServerAdjustment,
  WriteOff as ServerWriteOff, CustomerStatement as ServerCustomerStatement,
  ARForecast as ServerARForecast, Recommendation as ServerRecommendation,
  ARAlert as ServerARAlert, ARKPI as ServerARKPI, ARAggregateMetrics,
  ARExecutiveSummary, AgingSummary, AgingReport, DSOReport, CEIReport,
} from "../../server/accounts-receivable/types";

export type Customer = ServerCustomer;
export type Invoice = ServerInvoice;
export type Receipt = ServerReceipt;
export type CashApplication = ServerCashApplication;
export type CollectionRecord = ServerCollectionRecord;
export type CreditLimit = ServerCreditLimit;
export type Dispute = ServerDispute;
export type Adjustment = ServerAdjustment;
export type WriteOff = ServerWriteOff;
export type CustomerStatement = ServerCustomerStatement;
export type ARForecast = ServerARForecast;
export type Recommendation = ServerRecommendation;
export type ARAlert = ServerARAlert;
export type ARKPI = ServerARKPI;

export interface ARExecutiveMetricsProps { metrics: ARExecutiveSummary; }
export interface ARKPIDashboardProps { kpis: ARKPI[]; }
export interface ARCustomerRegistryProps { customers: Customer[]; }
export interface ARInvoiceBoardProps { invoices: Invoice[]; onSelect?: (invoice: Invoice) => void; }
export interface ARCollectionsQueueProps { collections: CollectionRecord[]; }
export interface ARCashApplicationProps { applications: CashApplication[]; receipts: Receipt[]; invoices: Invoice[]; }
export interface ARDisputeCenterProps { disputes: Dispute[]; }
export interface ARForecastDashboardProps { forecasts: ARForecast[]; }
export interface ARRecommendationsPanelProps { recommendations: Recommendation[]; }
export interface ARAlertsPanelProps { alerts: ARAlert[]; }
export interface ARAgingReportProps { report: AgingReport; summary: AgingSummary; }
export interface ARDSOReportProps { report: DSOReport; }
export interface ARCEIReportProps { report: CEIReport; }
export interface ARCreditDashboardProps { creditLimits: CreditLimit[]; }
export interface ARWriteOffCenterProps { writeOffs: WriteOff[]; }
export interface ARStatementViewProps { statements: CustomerStatement[]; }
export interface ARAdjustmentListProps { adjustments: Adjustment[]; }
export interface ARTrendWidgetProps { label: string; value: number; previousValue: number; format?: "currency" | "percentage" | "number" | "days"; trend: "up" | "down" | "stable"; icon?: React.ReactNode; }

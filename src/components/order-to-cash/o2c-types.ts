import type { Customer, CustomerContact, SalesOrder, SalesOrderItem, Quotation, QuotationItem, Contract,
  Invoice, InvoiceItem, CashReceipt, CashApplication, ARRecord, CollectionCase, CreditProfile,
  RevenueSchedule, O2CKPI, O2CForecast, O2CAlert, O2CRecommendation,
  CustomerStatus, SalesOrderStatus, ARStatus, AgingBucket, CollectionStatus, BillingType } from "../../server/order-to-cash";

export interface O2COverviewMetrics {
  totalCustomers: number; activeCustomers: number; totalOrders: number; openOrders: number;
  totalInvoices: number; openInvoices: number; overdueInvoices: number; totalAR: number; overdueAR: number;
  dso: number; cashCollected: number; unappliedCash: number; collectionCases: number; revenueDeferred: number;
}

export type { Customer, CustomerContact, SalesOrder, SalesOrderItem, Quotation, QuotationItem, Contract,
  Invoice, InvoiceItem, CashReceipt, CashApplication, ARRecord, CollectionCase, CreditProfile,
  RevenueSchedule, O2CKPI, O2CForecast, O2CAlert, O2CRecommendation,
  CustomerStatus, SalesOrderStatus, ARStatus, AgingBucket, CollectionStatus, BillingType };

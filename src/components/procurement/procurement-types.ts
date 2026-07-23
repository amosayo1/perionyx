import type { Vendor, PurchaseRequest, PurchaseOrder, Contract, CatalogItem, Receipt, Invoice,
  MatchResult, ApprovalRequest, Payment, SpendAnalytic, ProcurementKPI, ProcurementForecast,
  ProcurementAlert, ProcurementRecommendation, VendorPerformance, PRItem, POItem, InvoiceItem,
  VendorStatus, POStatus, InvoiceStatus, ApprovalStatus, MatchStatus, ContractStatus } from "../../server/procurement/types";

export interface ProcurementOverviewMetrics {
  totalVendors: number; activeVendors: number; totalPOs: number; openPOs: number;
  totalInvoices: number; pendingInvoices: number; totalReceipts: number; pendingReceipts: number;
  totalContracts: number; activeContracts: number; totalSpend: number; pendingApprovals: number;
  matchExceptions: number; blockedVendors: number;
}

export type { Vendor, PurchaseRequest, PurchaseOrder, Contract, CatalogItem, Receipt, Invoice,
  MatchResult, ApprovalRequest, Payment, SpendAnalytic, ProcurementKPI, ProcurementForecast,
  ProcurementAlert, ProcurementRecommendation, VendorPerformance, PRItem, POItem, InvoiceItem,
  VendorStatus, POStatus, InvoiceStatus, ApprovalStatus, MatchStatus, ContractStatus };

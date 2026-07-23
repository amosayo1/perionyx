export type CustomerStatus = "active" | "inactive" | "blocked" | "pending" | "prospect";
export type CustomerRiskRating = "low" | "medium" | "high" | "critical";
export type CustomerGroup = "enterprise" | "mid-market" | "small-business" | "government" | "non-profit" | "partner";
export type SalesOrderStatus = "draft" | "submitted" | "approved" | "confirmed" | "partially-fulfilled" | "completed" | "cancelled" | "returned";
export type QuotationStatus = "draft" | "sent" | "accepted" | "expired" | "cancelled";
export type BillingType = "one-time" | "recurring" | "subscription" | "milestone" | "progress" | "manual" | "automatic";
export type ARStatus = "open" | "overdue" | "paid" | "disputed" | "written-off" | "partially-paid";
export type AgingBucket = "current" | "1-30" | "31-60" | "61-90" | "91-plus";
export type CollectionStatus = "active" | "resolved" | "escalated" | "promise-to-pay";
export type CreditDecision = "approved" | "denied" | "pending-review" | "reduced";
export type RevenueRecognitionMethod = "immediate" | "deferred" | "accrued" | "milestone" | "subscription" | "project";
export type RevenueRecognitionStatus = "scheduled" | "recognized" | "deferred" | "cancelled";
export type CashApplicationStatus = "applied" | "partial" | "unapplied" | "disputed";
export type CashApplicationMethod = "automatic" | "manual";
export type ContractType = "annual" | "monthly" | "multi-year" | "perpetual" | "usage-based";
export type FulfillmentStatus = "pending" | "in-progress" | "completed" | "partial" | "cancelled";
export type ShippingStatus = "pending" | "picked" | "packed" | "shipped" | "in-transit" | "delivered" | "returned";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";
export type ContractStatus = "draft" | "active" | "expired" | "terminated" | "renewed";
export type InvoiceStatus = "draft" | "submitted" | "approved" | "paid" | "disputed" | "cancelled" | "written-off";

export interface Customer {
  id: string; code: string; name: string; legalName: string; status: CustomerStatus; riskRating: CustomerRiskRating;
  group: CustomerGroup; taxId: string; taxCountry: string; currency: string; paymentTerms: string;
  billingAddress: string; shippingAddress: string; phone: string; email: string; website?: string;
  creditLimit: number; creditUtilization: number; creditAvailable: number; creditOnHold: boolean;
  totalRevenue: number; totalOrders: number; totalInvoices: number; avgPaymentDays: number;
  lifetimeValue: number; customerSince: Date; lastOrderDate?: Date; preferred: boolean; isBlocked: boolean;
  companyId: string; tags: string[]; createdAt: Date; updatedAt: Date;
}

export interface CustomerContact {
  id: string; customerId: string; firstName: string; lastName: string; email: string; phone: string;
  title: string; department: string; isPrimary: boolean; createdAt: Date; updatedAt: Date;
}

export interface Quotation {
  id: string; quoteNumber: string; customerId: string; customerName: string; status: QuotationStatus;
  items: QuotationItem[]; subtotal: number; discountPercent: number; discountAmount: number;
  taxAmount: number; totalAmount: number; currency: string; validUntil: Date;
  notes?: string; salesRep: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface QuotationItem {
  id: string; quotationId: string; lineNumber: number; description: string; productCode: string;
  quantity: number; unit: string; unitPrice: number; discountPercent: number; totalPrice: number;
}

export interface SalesOrder {
  id: string; orderNumber: string; customerId: string; customerName: string; customerCode: string;
  status: SalesOrderStatus; type: "standard" | "rush" | "backorder" | "replacement";
  quotationId?: string; contractId?: string; items: SalesOrderItem[];
  subtotal: number; discountPercent: number; discountAmount: number; taxAmount: number; totalAmount: number;
  currency: string; exchangeRate: number; paymentTerms: string; billingType: BillingType;
  requestedDeliveryDate: Date; promisedDeliveryDate?: Date; actualDeliveryDate?: Date;
  shippingMethod: string; shippingCost: number; trackingNumber?: string;
  fulfillmentStatus: FulfillmentStatus; fulfillmentPercent: number; invoiceStatus: "pending" | "invoiced" | "partial";
  salesRep: string; department: string; notes?: string; approvalStatus: ApprovalStatus;
  companyId: string; entityId?: string; createdAt: Date; updatedAt: Date;
}

export interface SalesOrderItem {
  id: string; orderId: string; lineNumber: number; description: string; productCode: string; productName: string;
  quantity: number; quantityFulfilled: number; quantityInvoiced: number; unit: string;
  unitPrice: number; discountPercent: number; totalPrice: number; taxRate: number; taxAmount: number;
  accountCode?: string; costCenter?: string; project?: string; notes?: string;
}

export interface Contract {
  id: string; contractNumber: string; customerId: string; customerName: string; type: ContractType; status: ContractStatus;
  startDate: Date; endDate: Date; renewalDate?: Date; autoRenew: boolean; value: number; currency: string;
  billingFrequency: string; billingType: BillingType; paymentTerms: string; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Invoice {
  id: string; invoiceNumber: string; customerId: string; customerName: string; customerCode: string;
  salesOrderId?: string; contractId?: string; status: InvoiceStatus;
  type: "standard" | "credit" | "debit" | "recurring" | "milestone";
  items: InvoiceItem[]; subtotal: number; discountAmount: number; taxAmount: number; totalAmount: number;
  amountDue: number; amountPaid: number; amountOutstanding: number; currency: string; exchangeRate: number;
  invoiceDate: Date; dueDate: Date; paidDate?: Date; paymentTerms: string; notes?: string; disputeReason?: string;
  arStatus: ARStatus; agingBucket: AgingBucket; daysOverdue: number;
  billingType: BillingType; revenueScheduleId?: string;
  companyId: string; entityId?: string; createdAt: Date; updatedAt: Date;
}

export interface InvoiceItem {
  id: string; invoiceId: string; lineNumber: number; description: string; productCode: string;
  quantity: number; unit: string; unitPrice: number; totalPrice: number; taxRate: number; taxAmount: number;
  salesOrderItemId?: string; accountCode?: string; costCenter?: string; project?: string;
}

export interface CashReceipt {
  id: string; receiptNumber: string; customerId: string; customerName: string; amount: number; currency: string;
  exchangeRate: number; receivedDate: Date; method: string; reference: string; bankAccount: string;
  status: CashApplicationStatus; applicationMethod: CashApplicationMethod;
  appliedAmount: number; unappliedAmount: number; invoiceIds: string[];
  notes?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CashApplication {
  id: string; receiptId: string; invoiceId: string; invoiceNumber: string; appliedAmount: number;
  currency: string; exchangeRate: number; appliedDate: Date; status: CashApplicationStatus;
  notes?: string; createdBy: string; createdAt: Date;
}

export interface ARRecord {
  id: string; customerId: string; customerName: string; invoiceId: string; invoiceNumber: string;
  totalAmount: number; amountDue: number; amountPaid: number; amountOutstanding: number;
  currency: string; invoiceDate: Date; dueDate: Date; daysOverdue: number; status: ARStatus;
  agingBucket: AgingBucket; dispute: boolean; disputeReason?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CollectionCase {
  id: string; customerId: string; customerName: string; invoiceId: string; invoiceNumber: string;
  amount: number; currency: string; status: CollectionStatus; assignee: string;
  action: "call" | "email" | "letter" | "visit" | "escalate" | "write-off";
  notes: string; promiseDate?: Date; promiseAmount?: number; contactName: string; contactEmail: string;
  escalationLevel: number; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CreditProfile {
  id: string; customerId: string; customerName: string; creditLimit: number; creditUtilization: number;
  creditAvailable: number; utilizationPercent: number; onHold: boolean; holdReason?: string;
  riskScore: number; riskRating: CustomerRiskRating; lastReviewDate: Date; reviewedBy?: string;
  decision: CreditDecision; decisionDate?: Date; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface RevenueSchedule {
  id: string; invoiceId?: string; salesOrderId?: string; customerId: string; customerName: string;
  method: RevenueRecognitionMethod; totalAmount: number; recognizedAmount: number; deferredAmount: number;
  status: RevenueRecognitionStatus; scheduledDate: Date; recognitionDate?: Date; periods: number;
  currentPeriod: number; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface O2CKPI {
  id: string; name: string; value: number; previousValue: number; target: number; unit: string;
  category: "revenue" | "collections" | "credit" | "efficiency" | "customer";
  trend: "up"|"down"|"stable"; status: "good"|"warning"|"critical";
  companyId: string; period: string; date: Date;
}

export interface O2CForecast {
  id: string; companyId: string; metric: "revenue"|"collections"|"invoices"|"dso"; period: string;
  currentValue: number; forecastValue: number; lowerBound: number; upperBound: number;
  confidence: number; trend: "increasing"|"decreasing"|"stable"; date: Date;
}

export interface O2CAlert {
  id: string; severity: "critical"|"warning"|"info"; type: string; title: string; message: string;
  companyId: string; actionRequired?: boolean; dismissed: boolean; createdAt: Date;
}

export interface O2CRecommendation {
  id: string; type: string; title: string; description: string; impact: string; confidence: number;
  companyId: string; implemented: boolean; createdAt: Date;
}

export interface PriceRecord {
  id: string; productCode: string; productName: string; unit: string; unitPrice: number;
  currency: string; customerId?: string; customerGroup?: CustomerGroup; minQuantity?: number;
  effectiveFrom: Date; effectiveTo?: Date; isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Fulfillment {
  id: string; orderId: string; orderNumber: string; customerId: string; customerName: string;
  status: FulfillmentStatus; items: SalesOrderItem[]; fulfillmentDate?: Date;
  notes?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Shipment {
  id: string; orderId: string; orderNumber: string; customerId: string; customerName: string;
  trackingNumber: string; carrier: string; status: ShippingStatus; items: SalesOrderItem[];
  shipDate?: Date; deliveryDate?: Date; shippingCost: number; shippingAddress: string;
  notes?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface O2CForecastRecord {
  id: string; companyId: string; metric: "revenue"|"collections"|"invoices"|"dso"|"orders"|"cash-receipts";
  period: string; currentValue: number; forecastValue: number; lowerBound: number; upperBound: number;
  confidence: number; trend: "increasing"|"decreasing"|"stable"; date: Date;
}

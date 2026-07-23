export type VendorStatus = "active" | "inactive" | "blocked" | "pending" | "suspended";
export type VendorRiskLevel = "low" | "medium" | "high" | "critical";
export type VendorCategory = "supplier" | "contractor" | "consultant" | "service-provider" | "distributor" | "manufacturer";
export type PRStatus = "draft" | "submitted" | "approved" | "rejected" | "cancelled" | "converted";
export type POStatus = "draft" | "approved" | "sent" | "acknowledged" | "partially-received" | "fully-received" | "closed" | "cancelled";
export type POType = "standard" | "blanket" | "service" | "capital" | "contract";
export type ReceiptStatus = "pending" | "partial" | "complete" | "cancelled";
export type ReceiptType = "goods" | "service";
export type InvoiceStatus = "draft" | "submitted" | "matched" | "approved" | "paid" | "disputed" | "cancelled";
export type MatchStatus = "pending" | "matched" | "exception" | "resolved";
export type MatchType = "2-way" | "3-way";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "delegated";
export type ContractStatus = "draft" | "active" | "expired" | "terminated" | "renewed";
export type PaymentStatus = "pending" | "scheduled" | "processing" | "paid" | "failed" | "cancelled";
export type PaymentMethod = "wire" | "ach" | "check" | "credit-card" | "virtual-card" | "ach-same-day";

export interface Vendor {
  id: string; code: string; name: string; legalName: string; status: VendorStatus; riskLevel: VendorRiskLevel;
  category: VendorCategory; taxId: string; taxCountry: string; currency: string;
  billingAddress: string; shippingAddress: string; paymentTerms: string; paymentMethod: PaymentMethod;
  creditLimit: number; currencyCreditLimit: number; bankAccount: string; bankName: string; bankCountry: string;
  preferred: boolean; preferredRank?: number; isBlocked: boolean; blockReason?: string;
  rating: number; totalSpend: number; totalOrders: number; avgPaymentDays: number;
  onboardingDate: Date; lastOrderDate?: Date; contactName: string; contactEmail: string; contactPhone: string;
  companyId: string; tags: string[]; createdAt: Date; updatedAt: Date;
}

export interface VendorPerformance {
  id: string; vendorId: string; period: string; onTimeDelivery: number; qualityScore: number;
  responseTime: number; invoiceAccuracy: number; returnRate: number; overallScore: number;
  totalOrders: number; totalAmount: number; createdAt: Date;
}

export interface VendorDocument {
  id: string; vendorId: string; type: string; name: string; reference: string; expiryDate?: Date;
  status: "valid" | "expired" | "pending"; fileUrl?: string; createdAt: Date; updatedAt: Date;
}

export interface PurchaseRequest {
  id: string; prNumber: string; title: string; description: string; status: PRStatus;
  department: string; requestedBy: string; requesterEmail: string; approverId?: string;
  items: PRItem[]; totalAmount: number; currency: string; budgetCode?: string; budgetValidated: boolean;
  urgency: "low" | "medium" | "high" | "critical"; notes?: string; rejectionReason?: string;
  convertedToPOId?: string; companyId: string; entityId?: string; createdAt: Date; updatedAt: Date;
}

export interface PRItem {
  id: string; prId: string; lineNumber: number; description: string; category: string;
  quantity: number; unit: string; unitPrice: number; totalPrice: number;
  currency: string; needByDate?: Date; vendorId?: string; accountCode?: string;
  costCenter?: string; project?: string; notes?: string;
}

export interface PurchaseOrder {
  id: string; poNumber: string; type: POType; status: POStatus; title: string; description: string;
  vendorId: string; vendorName: string; vendorCode: string; prId?: string; contractId?: string;
  items: POItem[]; totalAmount: number; currency: string; exchangeRate: number;
  paymentTerms: string; shippingTerms: string; expectedDeliveryDate: Date;
  department: string; budgetCode: string; approvedBy?: string; approvedAt?: Date;
  receivedAmount: number; receivedPercent: number; billedAmount: number;
  companyId: string; entityId?: string; tags: string[]; createdAt: Date; updatedAt: Date;
}

export interface POItem {
  id: string; poId: string; lineNumber: number; description: string; category: string;
  quantity: number; unit: string; unitPrice: number; totalPrice: number; currency: string;
  receivedQuantity: number; receivedValue: number; billedQuantity: number; billedValue: number;
  expectedDeliveryDate?: Date; accountCode?: string; costCenter?: string; project?: string; notes?: string;
}

export interface Contract {
  id: string; contractNumber: string; title: string; description: string; status: ContractStatus;
  vendorId: string; vendorName: string; type: string; value: number; currency: string;
  startDate: Date; endDate: Date; renewalDate?: Date; autoRenew: boolean;
  paymentTerms: string; department: string; budgetCode: string;
  attachments: number; notes?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CatalogItem {
  id: string; name: string; description: string; category: string; vendorId: string;
  vendorName: string; unitPrice: number; currency: string; unit: string;
  minimumOrder: number; leadTime: number; isPreferred: boolean; isActive: boolean;
  companyId: string; tags: string[]; createdAt: Date; updatedAt: Date;
}

export interface Receipt {
  id: string; receiptNumber: string; type: ReceiptType; poId: string; poNumber: string;
  vendorId: string; vendorName: string; items: ReceiptItem[]; receivedDate: Date;
  receivedBy: string; status: ReceiptStatus; notes?: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ReceiptItem {
  id: string; receiptId: string; poItemId: string; lineNumber: number; description: string;
  quantityOrdered: number; quantityReceived: number; quantityAccepted: number; quantityRejected: number;
  unitPrice: number; totalPrice: number; rejectReason?: string;
}

export interface Invoice {
  id: string; invoiceNumber: string; vendorId: string; vendorName: string; vendorCode: string;
  poId?: string; poNumber?: string; receiptId?: string; status: InvoiceStatus;
  items: InvoiceItem[]; invoiceDate: Date; dueDate: Date; receivedDate: Date;
  totalAmount: number; taxAmount: number; totalWithTax: number; currency: string; exchangeRate: number;
  paymentTerms: string; notes?: string; disputeReason?: string; paidDate?: Date;
  paymentId?: string; matchStatus: MatchStatus; matchType: MatchType; matchScore: number;
  companyId: string; entityId?: string; createdAt: Date; updatedAt: Date;
}

export interface InvoiceItem {
  id: string; invoiceId: string; lineNumber: number; description: string;
  quantity: number; unit: string; unitPrice: number; totalPrice: number; taxRate: number; taxAmount: number;
  poItemId?: string; receiptItemId?: string; accountCode?: string; costCenter?: string; project?: string;
}

export interface MatchResult {
  id: string; invoiceId: string; invoiceItemId: string; poItemId: string; receiptItemId?: string;
  matchType: MatchType; status: MatchStatus; quantityMatch: boolean; priceMatch: boolean;
  quantityTolerance: number; priceTolerance: number; quantityVariance: number; priceVariance: number;
  discrepancyNotes?: string; resolvedBy?: string; resolvedAt?: Date; createdAt: Date;
}

export interface ApprovalRequest {
  id: string; entityType: "pr" | "po" | "invoice" | "contract" | "payment"; entityId: string;
  entityNumber: string; title: string; amount: number; currency: string; requesterId: string;
  currentApproverId: string; originalApproverId: string; status: ApprovalStatus;
  level: number; maxLevel: number; isDelegated: boolean; isEscalated: boolean;
  comments?: string; decidedAt?: Date; escalationMinutes: number; dueDate: Date;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Payment {
  id: string; paymentNumber: string; vendorId: string; vendorName: string;
  invoiceIds: string[]; totalAmount: number; currency: string; exchangeRate: number;
  method: PaymentMethod; status: PaymentStatus; scheduledDate: Date; paidDate?: Date;
  bankAccount: string; bankName: string; reference?: string; notes?: string;
  approvedBy?: string; approvedAt?: Date; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface SpendAnalytic {
  id: string; dimension: string; dimensionValue: string; period: string; totalSpend: number;
  totalOrders: number; totalInvoices: number; avgOrderValue: number; savingsAmount: number;
  savingsPercent: number; budgetConsumed: number; budgetRemaining: number; budgetPercent: number;
  currency: string; companyId: string; createdAt: Date;
}

export interface ProcurementKPI {
  id: string; name: string; value: number; previousValue: number; target: number; unit: string;
  category: "spend" | "vendor" | "efficiency" | "savings" | "compliance";
  trend: "up" | "down" | "stable"; status: "good" | "warning" | "critical";
  companyId: string; period: string; date: Date;
}

export interface ProcurementForecast {
  id: string; companyId: string; metric: "spend" | "savings" | "orders" | "invoices";
  period: string; currentValue: number; forecastValue: number; lowerBound: number; upperBound: number;
  confidence: number; trend: "increasing" | "decreasing" | "stable"; date: Date;
}

export interface ProcurementAlert {
  id: string; severity: "critical" | "warning" | "info"; type: string; title: string; message: string;
  companyId: string; actionRequired?: boolean; dismissed: boolean; createdAt: Date;
}

export interface ProcurementRecommendation {
  id: string; type: string; title: string; description: string; impact: string; confidence: number;
  companyId: string; implemented: boolean; createdAt: Date;
}

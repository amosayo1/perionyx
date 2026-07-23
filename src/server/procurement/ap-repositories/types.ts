/**
 * Phase 21A.2 — AP Domain Types
 *
 * Domain types for Accounts Payable aggregates. These map to Prisma models
 * (ProcurementVendor, ProcurementVendorInvoice, etc.) and are used by
 * repository interfaces, service layers, and command handlers.
 *
 * Financial precision: All monetary fields are `number` at the domain boundary
 * (for JS ergonomics), but ALL calculations MUST use `financial-precision.ts`
 * helpers (`toDecimal`, `sumDecimals`, `multiplyDecimals`, etc.).
 * Zero native `number` arithmetic on money — convert to Decimal first.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Vendor Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type VendorStatus = "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
export type VendorRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type VendorCategory = "SUPPLIER" | "CONTRACTOR" | "CONSULTANT" | "SERVICE_PROVIDER" | "DISTRIBUTOR" | "MANUFACTURER";
export type VendorPreferredPaymentMethod = "ACH" | "WIRE" | "CHECK" | "EFT" | "VIRTUAL_CARD";
export type VendorBankAccountType = "CHECKING" | "SAVINGS";
export type VendorDocumentStatus = "VALID" | "EXPIRED" | "PENDING";

export interface VendorBankDetail {
  id: string;
  companyId: string;
  vendorId: string;
  bankName: string;
  bankCountry: string;
  routingNumber: string;
  accountNumber: string;
  accountHolderName: string;
  accountType: VendorBankAccountType;
  isPrimary: boolean;
  isActive: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface VendorPerformance {
  id: string;
  companyId: string;
  vendorId: string;
  period: string;
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: number;
  invoiceAccuracy: number;
  returnRate: number;
  overallScore: number;
  totalOrders: number;
  totalAmount: number;
  createdAt: string;
}

export interface VendorDocument {
  id: string;
  companyId: string;
  vendorId: string;
  type: string;
  name: string;
  reference: string | null;
  expiryDate: string | null;
  status: VendorDocumentStatus;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Vendor {
  id: string;
  companyId: string;
  vendorCode: string;
  name: string;
  legalName: string;
  status: VendorStatus;
  riskLevel: VendorRiskLevel;
  riskScore: number;
  category: VendorCategory;
  taxId: string;
  taxCountry: string;
  currency: string;
  billingAddress: string | null;
  shippingAddress: string | null;
  paymentTerms: string;
  preferredPaymentMethod: VendorPreferredPaymentMethod;
  creditLimit: number;
  bankAccountId: string | null;
  preferred: boolean;
  preferredRank: number | null;
  isBlocked: boolean;
  blockReason: string | null;
  rating: number;
  totalSpend: number;
  totalOrders: number;
  avgPaymentDays: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  tags: string[];
  onboardingDate: string;
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  // Child entities (loaded on demand)
  bankDetails?: VendorBankDetail[];
  performances?: VendorPerformance[];
  documents?: VendorDocument[];
}

// ──────────────────────────────────────────────────────────────────────────────
// PO & GRN Reference Value Objects (embedded in invoice context)
// ──────────────────────────────────────────────────────────────────────────────

export type POReferenceStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "PARTIALLY_RECEIVED" | "FULLY_RECEIVED" | "CANCELLED";
export type POReferenceLineItemStatus = "PENDING" | "PARTIALLY_RECEIVED" | "FULLY_RECEIVED" | "CLOSED";
export type GRNReferenceStatus = "RECEIVED" | "INSPECTED" | "ACCEPTED" | "REJECTED" | "PARTIAL";
export type GRNReferenceLineItemCondition = "GOOD" | "DAMAGED" | "DEFECTIVE" | "MIXED";

export interface POReferenceLineItem {
  id: string;
  companyId: string;
  poReferenceId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  glAccountId: string | null;
  costCenterId: string | null;
  receivedQuantity: number;
  invoicedQuantity: number;
  status: POReferenceLineItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface POReference {
  id: string;
  companyId: string;
  poNumber: string;
  poId: string;
  vendorId: string;
  status: POReferenceStatus;
  orderDate: string;
  expectedDeliveryDate: string | null;
  currency: string;
  totalAmount: number;
  receivedAmount: number;
  taxAmount: number;
  shippingAmount: number;
  paymentTerms: string | null;
  requestedBy: string | null;
  approvedBy: string | null;
  approvalDate: string | null;
  syncedAt: string;
  lineItems?: POReferenceLineItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface GRNReferenceLineItem {
  id: string;
  companyId: string;
  grnReferenceId: string;
  poReferenceLineItemId: string;
  lineNumber: number;
  description: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
  condition: GRNReferenceLineItemCondition;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface GRNReference {
  id: string;
  companyId: string;
  grnNumber: string;
  grnId: string;
  poReferenceId: string;
  vendorId: string;
  receiptDate: string;
  status: GRNReferenceStatus;
  receivedBy: string;
  warehouseLocation: string | null;
  totalValue: number;
  totalTax: number;
  inspectionNotes: string | null;
  syncedAt: string;
  lineItems?: GRNReferenceLineItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// VendorInvoice Aggregate (CORE)
// ──────────────────────────────────────────────────────────────────────────────

export type VendorInvoiceStatus =
  | "DRAFT" | "CAPTURED" | "VALIDATING" | "VALIDATED"
  | "THREE_WAY_MATCHING" | "MATCHED" | "MATCH_FAILED" | "EXCEPTION"
  | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  | "PARTIALLY_PAID" | "PAID" | "VOIDED";

export type VendorInvoiceSource = "EMAIL" | "SCAN" | "EDI" | "PORTAL" | "MANUAL" | "API";
export type InvoiceLineItemTaxType = "VAT" | "GST" | "SALES_TAX" | "WITHHOLDING" | "EXEMPT";
export type InvoiceLineItemMatchStatus = "MATCHED" | "VARIANCE" | "UNMATCHED";
export type InvoiceAttachmentCategory = "INVOICE_COPY" | "SUPPORTING_DOC" | "CONTRACT" | "EMAIL_THREAD" | "RECEIPT" | "DELIVERY_NOTE";
export type ThreeWayMatchResult = "FULL_MATCH" | "PARTIAL_MATCH" | "PRICE_VARIANCE" | "QTY_VARIANCE" | "NO_MATCH";

export interface InvoiceLineItem {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure: string | null;
  unitPrice: number;
  lineTotal: number;
  discountPercent: number;
  discountAmount: number;
  netLineTotal: number;
  taxRate: number;
  taxAmount: number;
  taxJurisdiction: string | null;
  taxType: InvoiceLineItemTaxType | null;
  glAccountId: string | null;
  costCenterId: string | null;
  departmentId: string | null;
  projectId: string | null;
  poReferenceLineItemId: string | null;
  grnReferenceLineItemId: string | null;
  matchStatus: InvoiceLineItemMatchStatus | null;
  matchVariance: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface InvoiceAttachment {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  category: InvoiceAttachmentCategory;
  ocrExtracted: boolean;
  createdAt: string;
  createdBy: string;
}

export interface VendorInvoice {
  id: string;
  companyId: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  receivedDate: string;
  status: VendorInvoiceStatus;
  previousStatus: VendorInvoiceStatus | null;
  statusChangedAt: string | null;
  // PO & GRN References
  poReferenceId: string | null;
  grnReferenceId: string | null;
  // Currency & Exchange
  currency: string;
  exchangeRate: number;
  baseCurrency: string;
  // Financial (Decimal(38,12) in DB)
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  totalWithTax: number;
  amountPaid: number;
  balanceDue: number;
  creditApplied: number;
  netBalance: number;
  // Payment Configuration
  paymentTerms: string | null;
  paymentMethod: VendorPreferredPaymentMethod | null;
  // GL Coding
  glAccountId: string | null;
  costCenterId: string | null;
  departmentId: string | null;
  projectId: string | null;
  // Description & Notes
  description: string | null;
  vendorMemo: string | null;
  internalMemo: string | null;
  // OCR & AI
  ocrConfidence: number;
  ocrRawText: string | null;
  // Duplicate Detection
  isDuplicateSuspicion: boolean;
  duplicateConfidence: number;
  duplicateOfInvoiceId: string | null;
  // Three-Way Match
  matchResult: ThreeWayMatchResult | null;
  varianceAmount: number;
  varianceThreshold: number;
  // Approval
  approvalRequired: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  // Payment Assignment
  paymentBatchId: string | null;
  paymentProposalId: string | null;
  paymentDate: string | null;
  paymentReference: string | null;
  checkNumber: string | null;
  // GL Posting
  accrualPosted: boolean;
  accrualReversed: boolean;
  glPosted: boolean;
  glPostedAt: string | null;
  periodId: string | null;
  // Idempotency
  idempotencyKey: string | null;
  // Source
  source: VendorInvoiceSource;
  // Child entities (loaded on demand)
  lineItems?: InvoiceLineItem[];
  attachments?: InvoiceAttachment[];
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// ThreeWayMatch Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type MatchLineItemStatus = "EXACT_MATCH" | "PRICE_VARIANCE" | "QTY_VARIANCE" | "NO_MATCH";

export interface MatchLineItem {
  id: string;
  companyId: string;
  threeWayMatchId: string;
  invoiceLineItemId: string;
  poReferenceLineItemId: string | null;
  grnReferenceLineItemId: string | null;
  matchStatus: MatchLineItemStatus;
  invoiceQuantity: number;
  invoiceUnitPrice: number;
  poQuantity: number | null;
  poUnitPrice: number | null;
  grnQuantity: number | null;
  priceVariance: number;
  quantityVariance: number;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ThreeWayMatch {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  poReferenceId: string;
  grnReferenceId: string;
  matchResult: ThreeWayMatchResult;
  overallConfidence: number;
  priceVarianceTotal: number;
  quantityVarianceTotal: number;
  totalVariance: number;
  variancePercent: number;
  autoApproved: boolean;
  approvalThreshold: number;
  matchedAt: string;
  matchedBy: string;
  lineItems?: MatchLineItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// InvoiceException Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type InvoiceExceptionType =
  | "PRICE_VARIANCE" | "QTY_VARIANCE" | "NO_PO" | "DUPLICATE"
  | "MISSING_GRN" | "GL_CODING_REQUIRED" | "APPROVAL_REQUIRED"
  | "TAX_MISMATCH" | "CREDIT_NOTE_REQUIRED";

export type InvoiceExceptionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type InvoiceExceptionStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "WAIVED" | "ESCALATED";

export interface InvoiceException {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  exceptionType: InvoiceExceptionType;
  severity: InvoiceExceptionSeverity;
  description: string;
  varianceAmount: number;
  relatedEntityId: string | null;
  status: InvoiceExceptionStatus;
  assignedTo: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  escalatedTo: string | null;
  escalatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// ApprovalChain Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type ApprovalRecordStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED" | "SKIPPED";
export type ApprovalRecordDecision = "APPROVE" | "REJECT" | "REQUEST_INFO" | "DELEGATE";

export interface ApprovalRecord {
  id: string;
  companyId: string;
  vendorInvoiceId: string;
  approvalLevel: number;
  approvalLevelName: string;
  requiredRole: string;
  requiredThreshold: number;
  status: ApprovalRecordStatus;
  decision: ApprovalRecordDecision | null;
  decisionAt: string | null;
  decisionBy: string | null;
  decisionComment: string | null;
  delegatedTo: string | null;
  delegatedAt: string | null;
  delegationReason: string | null;
  escalated: boolean;
  escalatedAt: string | null;
  escalationReason: string | null;
  timeLimit: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface ApprovalLevel {
  id: string;
  companyId: string;
  levelNumber: number;
  levelName: string;
  minAmount: number;
  maxAmount: number | null;
  requiredRoles: string[];
  requiredDepartment: string | null;
  canDelegate: boolean;
  canEscalate: boolean;
  timeLimitHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// PaymentProposal Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type PaymentProposalStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED" | "EXECUTED" | "CANCELLED";
export type PaymentProposalItemSelection = "AUTO" | "MANUAL" | "DISCOUNT_OPTIMIZED";

export interface PaymentProposalItem {
  id: string;
  companyId: string;
  paymentProposalId: string;
  vendorInvoiceId: string;
  vendorId: string;
  amount: number;
  discountTaken: number;
  creditApplied: number;
  netPayment: number;
  paymentPriority: number;
  selectedBy: PaymentProposalItemSelection;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PaymentProposal {
  id: string;
  companyId: string;
  proposalNumber: string;
  proposalDate: string;
  paymentDate: string;
  currency: string;
  totalAmount: number;
  totalInvoices: number;
  totalVendors: number;
  paymentMethod: VendorPreferredPaymentMethod;
  prioritizeDiscounts: boolean;
  includePartialPayments: boolean;
  status: PaymentProposalStatus;
  submittedBy: string | null;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  items?: PaymentProposalItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// PaymentBatch Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type PaymentBatchStatus = "PENDING" | "GENERATING" | "READY" | "SUBMITTED" | "COMPLETED" | "FAILED" | "CANCELLED";
export type PaymentRecordStatus = "PROCESSED" | "CLEARED" | "VOIDED" | "FAILED" | "REVERSED";

export interface PaymentRecord {
  id: string;
  companyId: string;
  paymentNumber: string;
  paymentBatchId: string;
  vendorInvoiceId: string;
  vendorId: string;
  paymentDate: string;
  amount: number;
  discountTaken: number;
  creditApplied: number;
  netPayment: number;
  currency: string;
  exchangeRate: number;
  baseCurrencyAmount: number;
  paymentMethod: VendorPreferredPaymentMethod;
  bankAccountId: string;
  transactionReference: string | null;
  checkNumber: string | null;
  status: PaymentRecordStatus;
  glPosted: boolean;
  glPostedAt: string | null;
  glReversalPosted: boolean;
  idempotencyKey: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface PaymentBatch {
  id: string;
  companyId: string;
  batchNumber: string;
  paymentProposalId: string;
  paymentMethod: VendorPreferredPaymentMethod;
  bankAccountId: string;
  totalPayments: number;
  totalAmount: number;
  totalFees: number;
  netDisbursement: number;
  fileUrl: string | null;
  fileName: string | null;
  status: PaymentBatchStatus;
  submittedAt: string | null;
  completedAt: string | null;
  confirmedBy: string | null;
  paymentRecords?: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// VendorCredit Aggregate
// ──────────────────────────────────────────────────────────────────────────────

export type VendorCreditStatus = "ISSUED" | "PARTIALLY_APPLIED" | "FULLY_APPLIED" | "EXPIRED";

export interface VendorCredit {
  id: string;
  companyId: string;
  vendorId: string;
  creditNumber: string;
  creditDate: string;
  creditAmount: number;
  appliedAmount: number;
  currency: string;
  status: VendorCreditStatus;
  appliedToInvoiceId: string | null;
  expiryDate: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// VendorStatement & Reconciliation
// ──────────────────────────────────────────────────────────────────────────────

export type VendorStatementStatus = "RECEIVED" | "PARSING" | "PARSED" | "RECONCILING" | "RECONCILED" | "EXCEPTION";
export type VendorStatementLineTransactionType = "INVOICE" | "PAYMENT" | "CREDIT" | "ADJUSTMENT" | "FEE";
export type VendorStatementLineMatchStatus = "UNMATCHED" | "MATCHED" | "PARTIAL" | "EXCEPTION";
export type ReconciliationResultStatus = "IN_PROGRESS" | "COMPLETED" | "EXCEPTION" | "ADJUSTED";

export interface VendorStatementLine {
  id: string;
  companyId: string;
  vendorStatementId: string;
  lineNumber: number;
  transactionDate: string;
  reference: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  transactionType: VendorStatementLineTransactionType;
  matchStatus: VendorStatementLineMatchStatus;
  matchedInvoiceId: string | null;
  matchedPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface VendorStatement {
  id: string;
  companyId: string;
  vendorId: string;
  statementNumber: string;
  statementDate: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  totalInvoices: number;
  totalPayments: number;
  totalCredits: number;
  closingBalance: number;
  currency: string;
  status: VendorStatementStatus;
  fileUrl: string | null;
  lines?: VendorStatementLine[];
  reconciliationResult?: ReconciliationResult;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface ReconciliationResult {
  id: string;
  companyId: string;
  vendorStatementId: string;
  vendorId: string;
  reconciliationDate: string;
  apBalance: number;
  vendorBalance: number;
  balanceVariance: number;
  totalLines: number;
  matchedLines: number;
  unmatchedLines: number;
  matchRate: number;
  status: ReconciliationResultStatus;
  adjustmentAmount: number;
  adjustmentReason: string | null;
  adjustedBy: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// AP Audit Record (Append-Only)
// ──────────────────────────────────────────────────────────────────────────────

export type APAuditAction =
  | "CREATED" | "UPDATED" | "STATUS_CHANGED" | "APPROVED" | "REJECTED"
  | "VOIDED" | "PAID" | "EXCEPTION" | "RESOLVED" | "DELEGATED"
  | "ESCALATED" | "CONFIG_CHANGED";

export interface APAuditRecord {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  action: APAuditAction;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  amount: number | null;
  description: string;
  reason: string | null;
  userId: string;
  userRole: string;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Query Filters
// ──────────────────────────────────────────────────────────────────────────────

export interface VendorQueryFilter {
  companyId: string;
  status?: VendorStatus;
  category?: VendorCategory;
  currency?: string;
  preferred?: boolean;
  isBlocked?: boolean;
  search?: string;
}

export interface InvoiceQueryFilter {
  companyId: string;
  vendorId?: string;
  status?: VendorInvoiceStatus | VendorInvoiceStatus[];
  invoiceDateFrom?: string;
  invoiceDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  currency?: string;
  poReferenceId?: string;
  search?: string;
}

export interface MatchQueryFilter {
  companyId: string;
  vendorInvoiceId?: string;
  matchResult?: ThreeWayMatchResult;
}

export interface ExceptionQueryFilter {
  companyId: string;
  vendorInvoiceId?: string;
  status?: InvoiceExceptionStatus;
  severity?: InvoiceExceptionSeverity;
  exceptionType?: InvoiceExceptionType;
  assignedTo?: string;
}

export interface ApprovalQueryFilter {
  companyId: string;
  vendorInvoiceId?: string;
  status?: ApprovalRecordStatus;
  decisionBy?: string;
}

export interface PaymentProposalQueryFilter {
  companyId: string;
  status?: PaymentProposalStatus;
  paymentDateFrom?: string;
  paymentDateTo?: string;
}

export interface PaymentBatchQueryFilter {
  companyId: string;
  status?: PaymentBatchStatus;
  paymentMethod?: VendorPreferredPaymentMethod;
}

export interface CreditQueryFilter {
  companyId: string;
  vendorId?: string;
  status?: VendorCreditStatus;
  invoiceId?: string;
}

export interface ReconciliationQueryFilter {
  companyId: string;
  vendorId?: string;
  status?: ReconciliationResultStatus;
  vendorStatementId?: string;
}

export interface AuditQueryFilter {
  companyId: string;
  entityType?: string;
  entityId?: string;
  action?: APAuditAction;
  userId?: string;
  correlationId?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

import { z } from "zod";

/* ── Vendor ─────────────────────────────────────────────────────────────── */

export const vendorListQuerySchema = z.object({
  status: z.enum(["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "DEACTIVATED"]).optional(),
  category: z.enum(["SUPPLIER", "CONTRACTOR", "CONSULTANT", "SERVICE_PROVIDER", "DISTRIBUTOR", "MANUFACTURER"]).optional(),
  currency: z.string().length(3).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createVendorSchema = z.object({
  name: z.string().min(2).max(200),
  legalName: z.string().max(200).optional(),
  vendorCode: z.string().min(1).max(50),
  taxId: z.string().min(1).max(50),
  taxCountry: z.string().length(2).max(3),
  category: z.enum(["SUPPLIER", "CONTRACTOR", "CONSULTANT", "SERVICE_PROVIDER", "DISTRIBUTOR", "MANUFACTURER"]),
  currency: z.string().length(3).optional().default("USD"),
  billingAddress: z.string().max(500).optional(),
  shippingAddress: z.string().max(500).optional(),
  paymentTerms: z.string().max(30).optional(),
  creditLimit: z.number().min(0).optional(),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).optional(),
});

export const updateVendorSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  legalName: z.string().max(200).optional(),
  category: z.enum(["SUPPLIER", "CONTRACTOR", "CONSULTANT", "SERVICE_PROVIDER", "DISTRIBUTOR", "MANUFACTURER"]).optional(),
  currency: z.string().length(3).optional(),
  billingAddress: z.string().max(500).optional(),
  shippingAddress: z.string().max(500).optional(),
  paymentTerms: z.string().max(30).optional(),
  creditLimit: z.number().min(0).optional(),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).optional(),
}).refine((v) => Object.keys(v).length > 0, "At least one field must be provided");

export const vendorStateTransitionSchema = z.object({
  reason: z.string().min(10).max(1000).optional(),
});

export const updateVendorBankDetailsSchema = z.object({
  bankAccountNumber: z.string().regex(/^\d{4,17}$/, "Account number must be 4-17 digits"),
  bankRoutingNumber: z.string().regex(/^\d{9}$/, "Routing number must be 9 digits"),
  bankName: z.string().min(1).max(200),
  reason: z.string().min(10).max(1000),
});

/* ── Invoice ────────────────────────────────────────────────────────────── */

const invoiceLineItemInputSchema = z.object({
  lineNumber: z.number().int().min(1),
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unitOfMeasure: z.string().max(30).optional(),
  unitPrice: z.number().positive(),
  taxRate: z.number().min(0).max(100).optional(),
  glAccountId: z.string().optional(),
});

export const invoiceListQuerySchema = z.object({
  vendorId: z.string().uuid().optional(),
  status: z.string().optional(),
  currency: z.string().length(3).optional(),
  invoiceDateFrom: z.string().optional(),
  invoiceDateTo: z.string().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const receiveInvoiceSchema = z.object({
  vendorId: z.string().uuid(),
  invoiceNumber: z.string().min(1).max(100),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  currency: z.string().length(3).optional(),
  subtotal: z.number().positive(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
  source: z.enum(["EMAIL", "SCAN", "EDI", "PORTAL", "MANUAL", "API"]).optional(),
  lineItems: z.array(invoiceLineItemInputSchema).min(1),
});

export const updateInvoiceSchema = z.object({
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().max(1000).optional(),
  lineItems: z.array(invoiceLineItemInputSchema).optional(),
}).refine((v) => Object.keys(v).length > 0, "At least one field must be provided");

export const voidInvoiceSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const runThreeWayMatchSchema = z.object({}).optional();

export const overrideMatchSchema = z.object({
  matchId: z.string().uuid(),
  reason: z.string().min(20).max(1000),
});

export const approveInvoiceSchema = z.object({}).optional();

export const rejectInvoiceSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const escalateInvoiceSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const scheduleInvoiceForPaymentSchema = z.object({}).optional();

export const blockInvoiceSchema = z.object({
  reason: z.string().min(10).max(1000),
  blockType: z.string().min(1).max(50),
});

export const unblockInvoiceSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const disputeInvoiceSchema = z.object({
  disputeReason: z.string().min(10).max(1000),
});

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(1).max(100),
  resolutionNotes: z.string().min(20).max(2000),
});

/* ── Exception ──────────────────────────────────────────────────────────── */

export const exceptionListQuerySchema = z.object({
  type: z.enum(["PRICING_VARIANCE", "QUANTITY_VARIANCE", "DUPLICATE", "TAX_MISMATCH", "MISSING_PO", "MISSING_GRN", "BUDGET_EXCEEDED", "POLICY_VIOLATION"]).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  vendorId: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
  slaStatus: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createExceptionSchema = z.object({
  invoiceId: z.string().uuid(),
  exceptionType: z.enum(["PRICING_VARIANCE", "QUANTITY_VARIANCE", "DUPLICATE", "TAX_MISMATCH", "MISSING_PO", "MISSING_GRN", "BUDGET_EXCEEDED", "POLICY_VIOLATION"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().min(1).max(2000),
  varianceAmount: z.number().optional(),
});

export const assignExceptionSchema = z.object({
  exceptionId: z.string().uuid(),
  assignedTo: z.string().min(1),
});

export const resolveExceptionSchema = z.object({
  exceptionId: z.string().uuid(),
  resolution: z.string().min(1).max(500),
  resolutionNotes: z.string().min(1).max(2000),
  resolutionAmount: z.number().optional(),
});

export const escalateExceptionSchema = z.object({
  exceptionId: z.string().uuid(),
  reason: z.string().min(1).max(1000),
});

export const bulkResolveExceptionsSchema = z.object({
  exceptionIds: z.array(z.string().uuid()).min(1),
  resolution: z.string().min(1).max(500),
  resolutionNotes: z.string().min(1).max(2000),
});

/* ── Approval ───────────────────────────────────────────────────────────── */

export const approvalQueueQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const decideApprovalSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  comments: z.string().max(2000).optional(),
});

export const delegateApprovalSchema = z.object({
  delegatedTo: z.string().min(1),
  reason: z.string().min(1).max(1000),
});

export const escalateApprovalApprovalSchema = z.object({
  reason: z.string().min(1).max(1000),
});

export const recallApprovalSchema = z.object({
  reason: z.string().min(1).max(1000),
});

/* ── Payment ────────────────────────────────────────────────────────────── */

export const generatePaymentProposalSchema = z.object({
  proposedPaymentDate: z.string().datetime(),
  vendorIds: z.array(z.string().uuid()).optional(),
  maxAmount: z.number().min(0).optional(),
  items: z.array(z.object({
    invoiceId: z.string(),
    action: z.enum(["INCLUDE", "EXCLUDE"]),
  })).optional(),
});

export const reviewPaymentProposalSchema = z.object({
  notes: z.string().max(2000).optional(),
});

export const approvePaymentProposalSchema = z.object({
  comments: z.string().max(2000).optional(),
});

export const rejectPaymentProposalSchema = z.object({
  reason: z.string().min(1).max(1000),
});

export const createPaymentBatchSchema = z.object({
  proposalId: z.string().min(1),
});

export const executePaymentSchema = z.object({
  paymentId: z.string().min(1),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1),
  bankReference: z.string().min(1).max(200),
  confirmationNumber: z.string().max(100).optional(),
});

export const reversePaymentSchema = z.object({
  reason: z.string().min(1).max(1000),
});

export const cancelPaymentSchema = z.object({
  reason: z.string().min(1).max(1000),
});

/* ── Reconciliation ─────────────────────────────────────────────────────── */

export const reconciliationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const statementLineSchema = z.object({
  lineNumber: z.number().int().min(1),
  transactionDate: z.string().datetime(),
  reference: z.string().min(1).max(100),
  description: z.string().max(500),
  debitAmount: z.number().min(0).optional(),
  creditAmount: z.number().min(0).optional(),
  balance: z.number(),
  transactionType: z.string().max(50),
});

export const importVendorStatementSchema = z.object({
  vendorId: z.string().uuid(),
  statementDate: z.string().datetime(),
  period: z.string().min(1).max(50),
  openingBalance: z.number(),
  closingBalance: z.number(),
  currency: z.string().length(3).optional(),
  lines: z.array(statementLineSchema).min(1),
});

export const runReconciliationSchema = z.object({});

export const adjustReconciliationSchema = z.object({
  adjustments: z.array(z.object({
    statementLineId: z.string().uuid(),
    adjustmentType: z.string().min(1).max(50),
    amount: z.number(),
    reason: z.string().min(1).max(1000),
    invoiceId: z.string().uuid().optional(),
  })).min(1),
});

export const completeReconciliationSchema = z.object({});

/* ── Credit ─────────────────────────────────────────────────────────────── */

export const creditListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const receiveCreditNoteSchema = z.object({
  vendorId: z.string().uuid(),
  creditNumber: z.string().min(1).max(100),
  creditDate: z.string().datetime(),
  creditAmount: z.number().positive(),
  currency: z.string().length(3).optional(),
  reason: z.string().min(1).max(1000),
  relatedInvoiceId: z.string().uuid().optional(),
});

export const applyCreditNoteSchema = z.object({
  applications: z.array(z.object({
    invoiceId: z.string().uuid(),
    amount: z.number().positive(),
  })).min(1),
});

export const voidCreditNoteSchema = z.object({
  reason: z.string().min(1).max(1000),
});

/* ── Reports & Queries ──────────────────────────────────────────────────── */

export const vendorAgingQuerySchema = z.object({
  asOfDate: z.string().datetime().optional(),
  vendorId: z.string().uuid().optional(),
  groupBy: z.enum(["VENDOR", "BUCKET", "CURRENCY"]).optional(),
});

export const paymentCalendarQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  vendorId: z.string().uuid().optional(),
  groupBy: z.enum(["DAY", "WEEK", "MONTH"]).optional(),
});

export const outstandingLiabilitiesQuerySchema = z.object({
  asOfDate: z.string().datetime().optional(),
  vendorId: z.string().uuid().optional(),
  includeCreditNotes: z.boolean().optional(),
});

export const discountAvailableQuerySchema = z.object({
  windowDays: z.number().int().min(1).max(365).optional(),
  minDiscountPercent: z.number().min(0).max(100).optional(),
});

export const cashRequirementsQuerySchema = z.object({
  horizon: z.number().int().min(1).max(365).optional(),
  groupBy: z.enum(["DAY", "WEEK", "MONTH"]).optional(),
  includeDiscounts: z.boolean().optional(),
});

export const apDashboardQuerySchema = z.object({
  period: z.enum(["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_QUARTER", "THIS_YEAR", "LAST_30_DAYS", "LAST_QUARTER"]).optional(),
});

export const apAnalyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  dimensions: z.array(z.enum(["VENDOR", "CATEGORY", "CURRENCY", "STATUS", "PERIOD"])).optional(),
  groupBy: z.enum(["DAY", "WEEK", "MONTH", "QUARTER"]).optional(),
});

export const getAuditTrailQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  actorId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

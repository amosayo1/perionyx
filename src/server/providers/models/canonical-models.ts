export interface CanonicalCustomer {
  id: string;
  externalId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: CanonicalAddress;
  currency?: string;
  taxId?: string;
  paymentTerms?: CanonicalPaymentTerms;
  status: "active" | "inactive" | "suspended";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalVendor {
  id: string;
  externalId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: CanonicalAddress;
  taxId?: string;
  paymentTerms?: CanonicalPaymentTerms;
  currency?: string;
  status: "active" | "inactive";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalInvoice {
  id: string;
  externalId?: string;
  invoiceNumber: string;
  type: "sales" | "purchase" | "credit_note" | "debit_note";
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "void";
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  customerId?: string;
  vendorId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  balance: number;
  lines: CanonicalInvoiceLine[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalInvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  accountCode?: string;
  metadata?: Record<string, unknown>;
}

export interface CanonicalPayment {
  id: string;
  externalId?: string;
  type: "incoming" | "outgoing" | "transfer";
  status: "pending" | "completed" | "failed" | "cancelled" | "refunded";
  amount: number;
  currency: string;
  amountInBaseCurrency?: number;
  exchangeRate?: number;
  paymentDate: Date;
  description?: string;
  reference?: string;
  invoiceIds: string[];
  sourceAccountId?: string;
  destinationAccountId?: string;
  fee?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalPurchaseOrder {
  id: string;
  externalId?: string;
  orderNumber: string;
  status: "draft" | "submitted" | "approved" | "received" | "cancelled" | "closed";
  vendorId: string;
  issueDate: Date;
  expectedDate?: Date;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: CanonicalPurchaseOrderLine[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalPurchaseOrderLine {
  id: string;
  description: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  receivedQuantity: number;
  accountCode?: string;
}

export interface CanonicalJournal {
  id: string;
  externalId?: string;
  journalNumber: string;
  type: "general" | "sales" | "purchase" | "cash" | "credit_note" | "debit_note";
  status: "draft" | "posted";
  postDate: Date;
  description?: string;
  currency: string;
  lines: CanonicalJournalLine[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalJournalLine {
  id: string;
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
  costCenter?: string;
  metadata?: Record<string, unknown>;
}

export interface CanonicalBankAccount {
  id: string;
  externalId?: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  currency: string;
  type: "checking" | "savings" | "credit_card" | "loan" | "investment";
  name: string;
  institution: string;
  balance: number;
  availableBalance: number;
  asOf: Date;
  status: "active" | "inactive" | "closed";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalTransaction {
  id: string;
  externalId?: string;
  accountId: string;
  type: "debit" | "credit";
  amount: number;
  currency: string;
  amountInBaseCurrency?: number;
  exchangeRate?: number;
  description: string;
  reference?: string;
  category?: string;
  postedAt: Date;
  valueDate?: Date;
  status: "pending" | "posted" | "reversed" | "void";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalEmployee {
  id: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
  employmentType: "full_time" | "part_time" | "contractor" | "intern";
  status: "active" | "inactive" | "terminated" | "on_leave";
  startDate?: Date;
  terminationDate?: Date;
  managerId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalAsset {
  id: string;
  externalId?: string;
  name: string;
  type: "fixed" | "intangible" | "current" | "financial";
  category?: string;
  purchaseDate: Date;
  purchaseCost: number;
  currency: string;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: "straight_line" | "declining_balance" | "sum_of_years" | "units_of_production";
  accumulatedDepreciation: number;
  netBookValue: number;
  status: "active" | "disposed" | "impaired" | "inactive";
  location?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalTaxRecord {
  id: string;
  externalId?: string;
  type: "sales" | "vat" | "income" | "withholding" | "property";
  jurisdiction: string;
  taxCode?: string;
  rate: number;
  amount: number;
  currency: string;
  transactionId?: string;
  invoiceId?: string;
  period: { start: Date; end: Date };
  status: "calculated" | "filed" | "paid" | "overdue";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalAttachment {
  id: string;
  externalId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
  content?: Buffer | Blob;
  entityType: "invoice" | "payment" | "receipt" | "document" | "report";
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanonicalPaymentTerms {
  type: "due_on_receipt" | "net_15" | "net_30" | "net_60" | "net_90" | "custom";
  dueDays: number;
  discountPercent?: number;
  discountDays?: number;
}

export interface CanonicalAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

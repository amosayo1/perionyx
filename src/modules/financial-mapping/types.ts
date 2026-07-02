import type { Prisma } from "@prisma/client";

export type FinancialProvider = "plaid" | "quickbooks" | "manual" | "dynamics365" | "netsuite" | "sap";

export interface NormalizedExternalAccount {
  source: FinancialProvider;
  externalId: string;
  itemId?: string;
  institutionName?: string;
  institutionId?: string;
  name: string;
  officialName?: string;
  type?: string;
  subtype?: string;
  mask?: string;
  currency: string;
}

export interface NormalizedBalance {
  source: FinancialProvider;
  externalAccountId: string;
  current: Prisma.Decimal;
  available?: Prisma.Decimal;
  limit?: Prisma.Decimal;
  currency: string;
  recordedAt: Date;
}

export interface NormalizedTransaction {
  source: FinancialProvider;
  externalId: string;
  externalAccountId: string;
  amount: Prisma.Decimal;
  currency: string;
  description?: string;
  merchantName?: string;
  category?: string;
  categoryId?: string;
  pending: boolean;
  transactionDate?: Date;
  postDate?: Date;
  paymentChannel?: string;
  transactionType?: string;
  isoCurrencyCode?: string;
  pendingExternalId?: string;
}

export interface NormalizedChartOfAccount {
  externalId: string;
  name: string;
  accountType: string;
  accountSubType?: string;
  classification?: string;
  active: boolean;
  balance: Prisma.Decimal;
  currency: string;
  description?: string;
}

export interface NormalizedVendor {
  externalId: string;
  displayName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: Record<string, unknown>;
  active: boolean;
  balance: Prisma.Decimal;
  currency: string;
}

export interface NormalizedCustomer {
  externalId: string;
  displayName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: Record<string, unknown>;
  active: boolean;
  balance: Prisma.Decimal;
  currency: string;
}

export interface NormalizedInvoice {
  externalId: string;
  docNumber?: string;
  customerId?: string;
  customerName?: string;
  totalAmount: Prisma.Decimal;
  balance: Prisma.Decimal;
  currency: string;
  status: string;
  dueDate?: Date;
  transactionDate?: Date;
  emailStatus?: string;
  deliveryInfo?: Record<string, unknown>;
  lineItems?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

export interface NormalizedJournalEntry {
  externalId?: string;
  docNumber?: string;
  transactionDate: Date;
  currency: string;
  lineItems: NormalizedJournalLine[];
  description?: string;
}

export interface NormalizedJournalLine {
  accountId: string;
  accountName: string;
  amount: Prisma.Decimal;
  side: "DEBIT" | "CREDIT";
  description?: string;
}

export interface NormalizedPayment {
  externalId?: string;
  customerId?: string;
  customerName?: string;
  totalAmount: Prisma.Decimal;
  currency: string;
  transactionDate: Date;
  paymentMethod?: string;
  reference?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  startedAt: string;
  completedAt: string;
}

export interface NormalizedErpPosition {
  provider: FinancialProvider;
  currency: string;
  totalBalance: number;
  accountCount: number;
  lastSyncedAt: string;
}

export interface NormalizedLiquiditySummary {
  currency: string;
  totalInternal: number;
  totalExternal: number;
  positions: NormalizedErpPosition[];
}

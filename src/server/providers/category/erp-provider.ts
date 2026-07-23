import type { ConnectionConfig, SyncJob, SyncState, SyncResult, ProviderCapabilities } from "@/server/integrations/types";
import type {
  ERPProvider,
  BankProvider,
  AccountingProvider,
  CRMProvider,
  PayrollProvider,
  HRProvider,
  IdentityProvider,
  EmailProvider,
  StorageProvider,
  PaymentProvider,
  TaxProvider,
  AIProvider,
  MessagingProvider,
  DocumentProvider,
} from "@/server/integrations/integration-provider";
import { BaseProvider } from "../base/base-provider";

export abstract class ERPProviderBase extends BaseProvider implements ERPProvider {
  abstract readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readJournals(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readVendors(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readCustomers(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readInvoices(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readPurchaseOrders(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "erp";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class BankProviderBase extends BaseProvider implements BankProvider {
  abstract readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readTransactions(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readBalance(connection: ConnectionConfig): Promise<{ currency: string; amount: number; asOf: Date }>;
  abstract readStatements(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract initiatePayment(connection: ConnectionConfig, payment: Record<string, unknown>): Promise<{ id: string; status: string }>;

  get category(): string {
    return "banking";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class AccountingProviderBase extends BaseProvider implements AccountingProvider {
  abstract readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readJournals(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readInvoices(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract writeInvoice(connection: ConnectionConfig, invoice: Record<string, unknown>): Promise<unknown>;
  abstract readTax(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readReports(connection: ConnectionConfig, reportType: string, options?: Record<string, unknown>): Promise<unknown>;

  get category(): string {
    return "accounting";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class CRMProviderBase extends BaseProvider implements CRMProvider {
  abstract readContacts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract writeContact(connection: ConnectionConfig, contact: Record<string, unknown>): Promise<unknown>;
  abstract readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readDeals(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readActivities(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "crm";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class PayrollProviderBase extends BaseProvider implements PayrollProvider {
  abstract readEmployees(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readPayrollRuns(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readPayslips(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readTaxForms(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "payroll";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class HRProviderBase extends BaseProvider implements HRProvider {
  abstract readEmployees(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readDepartments(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readTimeOff(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readAttendance(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "hr";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class IdentityProviderBase extends BaseProvider implements IdentityProvider {
  abstract authenticateUser(connection: ConnectionConfig, credentials: Record<string, string>): Promise<{ token: string; expiresAt: Date }>;
  abstract readUsers(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readGroups(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readRoles(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "identity";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class EmailProviderBase extends BaseProvider implements EmailProvider {
  abstract sendEmail(connection: ConnectionConfig, email: { to: string[]; subject: string; body: string; attachments?: string[] }): Promise<{ id: string }>;
  abstract readEmails(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readFolders(connection: ConnectionConfig): Promise<unknown[]>;

  get category(): string {
    return "email";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class StorageProviderBase extends BaseProvider implements StorageProvider {
  abstract listFiles(connection: ConnectionConfig, path: string, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readFile(connection: ConnectionConfig, fileId: string): Promise<Buffer | Blob>;
  abstract writeFile(connection: ConnectionConfig, path: string, data: Buffer | Blob): Promise<{ id: string }>;
  abstract deleteFile(connection: ConnectionConfig, fileId: string): Promise<void>;

  get category(): string {
    return "storage";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class PaymentProviderBase extends BaseProvider implements PaymentProvider {
  abstract processPayment(connection: ConnectionConfig, payment: Record<string, unknown>): Promise<{ id: string; status: string }>;
  abstract readTransactions(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract refundPayment(connection: ConnectionConfig, paymentId: string, amount?: number): Promise<{ id: string; status: string }>;
  abstract readPayouts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "payment";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class TaxProviderBase extends BaseProvider implements TaxProvider {
  abstract calculateTax(connection: ConnectionConfig, transaction: Record<string, unknown>): Promise<{ taxAmount: number; rate: number; breakdown: Record<string, number> }>;
  abstract fileTaxReturn(connection: ConnectionConfig, returnData: Record<string, unknown>): Promise<{ id: string; status: string }>;
  abstract readTaxRates(connection: ConnectionConfig, jurisdiction?: string): Promise<unknown[]>;

  get category(): string {
    return "tax";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class AIProviderBase extends BaseProvider implements AIProvider {
  abstract generateText(connection: ConnectionConfig, prompt: string, options?: Record<string, unknown>): Promise<string>;
  abstract analyze(connection: ConnectionConfig, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
  abstract classify(connection: ConnectionConfig, input: string, categories: string[]): Promise<{ category: string; confidence: number }>;

  get category(): string {
    return "ai";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class MessagingProviderBase extends BaseProvider implements MessagingProvider {
  abstract sendMessage(connection: ConnectionConfig, message: { to: string; subject: string; body: string; channel: "email" | "sms" | "slack" | "teams" }): Promise<{ id: string }>;
  abstract readMessages(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readChannels(connection: ConnectionConfig): Promise<unknown[]>;
  abstract readThreads(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;

  get category(): string {
    return "messaging";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export abstract class DocumentProviderBase extends BaseProvider implements DocumentProvider {
  abstract listDocuments(connection: ConnectionConfig, path: string, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readDocument(connection: ConnectionConfig, documentId: string): Promise<Buffer | Blob>;
  abstract writeDocument(connection: ConnectionConfig, path: string, data: Buffer | Blob, mimeType?: string): Promise<{ id: string; version: string }>;
  abstract deleteDocument(connection: ConnectionConfig, documentId: string): Promise<void>;
  abstract searchDocuments(connection: ConnectionConfig, query: string, options?: Record<string, unknown>): Promise<unknown[]>;
  abstract readDocumentVersions(connection: ConnectionConfig, documentId: string): Promise<unknown[]>;

  get category(): string {
    return "document";
  }

  protected async performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

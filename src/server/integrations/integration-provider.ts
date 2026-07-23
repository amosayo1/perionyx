import type {
  ProviderConfig,
  ConnectionConfig,
  SyncJob,
  SyncResult,
  SyncState,
  HealthStatus,
  IntegrationEvent,
  IntegrationDomainEvent,
  ProviderCapabilities,
  DiscoveryResult,
  HealthDiagnostics,
} from "./types";

export interface IntegrationProvider {
  readonly config: ProviderConfig;

  initialize(): Promise<void>;
  destroy(): Promise<void>;

  getCapabilities(): Promise<ProviderCapabilities>;
  discover(connection: ConnectionConfig): Promise<DiscoveryResult>;

  authenticate(connection: ConnectionConfig): Promise<boolean>;
  validateConnection(connection: ConnectionConfig): Promise<boolean>;
  refreshConnection(connection: ConnectionConfig): Promise<ConnectionConfig>;

  checkHealth(connection: ConnectionConfig): Promise<{ status: HealthStatus; latency: number; error?: string }>;
  diagnose(connection: ConnectionConfig): Promise<HealthDiagnostics>;

  sync(job: SyncJob, state: SyncState): Promise<SyncResult>;
  syncFull(job: SyncJob, state: SyncState): Promise<SyncResult>;
  syncIncremental(job: SyncJob, state: SyncState): Promise<SyncResult>;

  handleEvent(event: IntegrationEvent | IntegrationDomainEvent): Promise<void>;

  getSyncState(connectionId: string): Promise<SyncState>;
  resetSyncState(connectionId: string): Promise<void>;

  test(config: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
}

export interface ERPProvider extends IntegrationProvider {
  readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readJournals(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readVendors(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readCustomers(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readInvoices(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readPurchaseOrders(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface BankProvider extends IntegrationProvider {
  readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readTransactions(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readBalance(connection: ConnectionConfig): Promise<{ currency: string; amount: number; asOf: Date }>;
  readStatements(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  initiatePayment(connection: ConnectionConfig, payment: Record<string, unknown>): Promise<{ id: string; status: string }>;
}

export interface AccountingProvider extends IntegrationProvider {
  readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readJournals(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readInvoices(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  writeInvoice(connection: ConnectionConfig, invoice: Record<string, unknown>): Promise<unknown>;
  readTax(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readReports(connection: ConnectionConfig, reportType: string, options?: Record<string, unknown>): Promise<unknown>;
}

export interface CRMProvider extends IntegrationProvider {
  readContacts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  writeContact(connection: ConnectionConfig, contact: Record<string, unknown>): Promise<unknown>;
  readAccounts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readDeals(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readActivities(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface PayrollProvider extends IntegrationProvider {
  readEmployees(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readPayrollRuns(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readPayslips(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readTaxForms(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface HRProvider extends IntegrationProvider {
  readEmployees(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readDepartments(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readTimeOff(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readAttendance(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface EmailProvider extends IntegrationProvider {
  sendEmail(connection: ConnectionConfig, email: { to: string[]; subject: string; body: string; attachments?: string[] }): Promise<{ id: string }>;
  readEmails(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readFolders(connection: ConnectionConfig): Promise<unknown[]>;
}

export interface StorageProvider extends IntegrationProvider {
  listFiles(connection: ConnectionConfig, path: string, options?: Record<string, unknown>): Promise<unknown[]>;
  readFile(connection: ConnectionConfig, fileId: string): Promise<Buffer | Blob>;
  writeFile(connection: ConnectionConfig, path: string, data: Buffer | Blob): Promise<{ id: string }>;
  deleteFile(connection: ConnectionConfig, fileId: string): Promise<void>;
}

export interface AIProvider extends IntegrationProvider {
  generateText(connection: ConnectionConfig, prompt: string, options?: Record<string, unknown>): Promise<string>;
  analyze(connection: ConnectionConfig, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
  classify(connection: ConnectionConfig, input: string, categories: string[]): Promise<{ category: string; confidence: number }>;
}

export interface PaymentProvider extends IntegrationProvider {
  processPayment(connection: ConnectionConfig, payment: Record<string, unknown>): Promise<{ id: string; status: string }>;
  readTransactions(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  refundPayment(connection: ConnectionConfig, paymentId: string, amount?: number): Promise<{ id: string; status: string }>;
  readPayouts(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface TaxProvider extends IntegrationProvider {
  calculateTax(connection: ConnectionConfig, transaction: Record<string, unknown>): Promise<{ taxAmount: number; rate: number; breakdown: Record<string, number> }>;
  fileTaxReturn(connection: ConnectionConfig, returnData: Record<string, unknown>): Promise<{ id: string; status: string }>;
  readTaxRates(connection: ConnectionConfig, jurisdiction?: string): Promise<unknown[]>;
}

export interface IdentityProvider extends IntegrationProvider {
  authenticateUser(connection: ConnectionConfig, credentials: Record<string, string>): Promise<{ token: string; expiresAt: Date }>;
  readUsers(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readGroups(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readRoles(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface MessagingProvider extends IntegrationProvider {
  sendMessage(connection: ConnectionConfig, message: { to: string; subject: string; body: string; channel: "email" | "sms" | "slack" | "teams" }): Promise<{ id: string }>;
  readMessages(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
  readChannels(connection: ConnectionConfig): Promise<unknown[]>;
  readThreads(connection: ConnectionConfig, options?: Record<string, unknown>): Promise<unknown[]>;
}

export interface DocumentProvider extends IntegrationProvider {
  listDocuments(connection: ConnectionConfig, path: string, options?: Record<string, unknown>): Promise<unknown[]>;
  readDocument(connection: ConnectionConfig, documentId: string): Promise<Buffer | Blob>;
  writeDocument(connection: ConnectionConfig, path: string, data: Buffer | Blob, mimeType?: string): Promise<{ id: string; version: string }>;
  deleteDocument(connection: ConnectionConfig, documentId: string): Promise<void>;
  searchDocuments(connection: ConnectionConfig, query: string, options?: Record<string, unknown>): Promise<unknown[]>;
  readDocumentVersions(connection: ConnectionConfig, documentId: string): Promise<unknown[]>;
}

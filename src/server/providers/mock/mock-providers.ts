import type { ConnectionConfig, ProviderCapabilities, SyncJob, SyncState, SyncResult, DiscoveryResult, HealthDiagnostics, AuthMethod } from "@/server/integrations/types";
import {
  ERPProviderBase,
  BankProviderBase,
  AccountingProviderBase,
  CRMProviderBase,
  PayrollProviderBase,
  HRProviderBase,
  IdentityProviderBase,
  EmailProviderBase,
  StorageProviderBase,
  PaymentProviderBase,
  TaxProviderBase,
  AIProviderBase,
  MessagingProviderBase,
  DocumentProviderBase,
} from "../category/erp-provider";

export class MockERPProvider extends ERPProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "api_key"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import", "export"],
      capabilities: ["read_accounts", "read_journals", "read_vendors", "read_customers", "read_invoices", "read_purchase_orders", "supports_oauth", "supports_pagination"],
      rateLimit: 100,
      rateLimitWindow: 60000,
    });
  }

  async readAccounts(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "acc-1", code: "1000", name: "Cash", type: "asset", balance: 50000 }];
  }

  async readJournals(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "journal-1", number: "JN-001", type: "general", postDate: new Date(), description: "Test entry" }];
  }

  async readVendors(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "vendor-1", name: "Test Vendor", email: "vendor@test.com", status: "active" }];
  }

  async readCustomers(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "cust-1", name: "Test Customer", email: "customer@test.com", status: "active" }];
  }

  async readInvoices(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "inv-1", number: "INV-001", total: 1000, status: "sent", currency: "USD" }];
  }

  async readPurchaseOrders(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "po-1", number: "PO-001", total: 500, status: "submitted" }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 10, itemsFailed: 0, errors: [], duration: 100, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 3, itemsFailed: 0, errors: [], duration: 50, hasMore: false };
  }
}

export class MockBankProvider extends BankProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "client_credentials"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import"],
      capabilities: ["read_accounts", "read_transactions", "read_balance", "read_statements", "initiate_payment", "supports_oauth", "supports_incremental_sync"],
      rateLimit: 30,
      rateLimitWindow: 60000,
    });
  }

  async readAccounts(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "acct-1", accountNumber: "****1234", currency: "USD", type: "checking", balance: 100000 }];
  }

  async readTransactions(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "txn-1", amount: 500, type: "credit", description: "Deposit", postedAt: new Date() }];
  }

  async readBalance(_connection: ConnectionConfig): Promise<{ currency: string; amount: number; asOf: Date }> {
    return { currency: "USD", amount: 100000, asOf: new Date() };
  }

  async readStatements(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "stmt-1", period: { start: new Date("2026-01-01"), end: new Date("2026-01-31") }, openingBalance: 90000, closingBalance: 100000 }];
  }

  async initiatePayment(_connection: ConnectionConfig, _payment: Record<string, unknown>): Promise<{ id: string; status: string }> {
    return { id: "pmt-1", status: "completed" };
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 25, itemsFailed: 0, errors: [], duration: 200, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 5, itemsFailed: 0, errors: [], duration: 80, hasMore: false };
  }
}

export class MockAccountingProvider extends AccountingProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "api_key"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import", "export"],
      capabilities: ["read_accounts", "read_journals", "read_invoices", "write_invoices", "read_tax", "read_reports", "supports_oauth", "supports_pagination"],
      rateLimit: 80,
      rateLimitWindow: 60000,
    });
  }

  async readAccounts(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "acc-1", code: "1000", name: "Cash", type: "asset", balance: 50000 }];
  }

  async readJournals(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "journal-1", number: "JN-001", postDate: new Date() }];
  }

  async readInvoices(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "inv-1", number: "INV-001", total: 1000, status: "sent" }];
  }

  async writeInvoice(_connection: ConnectionConfig, _invoice: Record<string, unknown>): Promise<unknown> {
    return { id: "inv-new", number: "INV-002", status: "draft" };
  }

  async readTax(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "tax-1", code: "VAT-20", rate: 0.2, jurisdiction: "UK" }];
  }

  async readReports(_connection: ConnectionConfig, _reportType: string, _options?: Record<string, unknown>): Promise<unknown> {
    return { name: "Balance Sheet", rows: [{ account: "Cash", balance: 50000 }] };
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 15, itemsFailed: 0, errors: [], duration: 150, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 4, itemsFailed: 0, errors: [], duration: 60, hasMore: false };
  }
}

export class MockCRMProvider extends CRMProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "api_key"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import", "export"],
      capabilities: ["read_contacts", "write_contacts", "read_accounts", "supports_oauth", "supports_pagination", "supports_search"],
      rateLimit: 100,
      rateLimitWindow: 60000,
    });
  }

  async readContacts(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "contact-1", name: "John Doe", email: "john@test.com", phone: "+1234567890" }];
  }

  async writeContact(_connection: ConnectionConfig, _contact: Record<string, unknown>): Promise<unknown> {
    return { id: "contact-new", ..._contact };
  }

  async readAccounts(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "acct-1", name: "Acme Corp", industry: "Technology" }];
  }

  async readDeals(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "deal-1", name: "Enterprise Deal", amount: 50000, stage: "negotiation" }];
  }

  async readActivities(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "act-1", type: "call", description: "Follow up call", date: new Date() }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 20, itemsFailed: 0, errors: [], duration: 120, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 3, itemsFailed: 0, errors: [], duration: 45, hasMore: false };
  }
}

export class MockPayrollProvider extends PayrollProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "basic_auth"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import"],
      capabilities: ["read_employees", "supports_oauth", "supports_pagination"],
      rateLimit: 60,
      rateLimitWindow: 60000,
    });
  }

  async readEmployees(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "emp-1", firstName: "Jane", lastName: "Smith", email: "jane@company.com", department: "Engineering" }];
  }

  async readPayrollRuns(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "run-1", periodStart: new Date("2026-01-01"), periodEnd: new Date("2026-01-15"), totalGross: 50000 }];
  }

  async readPayslips(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "slip-1", employeeId: "emp-1", grossPay: 5000, netPay: 3800 }];
  }

  async readTaxForms(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "tax-1", employeeId: "emp-1", formType: "W-2", year: 2025 }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 30, itemsFailed: 0, errors: [], duration: 180, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 2, itemsFailed: 0, errors: [], duration: 40, hasMore: false };
  }
}

export class MockHRProvider extends HRProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "api_key"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import"],
      capabilities: ["read_employees", "supports_oauth", "supports_pagination"],
      rateLimit: 60,
      rateLimitWindow: 60000,
    });
  }

  async readEmployees(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "emp-1", firstName: "Jane", lastName: "Smith", email: "jane@company.com", department: "Engineering", status: "active" }];
  }

  async readDepartments(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "dept-1", name: "Engineering", headCount: 25 }];
  }

  async readTimeOff(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "to-1", employeeId: "emp-1", type: "vacation", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-05"), status: "approved" }];
  }

  async readAttendance(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ employeeId: "emp-1", date: new Date(), status: "present" }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 25, itemsFailed: 0, errors: [], duration: 100, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 1, itemsFailed: 0, errors: [], duration: 30, hasMore: false };
  }
}

export class MockEmailProvider extends EmailProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "basic_auth"],
      syncTypes: ["incremental"],
      syncDirections: ["import", "export"],
      capabilities: ["supports_oauth", "supports_attachments"],
      rateLimit: 200,
      rateLimitWindow: 60000,
    });
  }

  async sendEmail(_connection: ConnectionConfig, _email: { to: string[]; subject: string; body: string; attachments?: string[] }): Promise<{ id: string }> {
    return { id: "email-" + crypto.randomUUID() };
  }

  async readEmails(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "email-1", subject: "Test Email", from: "sender@test.com", receivedAt: new Date() }];
  }

  async readFolders(_connection: ConnectionConfig): Promise<unknown[]> {
    return [{ id: "folder-1", name: "Inbox" }, { id: "folder-2", name: "Sent" }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 10, itemsFailed: 0, errors: [], duration: 60, hasMore: false };
  }
}

export class MockStorageProvider extends StorageProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "api_key"],
      syncTypes: ["full"],
      syncDirections: ["import", "export"],
      capabilities: ["read_files", "write_files", "supports_oauth", "supports_pagination"],
      rateLimit: 300,
      rateLimitWindow: 60000,
    });
  }

  async listFiles(_connection: ConnectionConfig, _path: string, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "file-1", name: "report.pdf", size: 102400, mimeType: "application/pdf" }];
  }

  async readFile(_connection: ConnectionConfig, _fileId: string): Promise<Buffer | Blob> {
    return Buffer.from("mock file content");
  }

  async writeFile(_connection: ConnectionConfig, _path: string, _data: Buffer | Blob): Promise<{ id: string }> {
    return { id: "file-" + crypto.randomUUID() };
  }

  async deleteFile(_connection: ConnectionConfig, _fileId: string): Promise<void> {
    // mock delete
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 5, itemsFailed: 0, errors: [], duration: 80, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export class MockPaymentProvider extends PaymentProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["api_key", "basic_auth"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import", "export"],
      capabilities: ["initiate_payment", "read_transactions", "supports_webhooks"],
      rateLimit: 50,
      rateLimitWindow: 60000,
    });
  }

  async processPayment(_connection: ConnectionConfig, _payment: Record<string, unknown>): Promise<{ id: string; status: string }> {
    return { id: "payment-" + crypto.randomUUID(), status: "completed" };
  }

  async readTransactions(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "txn-1", amount: 100, currency: "USD", status: "completed", description: "Payment" }];
  }

  async refundPayment(_connection: ConnectionConfig, _paymentId: string, _amount?: number): Promise<{ id: string; status: string }> {
    return { id: "refund-" + _paymentId, status: "completed" };
  }

  async readPayouts(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "payout-1", amount: 5000, currency: "USD", status: "paid", paidAt: new Date() }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 20, itemsFailed: 0, errors: [], duration: 150, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 5, itemsFailed: 0, errors: [], duration: 50, hasMore: false };
  }
}

export class MockTaxProvider extends TaxProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["api_key", "basic_auth"],
      syncTypes: ["full"],
      syncDirections: ["import", "export"],
      capabilities: ["read_tax", "supports_pagination"],
      rateLimit: 40,
      rateLimitWindow: 60000,
    });
  }

  async calculateTax(_connection: ConnectionConfig, _transaction: Record<string, unknown>): Promise<{ taxAmount: number; rate: number; breakdown: Record<string, number> }> {
    return { taxAmount: 200, rate: 0.2, breakdown: { state: 100, federal: 100 } };
  }

  async fileTaxReturn(_connection: ConnectionConfig, _returnData: Record<string, unknown>): Promise<{ id: string; status: string }> {
    return { id: "filing-1", status: "submitted" };
  }

  async readTaxRates(_connection: ConnectionConfig, _jurisdiction?: string): Promise<unknown[]> {
    return [{ id: "rate-1", name: "VAT Standard", rate: 0.2, jurisdiction: "UK", effectiveFrom: new Date("2026-01-01") }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 10, itemsFailed: 0, errors: [], duration: 100, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export class MockAIProvider extends AIProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["api_key"],
      syncTypes: ["manual"],
      syncDirections: ["import"],
      capabilities: [],
      rateLimit: 1000,
      rateLimitWindow: 60000,
    });
  }

  async generateText(_connection: ConnectionConfig, _prompt: string, _options?: Record<string, unknown>): Promise<string> {
    return "This is mock generated text from the AI provider.";
  }

  async analyze(_connection: ConnectionConfig, _data: Record<string, unknown>, _options?: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { sentiment: "positive", confidence: 0.95, summary: "Mock analysis result" };
  }

  async classify(_connection: ConnectionConfig, _input: string, _categories: string[]): Promise<{ category: string; confidence: number }> {
    return { category: _categories[0] ?? "general", confidence: 0.85 };
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }
}

export class MockIdentityProvider extends IdentityProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "oidc", "jwt"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import"],
      capabilities: ["supports_oauth", "supports_pagination", "supports_search"],
      rateLimit: 200,
      rateLimitWindow: 60000,
    });
  }

  async authenticateUser(_connection: ConnectionConfig, _credentials: Record<string, string>): Promise<{ token: string; expiresAt: Date }> {
    return { token: "mock-jwt-token", expiresAt: new Date(Date.now() + 3600000) };
  }

  async readUsers(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "user-1", email: "user@test.com", name: "Test User", status: "active" }];
  }

  async readGroups(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "group-1", name: "Administrators", memberCount: 5 }];
  }

  async readRoles(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "role-1", name: "Admin", permissions: ["read", "write", "delete"] }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 15, itemsFailed: 0, errors: [], duration: 90, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 2, itemsFailed: 0, errors: [], duration: 30, hasMore: false };
  }
}

export class MockMessagingProvider extends MessagingProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["api_key", "oauth2"],
      syncTypes: ["incremental"],
      syncDirections: ["import"],
      capabilities: ["supports_webhooks"],
      rateLimit: 500,
      rateLimitWindow: 60000,
    });
  }

  async sendMessage(_connection: ConnectionConfig, _message: { to: string; subject: string; body: string; channel: "email" | "sms" | "slack" | "teams" }): Promise<{ id: string }> {
    return { id: "msg-" + crypto.randomUUID() };
  }

  async readMessages(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "msg-1", from: "sender@test.com", subject: "Hello", receivedAt: new Date() }];
  }

  async readChannels(_connection: ConnectionConfig): Promise<unknown[]> {
    return [{ id: "ch-1", name: "#general", type: "slack" }, { id: "ch-2", name: "Announcements", type: "teams" }];
  }

  async readThreads(_connection: ConnectionConfig, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "thread-1", channelId: "ch-1", subject: "Discussion", messageCount: 10 }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 0, itemsFailed: 0, errors: [], duration: 0, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 8, itemsFailed: 0, errors: [], duration: 40, hasMore: false };
  }
}

export class MockDocumentProvider extends DocumentProviderBase {
  async getCapabilities(): Promise<ProviderCapabilities> {
    return this.buildCapabilities({
      authMethods: ["oauth2", "api_key"],
      syncTypes: ["full", "incremental"],
      syncDirections: ["import", "export"],
      capabilities: ["read_files", "write_files", "supports_oauth", "supports_pagination", "supports_search"],
      rateLimit: 200,
      rateLimitWindow: 60000,
    });
  }

  async listDocuments(_connection: ConnectionConfig, _path: string, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "doc-1", name: "contract.pdf", mimeType: "application/pdf", sizeBytes: 204800 }];
  }

  async readDocument(_connection: ConnectionConfig, _documentId: string): Promise<Buffer | Blob> {
    return Buffer.from("mock document content");
  }

  async writeDocument(_connection: ConnectionConfig, _path: string, _data: Buffer | Blob, _mimeType?: string): Promise<{ id: string; version: string }> {
    return { id: "doc-" + crypto.randomUUID(), version: "1.0" };
  }

  async deleteDocument(_connection: ConnectionConfig, _documentId: string): Promise<void> {
    // mock delete
  }

  async searchDocuments(_connection: ConnectionConfig, _query: string, _options?: Record<string, unknown>): Promise<unknown[]> {
    return [{ id: "doc-1", name: "contract.pdf", score: 0.95 }];
  }

  async readDocumentVersions(_connection: ConnectionConfig, _documentId: string): Promise<unknown[]> {
    return [{ version: "1.0", createdAt: new Date(), modifiedBy: "user@test.com" }];
  }

  protected async performFullSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 12, itemsFailed: 0, errors: [], duration: 100, hasMore: false };
  }

  protected async performIncrementalSync(_job: SyncJob, _state: SyncState): Promise<SyncResult> {
    return { success: true, itemsSynced: 3, itemsFailed: 0, errors: [], duration: 35, hasMore: false };
  }
}

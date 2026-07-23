import { MockERPProvider, MockBankProvider, MockCRMProvider, MockPayrollProvider, MockHRProvider, MockStorageProvider, MockIdentityProvider, MockEmailProvider } from "@/server/providers/mock/mock-providers";
import type { ConnectionConfig, ProviderConfig, SyncJob, SyncState } from "@/server/integrations/types";
import { createSession, getSession, updateSessionStatus } from "./session";
import { advanceCheckpoint, markBatchProcessed } from "./checkpoint-manager";
import { detectChanges } from "./change-detector";
import { detectVersionConflicts } from "./conflict-detector";
import { resolveConflict } from "./conflict-resolver";
import { recordSyncOperation } from "./metrics";
import { executeWithRetry } from "./retry-orchestrator";
import { attemptRecovery } from "./recovery";
import type { SyncContext } from "./types";

function createMockConnection(id: string, providerId: string): ConnectionConfig {
  return {
    id,
    providerId,
    companyId: "mock-company-1",
    name: `Mock ${providerId}`,
    status: "connected",
    authMethod: "api_key",
    config: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    failureCount: 0,
    enabled: true,
    version: 1,
  };
}

function createMockSyncJob(connectionId: string, companyId: string): SyncJob {
  return {
    id: "mock-job-1",
    connectionId,
    companyId,
    type: "full",
    direction: "import",
    status: "running",
    startedAt: new Date(),
  };
}

export interface MockValidationResult {
  providerType: string;
  success: boolean;
  errors: string[];
  metrics: {
    recordsProcessed: number;
    recordsFailed: number;
    batchCount: number;
    conflictsDetected: number;
  };
}

export async function validateERPProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockERPProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-erp", name: "Mock ERP", version: "1.0", category: "erp", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-erp", "mock-erp");
  const session = createSession({ connectionId: connection.id, providerId: "mock-erp", companyId: connection.companyId, mode: "full", direction: "import", options: { mode: "full", direction: "import" } });

  try {
    await provider.initialize();
    const capabilities = await provider.getCapabilities();
    if (capabilities.category !== "erp") errors.push("ERP category mismatch");

    const accounts = await provider.readAccounts(connection);
    if (!Array.isArray(accounts)) errors.push("readAccounts should return array");

    const journals = await provider.readJournals(connection);
    if (!Array.isArray(journals)) errors.push("readJournals should return array");

    const invoices = await provider.readInvoices(connection);
    if (!Array.isArray(invoices)) errors.push("readInvoices should return array");

    const vendors = await provider.readVendors(connection);
    if (!Array.isArray(vendors)) errors.push("readVendors should return array");

    const customers = await provider.readCustomers(connection);
    if (!Array.isArray(customers)) errors.push("readCustomers should return array");

    const pos = await provider.readPurchaseOrders(connection);
    if (!Array.isArray(pos)) errors.push("readPurchaseOrders should return array");

    const changeDetection = detectChanges({
      connectionId: connection.id,
      entityType: "accounts",
      remoteItems: (accounts as Record<string, unknown>[]).map((a) => ({ id: String(a.id), updatedAt: String(a.updatedAt ?? new Date().toISOString()) })),
      config: { method: "timestamp" },
    });
    if (!changeDetection.hasChanges && accounts.length > 0) errors.push("Change detection should detect new items");

    const conflictResult = detectVersionConflicts({
      sessionId: session.id,
      entityType: "accounts",
      connectionId: connection.id,
      localRecords: [{ id: "acc-1", version: "1", data: { balance: 50000 } }],
      remoteRecords: [{ id: "acc-1", version: "2", data: { balance: 55000 } }],
      policy: "source_wins",
    });
    if (!conflictResult.hasConflicts) errors.push("Should detect version conflict");

    if (conflictResult.conflicts.length > 0) {
      const resolution = await resolveConflict(conflictResult.conflicts[0]);
      if (resolution.resolution !== "remote") errors.push("Source wins policy should select remote");
    }

    const health = await provider.checkHealth(connection);
    if (health.status !== "healthy") errors.push("Mock ERP should be healthy");

    updateSessionStatus(session.id, "completed");
    await provider.destroy();

    return {
      providerType: "ERP",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: accounts.length, recordsFailed: 0, batchCount: 1, conflictsDetected: conflictResult.conflicts.length },
    };
  } catch (error) {
    return {
      providerType: "ERP",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateBankProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockBankProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-bank", name: "Mock Bank", version: "1.0", category: "banking", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-bank", "mock-bank");

  try {
    const balance = await provider.readBalance(connection);
    if (typeof balance.amount !== "number") errors.push("Balance amount should be a number");
    if (!(balance.asOf instanceof Date)) errors.push("Balance asOf should be a Date");

    const txn = await provider.initiatePayment(connection, { amount: 100, currency: "USD" });
    if (!txn.id) errors.push("Payment should return an id");

    return {
      providerType: "Bank",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "Bank",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateCRMProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockCRMProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-crm", name: "Mock CRM", version: "1.0", category: "crm", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-crm", "mock-crm");

  try {
    const contacts = await provider.readContacts(connection);
    if (!Array.isArray(contacts)) errors.push("readContacts should return array");

    const writeResult = await provider.writeContact(connection, { name: "Test", email: "test@test.com" });
    if (!writeResult || typeof writeResult !== "object") errors.push("writeContact should return an object");

    return {
      providerType: "CRM",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: contacts.length, recordsFailed: 0, batchCount: 1, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "CRM",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validatePayrollProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockPayrollProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-payroll", name: "Mock Payroll", version: "1.0", category: "payroll", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-payroll", "mock-payroll");

  try {
    const employees = await provider.readEmployees(connection);
    if (!Array.isArray(employees)) errors.push("readEmployees should return array");

    const runs = await provider.readPayrollRuns(connection);
    if (!Array.isArray(runs)) errors.push("readPayrollRuns should return array");

    const slips = await provider.readPayslips(connection);
    if (!Array.isArray(slips)) errors.push("readPayslips should return array");

    return {
      providerType: "Payroll",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: employees.length + runs.length + slips.length, recordsFailed: 0, batchCount: 3, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "Payroll",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateHRProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockHRProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-hr", name: "Mock HR", version: "1.0", category: "hr", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-hr", "mock-hr");

  try {
    const departments = await provider.readDepartments(connection);
    if (!Array.isArray(departments)) errors.push("readDepartments should return array");

    const timeoff = await provider.readTimeOff(connection);
    if (!Array.isArray(timeoff)) errors.push("readTimeOff should return array");

    return {
      providerType: "HR",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: departments.length + timeoff.length, recordsFailed: 0, batchCount: 2, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "HR",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateStorageProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockStorageProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-storage", name: "Mock Storage", version: "1.0", category: "storage", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-storage", "mock-storage");

  try {
    const files = await provider.listFiles(connection, "/");
    if (!Array.isArray(files)) errors.push("listFiles should return array");

    const file = await provider.readFile(connection, "file-1");
    if (!(file instanceof Buffer)) errors.push("readFile should return Buffer");

    return {
      providerType: "Storage",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: files.length, recordsFailed: 0, batchCount: 1, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "Storage",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateIdentityProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockIdentityProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-identity", name: "Mock Identity", version: "1.0", category: "identity", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-identity", "mock-identity");

  try {
    const users = await provider.readUsers(connection);
    if (!Array.isArray(users)) errors.push("readUsers should return array");

    const groups = await provider.readGroups(connection);
    if (!Array.isArray(groups)) errors.push("readGroups should return array");

    const roles = await provider.readRoles(connection);
    if (!Array.isArray(roles)) errors.push("readRoles should return array");

    return {
      providerType: "Identity",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: users.length + groups.length + roles.length, recordsFailed: 0, batchCount: 3, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "Identity",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateEmailProvider(): Promise<MockValidationResult> {
  const errors: string[] = [];
  const provider = new MockEmailProvider();
  Object.defineProperty(provider, "config", {
    value: { id: "mock-email", name: "Mock Email", version: "1.0", category: "email", description: "", vendor: "MockCorp", capabilities: {} as never, configSchema: {}, credentialsSchema: {} },
    writable: false,
  });

  const connection = createMockConnection("conn-email", "mock-email");

  try {
    const sendResult = await provider.sendEmail(connection, { to: ["test@test.com"], subject: "Test", body: "Hello" });
    if (!sendResult.id) errors.push("sendEmail should return id");

    return {
      providerType: "Email",
      success: errors.length === 0,
      errors,
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  } catch (error) {
    return {
      providerType: "Email",
      success: false,
      errors: [...errors, error instanceof Error ? error.message : String(error)],
      metrics: { recordsProcessed: 0, recordsFailed: 0, batchCount: 0, conflictsDetected: 0 },
    };
  }
}

export async function validateAllMockProviders(): Promise<{
  results: MockValidationResult[];
  allPassed: boolean;
  totalRecords: number;
}> {
  const results = await Promise.all([
    validateERPProvider(),
    validateBankProvider(),
    validateCRMProvider(),
    validatePayrollProvider(),
    validateHRProvider(),
    validateStorageProvider(),
    validateIdentityProvider(),
    validateEmailProvider(),
  ]);

  const allPassed = results.every((r) => r.success);
  const totalRecords = results.reduce((sum, r) => sum + r.metrics.recordsProcessed, 0);

  return { results, allPassed, totalRecords };
}

export type ConnectorProvider =
  | "sap-s4hana" | "dynamics-365" | "oracle-erp" | "netsuite" | "sage-intacct"
  | "odoo" | "quickbooks-enterprise" | "xero" | "stripe" | "paypal"
  | "open-banking" | "swift" | "mt940" | "camt-053" | "iso20022"
  | "salesforce" | "hubspot" | "bamboo-hr" | "workday" | "adp"
  | "custom-rest" | "sftp" | "rest-api";

export type ConnectorCategory = "erp" | "banking" | "crm" | "hr" | "payroll" | "payment" | "file" | "messaging" | "custom";
export type AuthMethod = "oauth2" | "api-key" | "basic" | "bearer" | "mutual-tls" | "jwt" | "none";
export type ConnectionStatus = "connected" | "disconnected" | "error" | "pending" | "expired";
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
export type SyncStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type SyncType = "full" | "incremental" | "manual";
export type Severity = "error" | "warning" | "info";
export type AuditAction = "created" | "updated" | "deleted" | "synced" | "validated" | "connected" | "disconnected" | "error" | "rollback" | "imported" | "exported";
export type ValidationCategory =
  | "debit-credit" | "duplicate-invoice" | "duplicate-payment" | "duplicate-vendor"
  | "missing-gl-account" | "inactive-account" | "invalid-department" | "invalid-cost-center"
  | "invalid-currency" | "inconsistent-fx" | "orphan-record" | "invalid-date"
  | "missing-project" | "out-of-balance-journal" | "missing-field";
export type MappingSourceType = "csv" | "excel" | "erp" | "manual";
export type ConflictStatus = "open" | "resolved" | "ignored";
export type ConflictResolution = "keep-local" | "keep-remote" | "merge" | "manual";

export interface ConnectorDefinition {
  id: string;
  provider: ConnectorProvider;
  name: string;
  description: string;
  category: ConnectorCategory;
  authTypes: AuthMethod[];
  supportedModules: string[];
  capabilities: string[];
  configSchema?: Record<string, unknown>;
  isActive: boolean;
  iconUrl?: string;
  docsUrl?: string;
  version: string;
}

export interface IntegrationInstanceData {
  id: string;
  companyId: string;
  connectorDefId: string;
  name: string;
  status: ConnectionStatus;
  healthStatus: HealthStatus;
  config: Record<string, unknown>;
  authMethod: AuthMethod;
  isActive: boolean;
  lastSyncAt?: string;
  lastHealthCheckAt?: string;
  error?: string;
  version: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialData {
  id: string;
  instanceId: string;
  key: string;
  expiresAt?: string;
  rotatedAt?: string;
  version: number;
}

export interface SyncHistoryData {
  id: string;
  instanceId: string;
  companyId: string;
  syncType: SyncType;
  status: SyncStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  totalRecords: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ImportTemplateData {
  id: string;
  companyId: string;
  name: string;
  sourceType: MappingSourceType;
  mapping: FieldMapping[];
  preview?: unknown;
  isActive: boolean;
  isShared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  defaultValue?: string;
  transform?: string;
  isRequired: boolean;
  validation?: string;
  order: number;
}

export interface CsvMappingRuleData {
  id: string;
  templateId: string;
  sourceColumn: string;
  targetField: string;
  defaultValue?: string;
  transform?: string;
  isRequired: boolean;
  validation?: string;
  order: number;
}

export interface ValidationIssueData {
  id: string;
  companyId: string;
  instanceId?: string;
  syncHistoryId?: string;
  severity: Severity;
  category: ValidationCategory;
  code: string;
  message: string;
  affectedRecords?: string[];
  resolution?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface HealthData {
  id: string;
  instanceId: string;
  status: HealthStatus;
  responseTimeMs?: number;
  error?: string;
  diagnostics?: Record<string, unknown>;
  checkedAt: string;
}

export interface AuditRecord {
  id: string;
  companyId: string;
  instanceId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface LineageRecordData {
  id: string;
  companyId: string;
  instanceId: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  parentId?: string;
  lineageDepth: number;
  transformation?: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ConflictRecordData {
  id: string;
  companyId: string;
  instanceId: string;
  entityType: string;
  entityId: string;
  localValue: Record<string, unknown>;
  remoteValue: Record<string, unknown>;
  resolution?: ConflictResolution;
  resolvedBy?: string;
  resolvedAt?: string;
  status: ConflictStatus;
}

export interface BankConnectionData {
  id: string;
  instanceId: string;
  bankName: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  format: string;
  lastStatementAt?: string;
  lastSyncAt?: string;
  isActive: boolean;
}

export interface ExcelImportResult {
  totalRows: number;
  mappedRows: number;
  unmappedColumns: string[];
  detectedMapping: Record<string, string>;
  preview: Array<Record<string, string>>;
  issues: ValidationIssueData[];
}

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
  durationMs: number;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  unknown: number;
  byCategory: Record<string, { total: number; healthy: number }>;
}

export interface ConnectorCapabilityInfo {
  provider: ConnectorProvider;
  connectorDefId: string;
  name: string;
  category: ConnectorCategory;
  authTypes: AuthMethod[];
  capabilities: string[];
  modules: string[];
  status: "available" | "coming-soon" | "beta";
}

export interface SandboxDatasetData {
  id: string;
  name: string;
  description?: string;
  connectorDefId?: string;
  isActive: boolean;
  expiresAt?: string;
}

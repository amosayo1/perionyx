import type {
  BankProviderKind,
  BankingRegion,
  HealthStatus,
  ConnectionStatus,
  WebhookSubscriptionStatus,
} from "../domain/types";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL" | "EMERGENCY";

export type AlertCategory =
  | "PROVIDER_DOWN"
  | "PROVIDER_DEGRADED"
  | "CONNECTION_FAILED"
  | "CREDENTIAL_EXPIRING"
  | "CREDENTIAL_EXPIRED"
  | "SYNC_FAILED"
  | "SYNC_STALLED"
  | "BALANCE_MISMATCH"
  | "LATENCY_SPIKE"
  | "RATE_LIMIT_EXCEEDED"
  | "AUTH_FAILURE"
  | "PERMISSION_CHANGED"
  | "WEBHOOK_INACTIVE"
  | "DUPLICATE_IMPORT"
  | "ACCOUNT_DORMANT"
  | "CHECKPOINT_STALE";

export type DiagnosticIssueType =
  | "EXPIRED_CREDENTIALS"
  | "INVALID_PERMISSIONS"
  | "UNSUPPORTED_CAPABILITY"
  | "PROVIDER_OUTAGE"
  | "SYNC_FAILURE"
  | "AUTH_FAILURE"
  | "LATENCY_SPIKE"
  | "DUPLICATE_IMPORT"
  | "BALANCE_MISMATCH"
  | "WEBHOOK_INACTIVE"
  | "RATE_LIMIT_EXCEEDED"
  | "ACCOUNT_STALE";

export interface ProviderHealth {
  providerKind: BankProviderKind;
  region: BankingRegion;
  available: boolean;
  latencyMs: number | null;
  apiVersion: string;
  authStatus: "HEALTHY" | "DEGRADED" | "FAILED";
  webhookHealthy: boolean;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  capabilitiesAvailable: string[];
  capabilitiesMissing: string[];
  lastCheckedAt: string;
  error: string | null;
}

export interface ConnectionHealthStatus {
  connectionId: string;
  providerKind: BankProviderKind;
  institutionName: string;
  status: ConnectionStatus;
  credentialExpiresAt: string | null;
  credentialDaysRemaining: number | null;
  permissionStatus: "HEALTHY" | "DEGRADED" | "REVOKED" | "UNKNOWN";
  lastSuccessfulSync: string | null;
  lastFailedSync: string | null;
  failedSyncCount: number;
  healthScore: number;
  connectionAgeDays: number;
  reconnectRequired: boolean;
  lastHealthCheckAt: string;
  warnings: string[];
  errors: string[];
}

export interface AccountHealthStatus {
  accountId: string;
  connectionId: string;
  name: string;
  currency: string;
  isActive: boolean;
  isDormant: boolean;
  daysSinceLastTransaction: number | null;
  balanceStalenessMinutes: number | null;
  balanceStale: boolean;
  hasCurrencyIssues: boolean;
  hasOwnershipIssues: boolean;
  mappingComplete: boolean;
  lastTransactionAt: string | null;
  score: number;
  warnings: string[];
}

export interface SyncHealthStatus {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  successRate: number;
  queueSize: number;
  retryCount: number;
  averageDurationMs: number;
  importSpeedPerSecond: number;
  pendingJobs: number;
  runningJobs: number;
  deadLetteredJobs: number;
  checkpointsStale: number;
  checkpointsHealthy: number;
  lastSyncAt: string | null;
  status: HealthStatus;
}

export interface DiagnosticIssue {
  id: string;
  type: DiagnosticIssueType;
  severity: AlertSeverity;
  title: string;
  description: string;
  connectionId?: string;
  accountId?: string;
  providerKind?: BankProviderKind;
  detectedAt: string;
  resolvedAt: string | null;
  autoResolvable: boolean;
  metadata: Record<string, unknown>;
}

export interface DiagnosticReport {
  id: string;
  generatedAt: string;
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: DiagnosticIssue[];
  summary: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  connectionId?: string;
  accountId?: string;
  providerKind?: BankProviderKind;
  score: number;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  created: string;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  enabled: boolean;
  threshold: number;
  cooldownMinutes: number;
  description: string;
}

export interface HealthMetric {
  id: string;
  connectionId: string;
  providerKind: BankProviderKind;
  metricType: string;
  value: number;
  unit: string;
  recordedAt: string;
  labels: Record<string, string>;
}

export interface MetricAggregation {
  metricType: string;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  count: number;
  sum: number;
  period: string;
}

export interface SystemStatus {
  overall: HealthStatus;
  providers: number;
  providersHealthy: number;
  providersDegraded: number;
  providersDown: number;
  connections: number;
  connectionsHealthy: number;
  connectionsDegraded: number;
  connectionsFailed: number;
  accounts: number;
  accountsActive: number;
  accountsDormant: number;
  lastUpdated: string;
  components: Record<string, HealthStatus>;
}

export interface ProviderMonitorSnapshot {
  providerKind: BankProviderKind;
  available: boolean;
  latencyMs: number | null;
  checkedAt: string;
  error: string | null;
}

export interface ConnectionMonitorSnapshot {
  connectionId: string;
  providerKind: BankProviderKind;
  status: ConnectionStatus;
  credentialDaysRemaining: number | null;
  lastSyncAt: string | null;
  checkedAt: string;
  score: number;
}

export interface DashboardData {
  overallHealth: HealthStatus;
  overallScore: number;
  connectedProviders: number;
  connectedBanks: number;
  activeAccounts: number;
  failedConnections: number;
  pendingSyncs: number;
  alertSummary: {
    critical: number;
    warning: number;
    info: number;
    emergency: number;
  };
  regionalStatus: Array<{
    region: BankingRegion;
    status: HealthStatus;
    score: number;
    connectionCount: number;
  }>;
  providerComparison: Array<{
    providerKind: BankProviderKind;
    status: HealthStatus;
    score: number;
    latencyMs: number | null;
    connectionCount: number;
  }>;
  recentAlerts: Alert[];
  generatedAt: string;
}

export interface HealthScore {
  overall: number;
  providers: Record<string, number>;
  connections: Record<string, number>;
  institutions: Record<string, number>;
  accounts: Record<string, number>;
  regions: Record<string, number>;
  generatedAt: string;
}

export interface HistoryEntry {
  id: string;
  type: "HEALTH" | "INCIDENT" | "RECOVERY" | "OUTAGE" | "SYNC";
  timestamp: string;
  connectionId?: string;
  providerKind?: BankProviderKind;
  data: Record<string, unknown>;
  summary: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  connectionId?: string;
  providerKind?: BankProviderKind;
  startedAt: string;
  resolvedAt: string | null;
  durationMinutes: number | null;
  autoResolved: boolean;
  resolution: string | null;
}

export interface RecoveryRecord {
  id: string;
  incidentId: string;
  recoveryType: "AUTO" | "MANUAL";
  action: string;
  initiatedBy: string;
  startedAt: string;
  completedAt: string | null;
  successful: boolean;
  notes: string;
}

export interface ProviderOutageRecord {
  id: string;
  providerKind: BankProviderKind;
  region: BankingRegion;
  startedAt: string;
  resolvedAt: string | null;
  durationMinutes: number | null;
  affectedConnections: number;
  affectedAccounts: number;
  rootCause: string | null;
  resolution: string | null;
}
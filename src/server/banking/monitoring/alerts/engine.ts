import type { BankProviderKind } from "../../domain/types";
import type {
  Alert,
  AlertSeverity,
  AlertCategory,
  AlertRule,
} from "../types";
import { connectionHealthMonitor } from "../connections/engine";
import { providerMonitor } from "../providers/engine";

export interface AlertConfig {
  maxAlerts: number;
  defaultCooldownMinutes: number;
  enableAutoResolution: boolean;
}

const DEFAULT_CONFIG: AlertConfig = {
  maxAlerts: 500,
  defaultCooldownMinutes: 60,
  enableAutoResolution: true,
};

const DEFAULT_RULES: AlertRule[] = [
  { id: "rule-1", category: "PROVIDER_DOWN", severity: "EMERGENCY", enabled: true, threshold: 1, cooldownMinutes: 15, description: "Provider is completely unavailable" },
  { id: "rule-2", category: "PROVIDER_DEGRADED", severity: "WARNING", enabled: true, threshold: 1, cooldownMinutes: 30, description: "Provider performance is degraded" },
  { id: "rule-3", category: "CONNECTION_FAILED", severity: "CRITICAL", enabled: true, threshold: 1, cooldownMinutes: 30, description: "Connection has failed" },
  { id: "rule-4", category: "CREDENTIAL_EXPIRING", severity: "WARNING", enabled: true, threshold: 7, cooldownMinutes: 1440, description: "Credential will expire within N days" },
  { id: "rule-5", category: "CREDENTIAL_EXPIRED", severity: "CRITICAL", enabled: true, threshold: 1, cooldownMinutes: 60, description: "Credential has expired" },
  { id: "rule-6", category: "SYNC_FAILED", severity: "CRITICAL", enabled: true, threshold: 3, cooldownMinutes: 30, description: "Sync failure threshold exceeded" },
  { id: "rule-7", category: "SYNC_STALLED", severity: "WARNING", enabled: true, threshold: 120, cooldownMinutes: 60, description: "Sync has not completed within threshold minutes" },
  { id: "rule-8", category: "BALANCE_MISMATCH", severity: "WARNING", enabled: true, threshold: 1, cooldownMinutes: 120, description: "Balance mismatch detected during reconciliation" },
  { id: "rule-9", category: "LATENCY_SPIKE", severity: "WARNING", enabled: true, threshold: 3000, cooldownMinutes: 15, description: "Provider latency exceeds threshold" },
  { id: "rule-10", category: "RATE_LIMIT_EXCEEDED", severity: "WARNING", enabled: true, threshold: 90, cooldownMinutes: 15, description: "Rate limit usage exceeds threshold percentage" },
  { id: "rule-11", category: "AUTH_FAILURE", severity: "CRITICAL", enabled: true, threshold: 1, cooldownMinutes: 30, description: "Authentication failure detected" },
  { id: "rule-12", category: "PERMISSION_CHANGED", severity: "WARNING", enabled: true, threshold: 1, cooldownMinutes: 60, description: "Permission status has changed" },
  { id: "rule-13", category: "WEBHOOK_INACTIVE", severity: "WARNING", enabled: true, threshold: 1, cooldownMinutes: 1440, description: "Webhook subscription is inactive" },
  { id: "rule-14", category: "DUPLICATE_IMPORT", severity: "INFO", enabled: true, threshold: 10, cooldownMinutes: 60, description: "Duplicate transaction imports detected" },
  { id: "rule-15", category: "ACCOUNT_DORMANT", severity: "INFO", enabled: true, threshold: 90, cooldownMinutes: 4320, description: "Account has been dormant for N days" },
  { id: "rule-16", category: "CHECKPOINT_STALE", severity: "WARNING", enabled: true, threshold: 1, cooldownMinutes: 60, description: "Checkpoint is stale, sync may be overdue" },
];

export class AlertEngine {
  private config: AlertConfig;
  private alerts: Alert[] = [];
  private rules: AlertRule[] = DEFAULT_RULES;
  private cooldowns = new Map<string, number>();
  private counter = 0;

  constructor(config?: Partial<AlertConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  create(params: {
    severity: AlertSeverity;
    category: AlertCategory;
    title: string;
    message: string;
    connectionId?: string;
    accountId?: string;
    providerKind?: BankProviderKind;
    score?: number;
    metadata?: Record<string, unknown>;
  }): Alert | null {
    const rule = this.rules.find((r) => r.category === params.category);
    if (!rule || !rule.enabled) return null;

    const cooldownKey = this.buildCooldownKey(params.category, params.connectionId);
    const cooldownUntil = this.cooldowns.get(cooldownKey);
    if (cooldownUntil && Date.now() < cooldownUntil) return null;

    this.counter++;
    const alert: Alert = {
      id: `alert-${Date.now()}-${this.counter}`,
      severity: params.severity,
      category: params.category,
      title: params.title,
      message: params.message,
      connectionId: params.connectionId,
      accountId: params.accountId,
      providerKind: params.providerKind,
      score: params.score ?? 50,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolved: false,
      resolvedAt: null,
      created: new Date().toISOString(),
      expiresAt: null,
      metadata: params.metadata ?? {},
    };

    const maxCooldown = Math.max(this.config.defaultCooldownMinutes, rule.cooldownMinutes);
    this.cooldowns.set(cooldownKey, Date.now() + maxCooldown * 60 * 1000);

    this.alerts.push(alert);
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(-this.config.maxAlerts);
    }

    return alert;
  }

  acknowledge(alertId: string, userId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert || alert.acknowledged) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date().toISOString();
    return true;
  }

  resolve(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert || alert.resolved) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    return true;
  }

  resolveByCategory(category: AlertCategory): number {
    let resolved = 0;
    for (const alert of this.alerts) {
      if (alert.category === category && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date().toISOString();
        resolved++;
      }
    }
    return resolved;
  }

  resolveByConnection(connectionId: string): number {
    let resolved = 0;
    for (const alert of this.alerts) {
      if (alert.connectionId === connectionId && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date().toISOString();
        resolved++;
      }
    }
    return resolved;
  }

  getActive(): Alert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  getUnacknowledged(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged && !a.resolved);
  }

  getBySeverity(severity: AlertSeverity): Alert[] {
    return this.getActive().filter((a) => a.severity === severity);
  }

  getByCategory(category: AlertCategory): Alert[] {
    return this.alerts.filter((a) => a.category === category);
  }

  getByConnection(connectionId: string): Alert[] {
    return this.alerts.filter((a) => a.connectionId === connectionId);
  }

  getAllAlerts(): Alert[] {
    return this.alerts;
  }

  getAlertCount(): number {
    return this.alerts.length;
  }

  getActiveAlertCount(): number {
    return this.getActive().length;
  }

  getRule(category: AlertCategory): AlertRule | undefined {
    return this.rules.find((r) => r.category === category);
  }

  updateRule(category: AlertCategory, updates: Partial<AlertRule>): void {
    const index = this.rules.findIndex((r) => r.category === category);
    if (index >= 0) {
      this.rules[index] = { ...this.rules[index], ...updates };
    }
  }

  clearResolved(): void {
    this.alerts = this.alerts.filter((a) => !a.resolved);
  }

  clearConnection(connectionId: string): void {
    this.alerts = this.alerts.filter((a) => a.connectionId !== connectionId);
  }

  private buildCooldownKey(
    category: AlertCategory,
    connectionId?: string,
  ): string {
    return `${category}::${connectionId ?? "global"}`;
  }

  evaluateProviderAlerts(): Alert[] {
    const created: Alert[] = [];
    const unhealthyProviders = providerMonitor.getUnhealthyProviders();

    for (const provider of unhealthyProviders) {
      if (!provider.available) {
        const alert = this.create({
          severity: "EMERGENCY",
          category: "PROVIDER_DOWN",
          title: "Provider Unavailable",
          message: `${provider.providerKind} is currently unavailable`,
          providerKind: provider.providerKind,
          score: 0,
          metadata: { region: provider.region, error: provider.error },
        });
        if (alert) created.push(alert);
      } else if (provider.authStatus === "DEGRADED") {
        const alert = this.create({
          severity: "WARNING",
          category: "PROVIDER_DEGRADED",
          title: "Provider Degraded",
          message: `${provider.providerKind} performance is degraded (${provider.latencyMs}ms)`,
          providerKind: provider.providerKind,
          score: 40,
          metadata: { latencyMs: provider.latencyMs },
        });
        if (alert) created.push(alert);
      }
    }

    return created;
  }

  evaluateConnectionAlerts(): Alert[] {
    const created: Alert[] = [];
    const connections = connectionHealthMonitor.getAll();

    for (const conn of connections) {
      if (conn.healthScore < 50) {
        const alert = this.create({
          severity: "CRITICAL",
          category: "CONNECTION_FAILED",
          title: "Connection Health Critical",
          message: `Connection ${conn.connectionId} (${conn.institutionName}) has score ${conn.healthScore}`,
          connectionId: conn.connectionId,
          providerKind: conn.providerKind,
          score: conn.healthScore,
        });
        if (alert) created.push(alert);
      }

      if (
        conn.credentialDaysRemaining !== null &&
        conn.credentialDaysRemaining <= 0
      ) {
        const alert = this.create({
          severity: "CRITICAL",
          category: "CREDENTIAL_EXPIRED",
          title: "Credential Expired",
          message: `Credential for ${conn.institutionName} has expired`,
          connectionId: conn.connectionId,
          providerKind: conn.providerKind,
          score: 20,
        });
        if (alert) created.push(alert);
      } else if (
        conn.credentialDaysRemaining !== null &&
        conn.credentialDaysRemaining <= 7
      ) {
        const alert = this.create({
          severity: "WARNING",
          category: "CREDENTIAL_EXPIRING",
          title: "Credential Expiring Soon",
          message: `Credential for ${conn.institutionName} expires in ${conn.credentialDaysRemaining} days`,
          connectionId: conn.connectionId,
          providerKind: conn.providerKind,
          score: 60,
          metadata: { daysRemaining: conn.credentialDaysRemaining },
        });
        if (alert) created.push(alert);
      }
    }

    return created;
  }

  evaluateAll(): Alert[] {
    const created: Alert[] = [];
    created.push(...this.evaluateProviderAlerts());
    created.push(...this.evaluateConnectionAlerts());
    return created;
  }
}

export const alertEngine = new AlertEngine();
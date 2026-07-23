import { logger } from "@/lib/logger";
import { metrics } from "../observability/metrics";

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "firing" | "acknowledged" | "resolved";
export type AlertRuleCategory =
  | "database" | "cache" | "queue" | "system"
  | "performance" | "security" | "business" | "integration";

export interface AlertRule {
  id: string;
  name: string;
  category: AlertRuleCategory;
  severity: AlertSeverity;
  description: string;
  enabled: boolean;
  threshold: number;
  durationMs: number;
  cooldownMs: number;
  evaluate: () => Promise<{ firing: boolean; value: number; message?: string }>;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  category: AlertRuleCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  value: number;
  threshold: number;
  firedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
}

export interface AlertRuleResult {
  ruleId: string;
  ruleName: string;
  category: AlertRuleCategory;
  severity: AlertSeverity;
  firing: boolean;
  value: number;
  message?: string;
  evaluatedAt: Date;
}

let alertCounter = 0;
const activeAlerts = new Map<string, Alert>();
const alertHistory: Alert[] = [];
const MAX_HISTORY = 1000;
const rules = new Map<string, AlertRule>();

function generateAlertId(): string {
  alertCounter++;
  return `alert_${Date.now().toString(36)}_${alertCounter}`;
}

export function registerAlertRule(rule: AlertRule): void {
  rules.set(rule.id, rule);
      logger.info({ ruleId: rule.id, name: rule.name, severity: rule.severity }, "Alert rule registered");
}

export function unregisterAlertRule(ruleId: string): void {
  rules.delete(ruleId);
}

export function getAlertRules(): AlertRule[] {
  return [...rules.values()];
}

export function getAlertRule(ruleId: string): AlertRule | undefined {
  return rules.get(ruleId);
}

export function getActiveAlerts(): Alert[] {
  return [...activeAlerts.values()];
}

export function getAlertHistory(limit = 100): Alert[] {
  return alertHistory.slice(-limit);
}

export function acknowledgeAlert(alertId: string, userId?: string): boolean {
  const alert = activeAlerts.get(alertId);
  if (!alert || alert.status !== "firing") return false;
  alert.status = "acknowledged";
  alert.acknowledgedAt = new Date();
  alert.acknowledgedBy = userId;
  return true;
}

export function resolveAlert(alertId: string): boolean {
  const alert = activeAlerts.get(alertId);
  if (!alert) return false;
  alert.status = "resolved";
  alert.resolvedAt = new Date();
  activeAlerts.delete(alertId);
  alertHistory.push(alert);
  if (alertHistory.length > MAX_HISTORY) alertHistory.shift();
  return true;
}

export async function evaluateAlertRule(rule: AlertRule): Promise<AlertRuleResult> {
  try {
    const result = await rule.evaluate();
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      severity: rule.severity,
      firing: result.firing,
      value: result.value,
      message: result.message,
      evaluatedAt: new Date(),
    };
  } catch (err) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      severity: rule.severity,
      firing: true,
      value: -1,
      message: `Evaluation error: ${err instanceof Error ? err.message : String(err)}`,
      evaluatedAt: new Date(),
    };
  }
}

export async function evaluateAllRules(): Promise<AlertRuleResult[]> {
  const results: AlertRuleResult[] = [];
  const now = Date.now();

  for (const [, rule] of rules) {
    if (!rule.enabled) continue;

    const existing = [...activeAlerts.values()].find((a) => a.ruleId === rule.id);
    if (existing && now - existing.firedAt.getTime() < rule.cooldownMs) continue;

    const result = await evaluateAlertRule(rule);
    results.push(result);

    if (result.firing) {
      const alert: Alert = {
        id: generateAlertId(),
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        severity: rule.severity,
        status: "firing",
        message: result.message ?? `${rule.name} threshold exceeded: ${result.value} >= ${rule.threshold}`,
        value: result.value,
        threshold: rule.threshold,
        firedAt: new Date(),
      };

      if (!existing) {
        activeAlerts.set(alert.id, alert);
        metrics.counter("alert.fired").inc({ severity: rule.severity, category: rule.category });
        logger.warn({
          alertId: alert.id,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: alert.message,
        }, "Alert fired");
      }
    } else {
      for (const [id, alert] of activeAlerts) {
        if (alert.ruleId === rule.id && alert.status !== "resolved") {
          resolveAlert(id);
          logger.info({ alertId: id, ruleId: rule.id }, "Alert resolved");
        }
      }
    }
  }

  return results;
}

export async function clearResolvedAlerts(): Promise<number> {
  let count = 0;
  for (const [id, alert] of activeAlerts) {
    if (alert.status === "resolved") {
      activeAlerts.delete(id);
      count++;
    }
  }
  return count;
}

export function getAlertStats(): {
  total: number;
  firing: number;
  acknowledged: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const all = [...activeAlerts.values(), ...alertHistory];
  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const alert of all) {
    bySeverity[alert.severity] = (bySeverity[alert.severity] ?? 0) + 1;
    byCategory[alert.category] = (byCategory[alert.category] ?? 0) + 1;
  }

  return {
    total: all.length,
    firing: activeAlerts.size,
    acknowledged: [...activeAlerts.values()].filter((a) => a.status === "acknowledged").length,
    bySeverity,
    byCategory,
  };
}

export function registerDefaultAlertRules(): void {
  const rules: AlertRule[] = [
    {
      id: "db-connectivity",
      name: "Database Connectivity",
      category: "database",
      severity: "critical",
      description: "Database is unreachable",
      enabled: true,
      threshold: 1,
      durationMs: 30000,
      cooldownMs: 60000,
      evaluate: async () => {
        const { checkDatabaseHealth } = await import("../db/database-operations");
        const health = await checkDatabaseHealth();
        return { firing: !health.connected, value: health.connected ? 0 : 1, message: health.connected ? undefined : "Database unreachable" };
      },
    },
    {
      id: "db-query-latency",
      name: "Database Query Latency",
      category: "database",
      severity: "warning",
      description: "Average query latency exceeds threshold",
      enabled: true,
      threshold: 1000,
      durationMs: 60000,
      cooldownMs: 120000,
      evaluate: async () => {
        const { checkDatabaseHealth } = await import("../db/database-operations");
        const health = await checkDatabaseHealth();
        return { firing: health.latencyMs > 1000, value: health.latencyMs, message: `Latency: ${health.latencyMs}ms` };
      },
    },
    {
      id: "cache-connectivity",
      name: "Cache Connectivity",
      category: "cache",
      severity: "warning",
      description: "Cache provider is unreachable",
      enabled: true,
      threshold: 1,
      durationMs: 15000,
      cooldownMs: 60000,
      evaluate: async () => {
        const ping = await (await import("../cache/cache-manager")).cacheManager.ping();
        return { firing: !ping, value: ping ? 0 : 1, message: ping ? undefined : "Cache unreachable" };
      },
    },
    {
      id: "queue-backlog",
      name: "Queue Backlog",
      category: "queue",
      severity: "warning",
      description: "Queue backlog exceeds threshold",
      enabled: true,
      threshold: 10000,
      durationMs: 120000,
      cooldownMs: 300000,
      evaluate: async () => {
        return { firing: false, value: 0, message: "PgBoss managed externally" };
      },
    },
    {
      id: "queue-failed",
      name: "Queue Failed Jobs",
      category: "queue",
      severity: "warning",
      description: "Queue has excessive failed jobs",
      enabled: true,
      threshold: 100,
      durationMs: 120000,
      cooldownMs: 300000,
      evaluate: async () => {
        return { firing: false, value: 0, message: "PgBoss managed externally" };
      },
    },
    {
      id: "high-memory",
      name: "High Memory Usage",
      category: "system",
      severity: "warning",
      description: "Heap usage exceeds threshold",
      enabled: true,
      threshold: 90,
      durationMs: 60000,
      cooldownMs: 120000,
      evaluate: async () => {
        const ratio = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
        const pct = Math.round(ratio * 100);
        return { firing: pct > 90, value: pct, message: `Heap usage: ${pct}%` };
      },
    },
    {
      id: "auth-failures",
      name: "Authorization Failures",
      category: "security",
      severity: "warning",
      description: "Repeated authorization failures detected",
      enabled: true,
      threshold: 50,
      durationMs: 300000,
      cooldownMs: 600000,
      evaluate: async () => {
        const snapshot = (await import("../observability/metrics")).metrics.snapshot();
        const authFailures = snapshot.counters["auth.failures"] ?? 0;
        return { firing: authFailures > 50, value: authFailures, message: `${authFailures} auth failures` };
      },
    },
    {
      id: "system-cpu",
      name: "CPU Saturation",
      category: "system",
      severity: "warning",
      description: "CPU usage exceeds threshold",
      enabled: true,
      threshold: 80,
      durationMs: 120000,
      cooldownMs: 300000,
      evaluate: async () => {
        const { healthManager } = await import("../health/health-manager");
        const report = await healthManager.getFullHealthReport();
        const cpuUsage = report.services.find((s) => s.service === "system")?.metrics.cpuUsage ?? 0;
        return { firing: cpuUsage > 80, value: cpuUsage, message: `CPU: ${cpuUsage}%` };
      },
    },
  ];

  for (const rule of rules) {
    registerAlertRule(rule);
  }

  logger.info(`Registered ${rules.length} default alert rules`);
}

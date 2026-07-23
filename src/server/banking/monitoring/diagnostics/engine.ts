import type { BankProviderKind, BankConnection } from "../../domain/types";
import type {
  DiagnosticIssue,
  DiagnosticIssueType,
  DiagnosticReport,
  AlertSeverity,
} from "../types";
import { connectionHealthMonitor } from "../connections/engine";
import { providerMonitor } from "../providers/engine";

export class DiagnosticsEngine {
  private issues = new Map<string, DiagnosticIssue>();
  private reports: DiagnosticReport[] = [];
  private issueCounter = 0;

  async runFullDiagnostics(): Promise<DiagnosticReport> {
    const issues: DiagnosticIssue[] = [];

    const credentialIssues = this.detectExpiredCredentials();
    issues.push(...credentialIssues);

    const permissionIssues = this.detectInvalidPermissions();
    issues.push(...permissionIssues);

    const providerIssues = this.detectProviderOutages();
    issues.push(...providerIssues);

    const latencyIssues = this.detectLatencySpikes();
    issues.push(...latencyIssues);

    const authIssues = this.detectAuthFailures();
    issues.push(...authIssues);

    for (const issue of issues) {
      this.issues.set(issue.id, issue);
    }

    const report = this.generateReport(issues);
    this.reports.push(report);
    if (this.reports.length > 50) {
      this.reports.shift();
    }

    return report;
  }

  getIssue(id: string): DiagnosticIssue | null {
    return this.issues.get(id) ?? null;
  }

  getAllIssues(): DiagnosticIssue[] {
    return Array.from(this.issues.values());
  }

  getUnresolvedIssues(): DiagnosticIssue[] {
    return this.getAllIssues().filter((i) => i.resolvedAt === null);
  }

  getIssuesByType(type: DiagnosticIssueType): DiagnosticIssue[] {
    return this.getAllIssues().filter((i) => i.type === type);
  }

  getIssuesBySeverity(severity: AlertSeverity): DiagnosticIssue[] {
    return this.getAllIssues().filter((i) => i.severity === severity);
  }

  resolveIssue(id: string, resolution?: string): void {
    const issue = this.issues.get(id);
    if (issue) {
      issue.resolvedAt = new Date().toISOString();
      if (resolution) {
        issue.metadata["resolution"] = resolution;
      }
      this.issues.set(id, { ...issue });
    }
  }

  private detectExpiredCredentials(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    const connections = connectionHealthMonitor.getExpiringCredentials(0);

    for (const conn of connections) {
      this.issueCounter++;
      issues.push({
        id: `diag-${this.issueCounter}-expired-cred`,
        type: "EXPIRED_CREDENTIALS",
        severity: "CRITICAL" as AlertSeverity,
        title: "Expired Credential",
        description: `Connection ${conn.connectionId} has expired credentials`,
        connectionId: conn.connectionId,
        providerKind: conn.providerKind,
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
        autoResolvable: false,
        metadata: {
          institutionName: conn.institutionName,
          expiresAt: conn.credentialExpiresAt,
        },
      });
    }

    return issues;
  }

  private detectInvalidPermissions(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    const connections = connectionHealthMonitor.getAll();

    for (const conn of connections) {
      if (
        conn.permissionStatus === "REVOKED" ||
        conn.permissionStatus === "DEGRADED"
      ) {
        this.issueCounter++;
        issues.push({
          id: `diag-${this.issueCounter}-perm`,
          type: "INVALID_PERMISSIONS",
          severity:
            conn.permissionStatus === "REVOKED"
              ? ("CRITICAL" as AlertSeverity)
              : ("WARNING" as AlertSeverity),
          title: "Invalid Permissions",
          description: `Connection ${conn.connectionId} has ${conn.permissionStatus} permissions`,
          connectionId: conn.connectionId,
          providerKind: conn.providerKind,
          detectedAt: new Date().toISOString(),
          resolvedAt: null,
          autoResolvable: false,
          metadata: {
            permissionStatus: conn.permissionStatus,
            institutionName: conn.institutionName,
          },
        });
      }
    }

    return issues;
  }

  private detectProviderOutages(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    const unhealthyProviders = providerMonitor.getUnhealthyProviders();

    for (const provider of unhealthyProviders) {
      this.issueCounter++;
      issues.push({
        id: `diag-${this.issueCounter}-outage`,
        type: "PROVIDER_OUTAGE",
        severity: provider.authStatus === "FAILED"
          ? ("EMERGENCY" as AlertSeverity)
          : ("CRITICAL" as AlertSeverity),
        title: "Provider Outage",
        description: provider.error ?? `${provider.providerKind} is unavailable`,
        providerKind: provider.providerKind,
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
        autoResolvable: true,
        metadata: {
          region: provider.region,
          latencyMs: provider.latencyMs,
          authStatus: provider.authStatus,
        },
      });
    }

    return issues;
  }

  private detectLatencySpikes(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    const providerStates = providerMonitor.getAllProviderStates();

    for (const provider of providerStates) {
      if (
        provider.latencyMs !== null &&
        provider.latencyMs > 3000 &&
        provider.available
      ) {
        this.issueCounter++;
        issues.push({
          id: `diag-${this.issueCounter}-latency`,
          type: "LATENCY_SPIKE",
          severity: provider.latencyMs > 5000
            ? ("CRITICAL" as AlertSeverity)
            : ("WARNING" as AlertSeverity),
          title: "Latency Spike Detected",
          description: `${provider.providerKind} latency is ${provider.latencyMs}ms`,
          providerKind: provider.providerKind,
          detectedAt: new Date().toISOString(),
          resolvedAt: null,
          autoResolvable: false,
          metadata: {
            latencyMs: provider.latencyMs,
            threshold: 3000,
          },
        });
      }
    }

    return issues;
  }

  private detectAuthFailures(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    const providerStates = providerMonitor.getAllProviderStates();

    for (const provider of providerStates) {
      if (provider.authStatus === "FAILED") {
        this.issueCounter++;
        issues.push({
          id: `diag-${this.issueCounter}-auth`,
          type: "AUTH_FAILURE",
          severity: "CRITICAL" as AlertSeverity,
          title: "Authentication Failure",
          description: `${provider.providerKind} authentication has failed`,
          providerKind: provider.providerKind,
          detectedAt: new Date().toISOString(),
          resolvedAt: null,
          autoResolvable: false,
          metadata: {
            region: provider.region,
            error: provider.error,
          },
        });
      }
    }

    return issues;
  }

  private generateReport(issues: DiagnosticIssue[]): DiagnosticReport {
    const criticalCount = issues.filter(
      (i) => i.severity === "CRITICAL" || i.severity === "EMERGENCY",
    ).length;
    const warningCount = issues.filter(
      (i) => i.severity === "WARNING",
    ).length;
    const infoCount = issues.filter((i) => i.severity === "INFO").length;

    return {
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      totalIssues: issues.length,
      criticalCount,
      warningCount,
      infoCount,
      issues,
      summary:
        issues.length === 0
          ? "All systems healthy"
          : `Found ${issues.length} issues: ${criticalCount} critical, ${warningCount} warnings, ${infoCount} info`,
    };
  }

  getReportHistory(): DiagnosticReport[] {
    return this.reports;
  }

  clear(): void {
    this.issues.clear();
    this.reports = [];
  }
}

export const diagnosticsEngine = new DiagnosticsEngine();
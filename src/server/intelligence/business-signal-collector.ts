import type { Signal, SignalSource } from "./types";
import { prisma } from "@/server/db/prisma";

export class BusinessSignalCollector {
  async collectAll(companyId: string): Promise<Signal[]> {
    const results = await Promise.allSettled([
      this.collectTreasurySignals(companyId),
      this.collectApprovalSignals(companyId),
      this.collectRiskSignals(companyId),
      this.collectComplianceSignals(companyId),
      this.collectWorkflowSignals(companyId),
      this.collectAuditSignals(companyId),
      this.collectConnectorSignals(companyId),
    ]);

    const signals: Signal[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") signals.push(...result.value);
    }
    return signals;
  }

  private async collectTreasurySignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    const [walletCount, txCount, pendingTx] = await Promise.all([
      prisma.wallet.count({ where: { companyId } }),
      prisma.transaction.count({ where: { companyId, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.transaction.count({ where: { companyId, status: "PENDING" } }),
    ]);

    signals.push({ id: `treasury-wallets-${companyId}`, source: "treasury", type: "wallet_count", value: walletCount, label: "Active Wallets", timestamp: new Date().toISOString(), companyId });
    signals.push({ id: `treasury-tx30d-${companyId}`, source: "treasury", type: "transaction_volume_30d", value: txCount, label: "30-Day Transaction Volume", timestamp: new Date().toISOString(), companyId });
    signals.push({ id: `treasury-pending-${companyId}`, source: "treasury", type: "pending_transactions", value: pendingTx, label: "Pending Transactions", timestamp: new Date().toISOString(), companyId });

    if (pendingTx > 10) {
      signals.push({ id: `treasury-pending-high-${companyId}`, source: "treasury", type: "high_pending_backlog", value: pendingTx, label: "High Pending Transaction Backlog", timestamp: new Date().toISOString(), companyId, metadata: { threshold: 10 } });
    }

    return signals;
  }

  private async collectApprovalSignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];

    const [pendingApprovals, overdueApprovals] = await Promise.all([
      prisma.transactionApproval.count({ where: { transaction: { companyId }, status: "PENDING" } }),
      prisma.transactionApproval.count({
        where: { transaction: { companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } },
      }),
    ]);

    signals.push({ id: `approval-pending-${companyId}`, source: "approvals", type: "pending_approvals", value: pendingApprovals, label: "Pending Approvals", timestamp: new Date().toISOString(), companyId });
    signals.push({ id: `approval-overdue-${companyId}`, source: "approvals", type: "overdue_approvals", value: overdueApprovals, label: "Overdue Approvals (>24h)", timestamp: new Date().toISOString(), companyId });

    return signals;
  }

  private async collectRiskSignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];

    const [activeAlerts, criticalAlerts] = await Promise.all([
      prisma.riskAlert.count({ where: { companyId, status: "OPEN" } }),
      prisma.riskAlert.count({ where: { companyId, status: "OPEN", severity: "CRITICAL" } }),
    ]);

    signals.push({ id: `risk-active-${companyId}`, source: "risk", type: "active_alerts", value: activeAlerts, label: "Active Risk Alerts", timestamp: new Date().toISOString(), companyId });
    signals.push({ id: `risk-critical-${companyId}`, source: "risk", type: "critical_alerts", value: criticalAlerts, label: "Critical Risk Alerts", timestamp: new Date().toISOString(), companyId });

    return signals;
  }

  private async collectComplianceSignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];

    const [openViolations, policyCount] = await Promise.all([
      prisma.policyViolation.count({ where: { companyId, status: "OPEN" } }),
      prisma.policy.count({ where: { companyId, enabled: true } }),
    ]);

    signals.push({ id: `compliance-violations-${companyId}`, source: "compliance", type: "open_violations", value: openViolations, label: "Open Policy Violations", timestamp: new Date().toISOString(), companyId });
    signals.push({ id: `compliance-policies-${companyId}`, source: "compliance", type: "active_policies", value: policyCount, label: "Active Policies", timestamp: new Date().toISOString(), companyId });

    return signals;
  }

  private async collectWorkflowSignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];

    const [failedInstances, runningInstances] = await Promise.all([
      prisma.workflowInstance.count({ where: { companyId, status: "FAILED" } }),
      prisma.workflowInstance.count({ where: { companyId, status: "RUNNING" } }),
    ]);

    signals.push({ id: `wf-failed-${companyId}`, source: "workflow_engine", type: "failed_instances", value: failedInstances, label: "Failed Workflow Instances", timestamp: new Date().toISOString(), companyId });
    signals.push({ id: `wf-running-${companyId}`, source: "workflow_engine", type: "running_instances", value: runningInstances, label: "Running Workflow Instances", timestamp: new Date().toISOString(), companyId });

    return signals;
  }

  private async collectAuditSignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];
    const lastHour = new Date(Date.now() - 3_600_000);

    const recentAuditEvents = await prisma.auditLog.count({
      where: { companyId, createdAt: { gte: lastHour } },
    });

    signals.push({ id: `audit-recent-${companyId}`, source: "audit", type: "recent_audit_events", value: recentAuditEvents, label: "Recent Audit Events (1h)", timestamp: new Date().toISOString(), companyId });

    return signals;
  }

  private async collectConnectorSignals(companyId: string): Promise<Signal[]> {
    const signals: Signal[] = [];

    const failedRuns = await prisma.connectorRun.count({
      where: { companyId, status: "FAILED" },
    });

    signals.push({ id: `connector-failed-${companyId}`, source: "connectors", type: "failed_syncs", value: failedRuns, label: "Failed Connector Syncs", timestamp: new Date().toISOString(), companyId });

    return signals;
  }
}

export const businessSignalCollector = new BusinessSignalCollector();

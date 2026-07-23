import { prisma } from "@/server/db/prisma";
import type { TimelineEvent, TimelineSource, TimelineEventType, TimelineSeverity, TimelineEntity, TimelineQuickAction, TimelineEvidence, TimelineFilter } from "./types";
import { timelineEventRegistry } from "./timeline-event-registry";

export class TimelineAggregator {
  async aggregate(
    companyId: string,
    dateRange: { start: Date; end: Date },
    filter?: TimelineFilter,
  ): Promise<TimelineEvent[]> {
    const collectors: ((c: string, s: Date, e: Date) => Promise<TimelineEvent[]>)[] = [
      this.collectPayments.bind(this),
      this.collectWorkflows.bind(this),
      this.collectApprovals.bind(this),
      this.collectCompliance.bind(this),
      this.collectRisk.bind(this),
      this.collectPolicies.bind(this),
      this.collectAudit.bind(this),
      this.collectNotifications.bind(this),
      this.collectAutomation.bind(this),
      this.collectInvoices.bind(this),
      this.collectTreasury.bind(this),
    ];

    const results = await Promise.allSettled(
      collectors.map((c) => c(companyId, dateRange.start, dateRange.end)),
    );

    const events: TimelineEvent[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        events.push(...result.value);
      }
    }

    const filtered = filter
      ? this.applyFilter(events, filter, dateRange)
      : events;

    for (const event of filtered) {
      event.priorityScore = this.scoreEvent(event);
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  private async collectPayments(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const txs = await prisma.transaction.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return txs.map((tx): TimelineEvent => {
      const isHigh = tx.status === "FAILED" || tx.status === "PENDING_APPROVAL";
      return this.createEvent({
        id: `payment-${tx.id}`,
        type: this.mapPaymentType(tx.status),
        title: `${tx.type} ${tx.status.replace(/_/g, " ").toLowerCase()}`,
        summary: `${tx.type} of ${tx.primaryAmount} ${tx.currency} ${tx.reference ? `(${tx.reference})` : ""}`,
        businessImpact: `${tx.primaryAmount} ${tx.currency} ${tx.status === "FAILED" ? "at risk" : "processed"}`,
        severity: isHigh ? "high" : "medium",
        source: "payments",
        timestamp: tx.createdAt.toISOString(),
        entities: [{ type: "PAYMENT", id: tx.id, label: tx.reference ?? tx.id }],
        quickActions: isHigh ? [{ id: `qa-pay-${tx.id}`, label: "Review payment", action: "navigate", url: `/transactions/${tx.id}` }] : [],
        evidence: [{ source: "Transaction", snippet: `${tx.primaryAmount} ${tx.currency} - ${tx.status}` }],
        metadata: { amount: tx.primaryAmount.toString(), currency: tx.currency, type: tx.type, status: tx.status },
      });
    });
  }

  private async collectWorkflows(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const instances = await prisma.workflowInstance.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return instances.map((inst): TimelineEvent => {
      const failed = inst.status === "FAILED";
      return this.createEvent({
        id: `workflow-${inst.id}`,
        type: this.mapWorkflowType(inst.status),
        title: `Workflow ${inst.status.toLowerCase()}`,
        summary: `${inst.currentStepType ?? "Unknown"} workflow ${failed ? inst.lastError ?? "" : ""}`.trim(),
        businessImpact: failed ? `Workflow failed after ${inst.errorCount} errors` : `Workflow ${inst.status.toLowerCase()}`,
        severity: failed ? "high" : inst.status === "PAUSED" ? "medium" : "low",
        source: "workflow_engine",
        timestamp: inst.createdAt.toISOString(),
        entities: [{ type: "WORKFLOW_INSTANCE", id: inst.id, label: `Instance ${inst.id.slice(0, 8)}` }],
        quickActions: failed ? [{ id: `qa-wf-${inst.id}`, label: "View workflow", action: "navigate", url: `/workflows/${inst.id}` }] : [],
        evidence: [{ source: "WorkflowInstance", snippet: `Status: ${inst.status} | Errors: ${inst.errorCount}` }],
        metadata: { status: inst.status, errorCount: inst.errorCount, currentStepType: inst.currentStepType },
      });
    });
  }

  private async collectApprovals(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const approvals = await prisma.transactionApproval.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return approvals.map((a): TimelineEvent => {
      const escalated = a.status === "PENDING" && a.level > 1;
      return this.createEvent({
        id: `approval-${a.id}`,
        type: a.rejectionReason ? "PAYMENT_REJECTED" : "APPROVAL_COMPLETED",
        title: a.rejectionReason ? "Payment Rejected" : a.approvingUserId ? "Payment Approved" : "Approval Requested",
        summary: a.rejectionReason ? `Rejected: ${a.rejectionReason}` : `Level ${a.level} approval ${a.approvingUserId ? "completed" : "pending"}`,
        businessImpact: a.rejectionReason ? "Payment blocked" : a.approvingUserId ? "Payment authorized" : "Awaiting decision",
        severity: a.rejectionReason ? "high" : escalated ? "medium" : "low",
        source: "approvals",
        timestamp: (a.approvedAt ?? a.createdAt).toISOString(),
        entities: [{ type: "APPROVAL", id: a.id, label: `Approval level ${a.level}` }, { type: "PAYMENT", id: a.transactionId, label: a.transactionId }],
        quickActions: a.approvingUserId ? [] : [{ id: `qa-app-${a.id}`, label: "Review approval", action: "navigate", url: `/approvals/${a.id}` }],
        evidence: [{ source: "TransactionApproval", snippet: `Status: ${a.status} | Level: ${a.level}` }],
        metadata: { status: a.status, level: a.level, approvingUserId: a.approvingUserId },
      });
    });
  }

  private async collectCompliance(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const violations = await prisma.policyViolation.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return violations.map((v): TimelineEvent => ({
      id: `compliance-${v.id}`,
      type: "COMPLIANCE_ALERT",
      title: `Compliance Alert: ${v.title}`,
      summary: v.description ?? `Policy violation (${v.severity})`,
      businessImpact: `${v.severity} severity violation requiring attention`,
      severity: v.severity.toLowerCase() as TimelineSeverity,
      source: "compliance",
      module: "Compliance",
      timestamp: v.createdAt.toISOString(),
      entities: [{ type: "COMPLIANCE_ITEM", id: v.id, label: v.title }],
      recommendedAction: v.description ?? "Review policy violation",
      quickActions: [{ id: `qa-comp-${v.id}`, label: "View details", action: "navigate", url: `/compliance/${v.id}` }],
      evidence: [{ source: "PolicyViolation", snippet: v.description ?? v.title }],
      metadata: { severity: v.severity, status: v.status, policyId: v.policyId },
      companyId,
      tags: ["compliance", v.severity.toLowerCase()],
      isRead: false,
      isDismissed: false,
      priorityScore: 0,
    }));
  }

  private async collectRisk(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const alerts = await prisma.riskAlert.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return alerts.map((a): TimelineEvent => ({
      id: `risk-${a.id}`,
      type: "RISK_DETECTED",
      title: `Risk: ${a.title}`,
      summary: a.description ?? `${a.category} risk detected`,
      businessImpact: `${a.severity} severity ${a.category} risk`,
      severity: a.severity.toLowerCase() as TimelineSeverity,
      source: "risk",
      module: "Risk Management",
      timestamp: a.createdAt.toISOString(),
      entities: [{ type: "RISK", id: a.id, label: a.title }],
      recommendedAction: `Investigate ${a.category} risk`,
      quickActions: [{ id: `qa-risk-${a.id}`, label: "Investigate", action: "investigate", url: `/risk/${a.id}` }],
      evidence: [{ source: "RiskAlert", snippet: a.description ?? a.title }],
      metadata: { severity: a.severity, category: a.category, status: a.status },
      companyId,
      tags: ["risk", a.category.toLowerCase(), a.severity.toLowerCase()],
      isRead: false,
      isDismissed: false,
      priorityScore: 0,
    }));
  }

  private async collectPolicies(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        companyId,
        createdAt: { gte: start, lte: end },
        resourceType: "Policy",
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return auditLogs.map((log): TimelineEvent => {
      const action = log.action.toLowerCase();
      let type: TimelineEventType = "POLICY_UPDATED";
      if (action.includes("create")) type = "POLICY_CREATED";
      if (action.includes("enable")) type = "POLICY_ENABLED";
      if (action.includes("disable")) type = "POLICY_DISABLED";

      return this.createEvent({
        id: `policy-${log.id}`,
        type,
        title: `Policy ${action}d`,
        summary: `${log.action} on ${log.resourceType}${log.resourceId ? ` (${log.resourceId.slice(0, 8)})` : ""}`,
        businessImpact: `Policy ${action}d — may affect transaction processing`,
        severity: action.includes("disable") ? "high" : type === "POLICY_CREATED" ? "medium" : "low",
        source: "policies",
        timestamp: log.createdAt.toISOString(),
        entities: log.resourceId ? [{ type: "POLICY", id: log.resourceId, label: log.resourceId }] : [],
        quickActions: log.resourceId ? [{ id: `qa-pol-${log.id}`, label: "View policy", action: "navigate", url: `/policies/${log.resourceId}` }] : [],
        evidence: [{ source: "AuditLog", snippet: `${log.action}: ${log.resourceType}` }],
        metadata: { action: log.action, resourceType: log.resourceType },
      });
    });
  }

  private async collectAudit(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const logs = await prisma.auditLog.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return logs.slice(0, 50).map((log): TimelineEvent => ({
      id: `audit-${log.id}`,
      type: "MONTH_END_MILESTONE",
      title: `${log.action}`,
      summary: `${log.action} on ${log.resourceType}${log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ""}`,
      businessImpact: log.severity === "CRITICAL" ? "Critical audit event" : "Audit event recorded",
      severity: log.severity === "CRITICAL" ? "critical" : log.severity === "WARNING" ? "high" : "low",
      source: "audit",
      module: "Audit",
      timestamp: log.createdAt.toISOString(),
      entities: log.resourceId ? [{ type: log.resourceType, id: log.resourceId, label: log.resourceType }] : [],
      quickActions: [],
      evidence: [{ source: "AuditLog", snippet: `${log.action} by ${log.actorUserId ?? "system"}` }],
      metadata: { action: log.action, resourceType: log.resourceType, severity: log.severity },
      companyId,
      tags: ["audit", log.severity.toLowerCase()],
      isRead: false,
      isDismissed: false,
      priorityScore: 0,
    }));
  }

  private async collectNotifications(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const notifs = await prisma.notification.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return notifs.slice(0, 50).map((n): TimelineEvent => {
      const riskEventTypes = ["RISK_ALERT_CREATED", "POLICY_VIOLATION", "CONNECTOR_FAILURE"];
      const isRisk = riskEventTypes.includes(n.eventType);

      return this.createEvent({
        id: `notif-${n.id}`,
        type: isRisk ? "CONNECTOR_FAILURE" : "COMPLIANCE_ALERT",
        title: n.title,
        summary: n.message ?? n.title,
        businessImpact: isRisk ? "Requires attention" : "Informational notification",
        severity: isRisk ? "high" : "low",
        source: "notifications",
        timestamp: n.createdAt.toISOString(),
        entities: n.userId ? [{ type: "USER", id: n.userId, label: n.userId }] : [],
        quickActions: n.link ? [{ id: `qa-notif-${n.id}`, label: "View details", action: "navigate", url: n.link }] : [],
        evidence: [{ source: "Notification", snippet: n.message ?? n.title }],
        metadata: { eventType: n.eventType, read: n.read },
      });
    });
  }

  private async collectAutomation(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const schedules = await prisma.automationSchedule.findMany({
      where: { companyId, lastRunAt: { gte: start, lte: end } },
      orderBy: { lastRunAt: "desc" },
      take: 100,
    });

    return schedules.slice(0, 50).map((s): TimelineEvent => ({
      id: `auto-${s.id}`,
      type: "AUTOMATION_TRIGGERED",
      title: `Automation: ${s.name}`,
      summary: `${s.triggerType} automation was triggered${s.nextRunAt ? ` (next: ${s.nextRunAt.toISOString()})` : ""}`,
      businessImpact: "Automation workflow executed",
      severity: "low",
      source: "automation_studio",
      module: "Automation Studio",
      timestamp: (s.lastRunAt ?? new Date()).toISOString(),
      entities: [{ type: "AUTOMATION", id: s.id, label: s.name }],
      quickActions: [{ id: `qa-auto-${s.id}`, label: "View schedule", action: "navigate", url: `/scheduler/${s.id}` }],
      evidence: [{ source: "AutomationSchedule", snippet: `${s.triggerType}: ${s.name}` }],
      metadata: { triggerType: s.triggerType, enabled: s.enabled },
      companyId,
      tags: ["automation", s.triggerType],
      isRead: false,
      isDismissed: false,
      priorityScore: 0,
    }));
  }

  private async collectInvoices(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const invoices = await prisma.accountingInvoice.findMany({
      where: { companyId, dueDate: { gte: start, lte: end } },
      orderBy: { dueDate: "desc" },
      take: 100,
    });

    return invoices.slice(0, 50).map((inv): TimelineEvent => {
      const overdue = inv.status === "Overdue" || (inv.dueDate && inv.dueDate < new Date() && inv.status !== "Paid" && inv.status !== "Void");
      return this.createEvent({
        id: `invoice-${inv.id}`,
        type: overdue ? "INVOICE_OVERDUE" : "INVOICE_PAID",
        title: overdue ? `Invoice Overdue: ${inv.docNumber ?? inv.id.slice(0, 8)}` : `Invoice Paid: ${inv.docNumber ?? inv.id.slice(0, 8)}`,
        summary: `${inv.customerName ?? "Unknown"} - ${inv.totalAmount} ${inv.currency}${overdue ? ` (due: ${inv.dueDate?.toISOString().slice(0, 10)})` : ""}`,
        businessImpact: `${inv.totalAmount} ${inv.currency} ${overdue ? "overdue" : "paid"}`,
        severity: overdue ? "high" : "low",
        source: "invoices",
        timestamp: (inv.dueDate ?? new Date()).toISOString(),
        entities: [{ type: "INVOICE", id: inv.id, label: inv.docNumber ?? inv.id }],
        quickActions: overdue ? [{ id: `qa-inv-${inv.id}`, label: "View invoice", action: "navigate", url: `/invoices/${inv.id}` }] : [],
        evidence: [{ source: "AccountingInvoice", snippet: `${inv.totalAmount} ${inv.currency} - ${inv.status}` }],
        metadata: { amount: inv.totalAmount.toString(), currency: inv.currency, status: inv.status, customerName: inv.customerName },
      });
    });
  }

  private async collectTreasury(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<TimelineEvent[]> {
    const transfers = await prisma.internalTransfer.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return transfers.slice(0, 50).map((t): TimelineEvent => {
      const failed = t.status === "FAILED";
      return this.createEvent({
        id: `treasury-${t.id}`,
        type: failed ? "PAYMENT_FAILED" : "TREASURY_BALANCE_CHANGED",
        title: failed ? `Transfer Failed: ${t.reference ?? t.id.slice(0, 8)}` : `Transfer: ${t.amount} ${t.currency}`,
        summary: `${t.amount} ${t.currency} ${t.fromAccountId.slice(0, 8)} → ${t.toAccountId.slice(0, 8)}${t.description ? ` (${t.description})` : ""}`,
        businessImpact: `${t.amount} ${t.currency} ${failed ? "transfer failed" : "transferred"}`,
        severity: failed ? "high" : "medium",
        source: "treasury",
        timestamp: t.createdAt.toISOString(),
        entities: [
          { type: "TREASURY_ACCOUNT", id: t.fromAccountId, label: t.fromAccountId },
          { type: "TREASURY_ACCOUNT", id: t.toAccountId, label: t.toAccountId },
        ],
        quickActions: failed ? [{ id: `qa-treas-${t.id}`, label: "Review transfer", action: "navigate", url: `/treasury` }] : [],
        evidence: [{ source: "InternalTransfer", snippet: `${t.amount} ${t.currency}: ${t.status}` }],
        metadata: { amount: t.amount.toString(), currency: t.currency, status: t.status },
      });
    });
  }

  private mapPaymentType(status: string): TimelineEventType {
    switch (status) {
      case "COMPLETED": return "PAYMENT_COMPLETED";
      case "FAILED": return "PAYMENT_FAILED";
      case "PENDING_APPROVAL": return "PAYMENT_APPROVED";
      case "REVERSED": case "CANCELLED": return "PAYMENT_REJECTED";
      default: return "PAYMENT_COMPLETED";
    }
  }

  private mapWorkflowType(status: string): TimelineEventType {
    switch (status) {
      case "COMPLETED": return "WORKFLOW_COMPLETED";
      case "FAILED": return "WORKFLOW_FAILED";
      case "RUNNING": return "WORKFLOW_STARTED";
      case "PAUSED": return "WORKFLOW_PAUSED";
      default: return "WORKFLOW_STARTED";
    }
  }

  private createEvent(data: {
    id: string;
    type: TimelineEventType;
    title: string;
    summary: string;
    businessImpact: string;
    severity: TimelineSeverity;
    source: TimelineSource;
    timestamp: string;
    entities: TimelineEntity[];
    quickActions: TimelineQuickAction[];
    evidence: TimelineEvidence[];
    metadata: Record<string, unknown>;
  }): TimelineEvent {
    const def = timelineEventRegistry.get(data.type);
    return {
      ...data,
      module: def?.label ?? data.source,
      companyId: "",
      tags: [data.source],
      isRead: false,
      isDismissed: false,
      priorityScore: 0,
      recommendedAction: data.severity === "critical" || data.severity === "high"
        ? `${def?.label ?? data.source} requires attention`
        : undefined,
    };
  }

  private applyFilter(
    events: TimelineEvent[],
    filter: TimelineFilter,
    _dateRange: { start: Date; end: Date },
  ): TimelineEvent[] {
    let result = [...events];

    if (filter.modules && filter.modules.length > 0) {
      result = result.filter((e) => filter.modules!.includes(e.source));
    }
    if (filter.severities && filter.severities.length > 0) {
      result = result.filter((e) => filter.severities!.includes(e.severity));
    }
    if (filter.types && filter.types.length > 0) {
      result = result.filter((e) => filter.types!.includes(e.type));
    }
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter((e) => filter.tags!.some((t) => e.tags.includes(t)));
    }

    return result;
  }

  private scoreEvent(event: TimelineEvent): number {
    const severityScores: Record<TimelineSeverity, number> = {
      critical: 100, high: 70, medium: 40, low: 20, informational: 5,
    };
    let score = severityScores[event.severity] ?? 10;

    const ageHours = (Date.now() - new Date(event.timestamp).getTime()) / 3_600_000;
    score += Math.max(0, 10 - ageHours);

    if (event.quickActions.length > 0) score += 5;
    if (!event.isRead) score += 15;

    return Math.round(score);
  }
}

export const timelineAggregator = new TimelineAggregator();

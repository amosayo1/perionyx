import { prisma as defaultPrisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import type { NotificationService as NotificationServiceType } from "@/modules/notifications";
import { NotificationService as DefaultNotificationService } from "@/modules/notifications";
import type { DbClient } from "@/lib/db/types";

export type RiskAlertSummary = {
  id: string;
  category: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  source: string | null;
  resourceType: string | null;
  resourceId: string | null;
  createdAt: string;
};

export type IncidentSummary = {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  alertCount: number;
  createdAt: string;
};

export class RiskService {
  constructor(
    private prisma: DbClient = defaultPrisma,
    private notificationService: NotificationServiceType = DefaultNotificationService as any,
  ) {}

  async createAlert(ctx: TenantContext, data: {
    category: string; severity?: string; title: string; description?: string;
    source?: string; resourceType?: string; resourceId?: string; metadata?: Record<string, any>;
  }) {
    const alert = await this.prisma.riskAlert.create({
      data: {
        companyId: ctx.companyId, category: data.category as any,
        severity: (data.severity as any) ?? "MEDIUM", title: data.title,
        description: data.description, source: data.source,
        resourceType: data.resourceType, resourceId: data.resourceId,
        metadata: (data.metadata ?? null) as any,
      },
    });

    try {
      await recordAudit(this.prisma, {
        companyId: ctx.companyId, actorUserId: ctx.userId,
        action: "RISK_ALERT_CREATED", resourceType: "RiskAlert", resourceId: alert.id,
        metadata: { category: data.category, severity: data.severity, title: data.title },
      });
    } catch {
      // audit is best-effort
    }

    try {
      await this.notificationService.broadcast({
        companyId: ctx.companyId, eventType: "RISK_ALERT_CREATED",
        title: `Risk alert: ${data.title}`,
        message: data.description ?? undefined,
        link: `/risk/${alert.id}`,
        metadata: { severity: data.severity ?? "MEDIUM", category: data.category },
      });
    } catch {
      // notification is best-effort
    }

    return alert;
  }

  async listAlerts(ctx: TenantContext, opts: {
    status?: string; severity?: string; category?: string; limit?: number; cursor?: string;
  }) {
    const where: any = { companyId: ctx.companyId };
    if (opts.status) where.status = opts.status;
    if (opts.severity) where.severity = opts.severity;
    if (opts.category) where.category = opts.category;

    const limit = opts.limit ?? 50;
    const rows = await this.prisma.riskAlert.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) { rows.pop(); nextCursor = rows[rows.length - 1]?.id; }

    return {
      items: rows.map((a) => ({
        id: a.id, category: a.category, severity: a.severity, status: a.status,
        title: a.title, description: a.description, source: a.source,
        resourceType: a.resourceType, resourceId: a.resourceId,
        createdAt: a.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async getAlert(ctx: TenantContext, alertId: string) {
    const alert = await this.prisma.riskAlert.findFirst({
      where: { id: alertId, companyId: ctx.companyId },
    });
    if (!alert) return null;
    return {
      ...alert, metadata: alert.metadata as Record<string, any> | null,
      acknowledgedAt: alert.acknowledgedAt?.toISOString() ?? null,
      resolvedAt: alert.resolvedAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
    };
  }

  async acknowledgeAlert(ctx: TenantContext, alertId: string) {
    const alert = await this.prisma.riskAlert.findFirst({
      where: { id: alertId, companyId: ctx.companyId },
    });
    if (!alert) return null;

    const updated = await this.prisma.riskAlert.update({
      where: { id: alertId },
      data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date(), acknowledgedByUserId: ctx.userId },
    });

    await recordAudit(this.prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "RISK_ALERT_ACKNOWLEDGED", resourceType: "RiskAlert", resourceId: alertId,
    });

    return updated;
  }

  async resolveAlert(ctx: TenantContext, alertId: string) {
    const alert = await this.prisma.riskAlert.findFirst({
      where: { id: alertId, companyId: ctx.companyId },
    });
    if (!alert) return null;

    const updated = await this.prisma.riskAlert.update({
      where: { id: alertId },
      data: { status: "RESOLVED", resolvedAt: new Date(), resolvedByUserId: ctx.userId },
    });

    await recordAudit(this.prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "RISK_ALERT_RESOLVED", resourceType: "RiskAlert", resourceId: alertId,
    });

    await this.notificationService.broadcast({
      companyId: ctx.companyId, eventType: "RISK_ALERT_RESOLVED",
      title: `Risk alert resolved: ${alert.title}`,
      link: `/risk/${alertId}`,
    });

    return updated;
  }

  async autoGenerateAlerts(ctx: TenantContext) {
    const alerts: any[] = [];

    const failedReconciliations = await this.prisma.reconciliationRun.count({
      where: { companyId: ctx.companyId, status: "FAILED", createdAt: { gte: new Date(Date.now() - 86400000) } },
    });
    if (failedReconciliations > 0) {
      alerts.push({
        category: "FAILED_RECONCILIATION", severity: "HIGH",
        title: `${failedReconciliations} reconciliation run(s) failed in the last 24 hours`,
        source: "ReconciliationEngine",
      });
    }

    const openExceptions = await this.prisma.reconciliationException.count({
      where: { companyId: ctx.companyId, resolved: false },
    });
    if (openExceptions > 5) {
      alerts.push({
        category: "FAILED_RECONCILIATION", severity: openExceptions > 20 ? "CRITICAL" : "HIGH",
        title: `${openExceptions} unresolved reconciliation exceptions`,
        source: "ReconciliationEngine",
      });
    }

    const failedConnectors = await this.prisma.connectorRun.count({
      where: { companyId: ctx.companyId, status: "FAILED", createdAt: { gte: new Date(Date.now() - 86400000) } },
    });
    if (failedConnectors > 0) {
      alerts.push({
        category: "CONNECTOR_FAILURE", severity: failedConnectors > 5 ? "CRITICAL" : "HIGH",
        title: `${failedConnectors} connector run(s) failed in the last 24 hours`,
        source: "ConnectorFramework",
      });
    }

    const negativeWallets = await this.prisma.wallet.findMany({
      where: { companyId: ctx.companyId, kind: "STANDARD", balance: { lt: 0 } },
    });
    if (negativeWallets.length > 0) {
      alerts.push({
        category: "BALANCE_ANOMALY", severity: "CRITICAL",
        title: `${negativeWallets.length} wallet(s) have negative balances`,
        description: negativeWallets.map((w) => `${w.name} (${w.id})`).join(", "),
        source: "LedgerSystem",
      });
    }

    for (const a of alerts) {
      const existing = await this.prisma.riskAlert.findFirst({
        where: { companyId: ctx.companyId, title: a.title, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      });
      if (!existing) {
        await this.prisma.riskAlert.create({
          data: { companyId: ctx.companyId, ...a },
        });
      }
    }
  }

  async listIncidents(ctx: TenantContext, opts: { status?: string; severity?: string; limit?: number; cursor?: string }) {
    const where: any = { companyId: ctx.companyId };
    if (opts.status) where.status = opts.status;
    if (opts.severity) where.severity = opts.severity;

    const limit = opts.limit ?? 50;
    const rows = await this.prisma.riskIncident.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) { rows.pop(); nextCursor = rows[rows.length - 1]?.id; }

    return {
      items: rows.map((i) => ({
        id: i.id, title: i.title, severity: i.severity, status: i.status,
        category: i.category, alertCount: i.alerts.length, createdAt: i.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async getIncident(ctx: TenantContext, incidentId: string) {
    const incident = await this.prisma.riskIncident.findFirst({
      where: { id: incidentId, companyId: ctx.companyId },
    });
    if (!incident) return null;
    return {
      ...incident, timeline: incident.timeline as any[] | null,
      createdAt: incident.createdAt.toISOString(),
    };
  }

  async getRiskSummary(ctx: TenantContext) {
    const openAlerts = await this.prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: { in: ["OPEN", "ACKNOWLEDGED"] } } });
    const criticalAlerts = await this.prisma.riskAlert.count({ where: { companyId: ctx.companyId, severity: "CRITICAL", status: { in: ["OPEN", "ACKNOWLEDGED"] } } });
    const highAlerts = await this.prisma.riskAlert.count({ where: { companyId: ctx.companyId, severity: "HIGH", status: { in: ["OPEN", "ACKNOWLEDGED"] } } });
    const openIncidents = await this.prisma.riskIncident.count({ where: { companyId: ctx.companyId, status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } } });

    const categories = await this.prisma.riskAlert.groupBy({
      by: ["category"],
      where: { companyId: ctx.companyId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      _count: true,
    });

    return {
      openAlerts, criticalAlerts, highAlerts, openIncidents,
      byCategory: Object.fromEntries(categories.map((c) => [c.category, c._count])),
    };
  }
}

export const riskService = new RiskService();

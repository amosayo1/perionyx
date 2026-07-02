import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";

export type ConnectorRunSummary = {
  id: string;
  connectorId: string;
  connectorName: string;
  connectorType: string;
  status: string;
  event: string;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type ConnectorEventSummary = {
  id: string;
  runId: string;
  type: string;
  message: string;
  metadata: Record<string, any> | null;
  timestamp: string;
};

export class ConnectorRunService {
  static async listConnectors(ctx: TenantContext) {
    const connectors = await prisma.connectorConfig.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { name: "asc" },
    });

    return Promise.all(connectors.map(async (c) => ({
      id: c.id, name: c.name, type: c.type, active: c.active,
      config: c.config as Record<string, any>,
      lastRun: await prisma.connectorRun.findFirst({
        where: { connectorId: c.id },
        orderBy: { createdAt: "desc" },
        select: { status: true, createdAt: true },
      }),
      runCount: await prisma.connectorRun.count({ where: { connectorId: c.id } }),
      createdAt: c.createdAt.toISOString(),
    })));
  }

  static async getConnector(ctx: TenantContext, connectorId: string) {
    const connector = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId: ctx.companyId },
    });
    if (!connector) return null;

    return {
      ...connector,
      config: connector.config as Record<string, any>,
      createdAt: connector.createdAt.toISOString(),
    };
  }

  static async listRuns(ctx: TenantContext, opts: {
    connectorId?: string; status?: string; limit?: number; cursor?: string;
  }) {
    const where: any = { companyId: ctx.companyId };
    if (opts.connectorId) where.connectorId = opts.connectorId;
    if (opts.status) where.status = opts.status;

    const limit = opts.limit ?? 50;
    const rows = await prisma.connectorRun.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
      include: { connector: { select: { name: true, type: true } } },
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) { rows.pop(); nextCursor = rows[rows.length - 1]?.id; }

    return {
      items: rows.map((r) => ({
        id: r.id, connectorId: r.connectorId, connectorName: r.connector.name,
        connectorType: r.connector.type, status: r.status, event: r.event,
        error: r.error, startedAt: r.startedAt?.toISOString() ?? null,
        completedAt: r.completedAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  static async getRun(ctx: TenantContext, runId: string) {
    const run = await prisma.connectorRun.findFirst({
      where: { id: runId, companyId: ctx.companyId },
      include: { connector: { select: { name: true, type: true } }, events: { orderBy: { timestamp: "asc" } } },
    });
    if (!run) return null;

    return {
      ...run,
      input: run.input as Record<string, any> | null,
      output: run.output as Record<string, any> | null,
      startedAt: run.startedAt?.toISOString() ?? null,
      completedAt: run.completedAt?.toISOString() ?? null,
      createdAt: run.createdAt.toISOString(),
      events: run.events.map((e) => ({
        id: e.id, type: e.type, message: e.message,
        metadata: e.metadata as Record<string, any> | null,
        timestamp: e.timestamp.toISOString(),
      })),
    };
  }

  static async createRun(ctx: TenantContext, connectorId: string, event: string, input?: Record<string, any>) {
    const connector = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId: ctx.companyId },
    });
    if (!connector) return null;

    const run = await prisma.connectorRun.create({
      data: {
        connectorId, companyId: ctx.companyId,
        status: "PENDING", event, input: (input ?? null) as any,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "CONNECTOR_RUN_CREATED", resourceType: "ConnectorRun", resourceId: run.id,
      metadata: { connectorId, connectorName: connector.name, event },
    });

    return run;
  }

  static async completeRun(ctx: TenantContext, runId: string, output: Record<string, any>) {
    const run = await prisma.connectorRun.findFirst({
      where: { id: runId, companyId: ctx.companyId },
    });
    if (!run) return null;

    return prisma.connectorRun.update({
      where: { id: runId },
      data: { status: "COMPLETED", output, completedAt: new Date() },
    });
  }

  static async failRun(ctx: TenantContext, runId: string, error: string) {
    const run = await prisma.connectorRun.findFirst({
      where: { id: runId, companyId: ctx.companyId },
    });
    if (!run) return null;

    return prisma.connectorRun.update({
      where: { id: runId },
      data: { status: "FAILED", error, completedAt: new Date() },
    });
  }

  static async addEvent(ctx: TenantContext, runId: string, data: {
    type: string; message: string; metadata?: Record<string, any>;
  }) {
    const run = await prisma.connectorRun.findFirst({
      where: { id: runId, companyId: ctx.companyId },
    });
    if (!run) return null;

    return prisma.connectorEvent.create({
      data: {
        runId, connectorId: run.connectorId, companyId: ctx.companyId,
        type: data.type, message: data.message, metadata: (data.metadata ?? null) as any,
      },
    });
  }

  static async listEvents(ctx: TenantContext, opts: {
    runId?: string; connectorId?: string; limit?: number;
  }) {
    const where: any = { companyId: ctx.companyId };
    if (opts.runId) where.runId = opts.runId;
    if (opts.connectorId) where.connectorId = opts.connectorId;

    const rows = await prisma.connectorEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: opts.limit ?? 100,
    });

    return rows.map((e) => ({
      id: e.id, runId: e.runId, type: e.type, message: e.message,
      metadata: e.metadata as Record<string, any> | null,
      timestamp: e.timestamp.toISOString(),
    }));
  }

  static async getConnectorHealth(ctx: TenantContext) {
    const totalConnectors = await prisma.connectorConfig.count({
      where: { companyId: ctx.companyId, active: true },
    });

    const recentRuns = await prisma.connectorRun.count({
      where: { companyId: ctx.companyId, createdAt: { gte: new Date(Date.now() - 86400000) } },
    });

    const failedRuns = await prisma.connectorRun.count({
      where: { companyId: ctx.companyId, status: "FAILED", createdAt: { gte: new Date(Date.now() - 86400000) } },
    });

    const lastRun = await prisma.connectorRun.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      include: { connector: { select: { name: true } } },
    });

    return {
      totalConnectors,
      activeConnectors: totalConnectors,
      recentRuns,
      failedRuns24h: failedRuns,
      successRate: recentRuns > 0 ? Math.round(((recentRuns - failedRuns) / recentRuns) * 100) : 100,
      lastRunAt: lastRun?.createdAt.toISOString() ?? null,
      lastRunConnector: lastRun?.connector.name ?? null,
      health: failedRuns === 0 ? "GOOD" : failedRuns > 5 ? "CRITICAL" : "WARNING",
    };
  }
}

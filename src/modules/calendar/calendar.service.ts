import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";

export type CalendarEventSummary = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  status: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
};

export class CalendarService {
  static async listEvents(ctx: TenantContext, opts: {
    type?: string; status?: string; from?: string; to?: string; limit?: number; cursor?: string;
  }) {
    const where: any = { companyId: ctx.companyId };
    if (opts.type) where.type = opts.type;
    if (opts.status) where.status = opts.status;
    if (opts.from || opts.to) {
      where.startDate = {};
      if (opts.from) where.startDate.gte = new Date(opts.from);
      if (opts.to) where.startDate.lte = new Date(opts.to);
    }

    const limit = opts.limit ?? 100;
    const rows = await prisma.calendarEvent.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) { rows.pop(); nextCursor = rows[rows.length - 1]?.id; }

    return {
      items: rows.map((e) => ({
        id: e.id, title: e.title, description: e.description, type: e.type,
        startDate: e.startDate.toISOString(), endDate: e.endDate?.toISOString() ?? null,
        allDay: e.allDay, status: e.status,
        referenceType: e.referenceType, referenceId: e.referenceId,
        createdAt: e.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  static async createEvent(ctx: TenantContext, data: {
    title: string; description?: string; type: string;
    startDate: string; endDate?: string; allDay?: boolean;
    referenceType?: string; referenceId?: string; metadata?: Record<string, any>;
  }) {
    const event = await prisma.calendarEvent.create({
      data: {
        companyId: ctx.companyId, title: data.title, description: data.description,
        type: data.type as any, startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        allDay: data.allDay ?? true, referenceType: data.referenceType,
        referenceId: data.referenceId, metadata: (data.metadata ?? null) as any,
        createdByUserId: ctx.userId,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "CALENDAR_EVENT_CREATED", resourceType: "CalendarEvent", resourceId: event.id,
      metadata: { title: data.title, type: data.type, startDate: data.startDate },
    });

    return {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
    };
  }

  static async autoGenerateEvents(ctx: TenantContext) {
    const now = new Date();
    const events: Array<{
      title: string; type: string; startDate: Date; endDate?: Date;
      referenceType?: string; referenceId?: string; status?: string;
    }> = [];

    // Upcoming approval deadlines (approval rules with expiry)
    const approvalRules = await prisma.approvalRule.findMany({
      where: { companyId: ctx.companyId, enabled: true, expiresAt: { not: null } },
      take: 10,
    });
    for (const rule of approvalRules) {
      if (rule.expiresAt && rule.expiresAt > now) {
        events.push({
          title: `Approval rule expires: ${rule.name}`,
          type: "APPROVAL_DEADLINE", startDate: rule.expiresAt,
          referenceType: "ApprovalRule", referenceId: rule.id,
        });
      }
    }

    // Pending reconciliations (weekly cadence)
    const lastReconciliation = await prisma.reconciliationRun.findFirst({
      where: { companyId: ctx.companyId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });
    if (lastReconciliation) {
      const nextReconciliation = new Date(lastReconciliation.createdAt);
      nextReconciliation.setDate(nextReconciliation.getDate() + 7);
      events.push({
        title: "Scheduled reconciliation", type: "RECONCILIATION",
        startDate: nextReconciliation, status: "SCHEDULED",
      });
    }

    // Upcoming settlements
    const pendingSettlements = await prisma.settlementRecord.findMany({
      where: { companyId: ctx.companyId, status: "PENDING" },
      take: 10,
    });
    for (const s of pendingSettlements) {
      const settlementDate = new Date(s.createdAt);
      settlementDate.setDate(settlementDate.getDate() + 2);
      events.push({
        title: `Settlement: ${s.connectorName}`,
        type: "SETTLEMENT", startDate: settlementDate,
        referenceType: "SettlementRecord", referenceId: s.id,
      });
    }

    for (const e of events) {
      const existing = await prisma.calendarEvent.findFirst({
        where: { companyId: ctx.companyId, title: e.title, startDate: e.startDate, type: e.type as any },
      });
      if (!existing) {
        await prisma.calendarEvent.create({
          data: {
            companyId: ctx.companyId, title: e.title, type: e.type as any,
            startDate: e.startDate, endDate: e.endDate,
            referenceType: e.referenceType, referenceId: e.referenceId,
            status: e.status ?? "SCHEDULED", createdByUserId: ctx.userId,
          },
        });
      }
    }
  }

  static async markComplete(ctx: TenantContext, eventId: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, companyId: ctx.companyId },
    });
    if (!event) return null;

    return prisma.calendarEvent.update({
      where: { id: eventId },
      data: { status: "COMPLETED" },
    });
  }
}

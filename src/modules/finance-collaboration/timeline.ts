// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Timeline Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  TimelineEventType,
  EventSourceType,
  GetTimelineInput,
  AddTimelineEventInput,
} from "./types";

export class TimelineService {
  // ─── Timeline Events ────────────────────────────────────

  static async getTimeline(
    ctx: TenantContext,
    filters?: GetTimelineInput,
  ) {
    const where: Prisma.CollaborationTimelineWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.caseId) {
      where.financeCaseId = filters.caseId;
    }
    if (filters?.specialist) {
      where.specialistName = filters.specialist;
    }
    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }
    if (filters?.sourceType) {
      where.sourceType = filters.sourceType;
    }
    if (filters?.from || filters?.to) {
      where.createdAt = {
        ...(filters?.from ? { gte: filters.from } : {}),
        ...(filters?.to ? { lte: filters.to } : {}),
      };
    }

    const [events, total] = await Promise.all([
      prisma.collaborationTimeline.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 100,
        skip: filters?.offset ?? 0,
      }),
      prisma.collaborationTimeline.count({ where }),
    ]);

    return {
      events: events.map((e) => ({
        id: e.id,
        caseId: e.financeCaseId,
        specialist: e.specialistName,
        eventType: e.eventType as TimelineEventType,
        sourceType: e.sourceType as EventSourceType,
        title: e.eventTitle,
        description: e.eventDescription,
        metadata: (e.metadata as Record<string, unknown>) ?? {},
        createdAt: e.createdAt,
      })),
      total,
    };
  }

  static async addEvent(
    ctx: TenantContext,
    input: AddTimelineEventInput,
  ) {
    const event = await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        financeCaseId: input.caseId,
        eventType: input.eventType,
        eventTitle: input.title,
        eventDescription: input.description,
        eventSource: "system",
        sourceType: input.sourceType,
        specialistName: input.specialist,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });

    return event;
  }

  static async getTimelineByCase(
    ctx: TenantContext,
    caseId: string,
  ) {
    const events = await prisma.collaborationTimeline.findMany({
      where: {
        financeCaseId: caseId,
        companyId: ctx.companyId,
      },
      orderBy: { createdAt: "asc" },
    });

    return events.map((e) => ({
      id: e.id,
      caseId: e.financeCaseId,
      specialist: e.specialistName,
      eventType: e.eventType as TimelineEventType,
      sourceType: e.sourceType as EventSourceType,
      title: e.eventTitle,
      description: e.eventDescription,
      metadata: (e.metadata as Record<string, unknown>) ?? {},
      createdAt: e.createdAt,
    }));
  }

  static async getTimelineBySpecialist(
    ctx: TenantContext,
    specialist: string,
  ) {
    const events = await prisma.collaborationTimeline.findMany({
      where: {
        specialistName: specialist,
        companyId: ctx.companyId,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return events.map((e) => ({
      id: e.id,
      caseId: e.financeCaseId,
      specialist: e.specialistName,
      eventType: e.eventType as TimelineEventType,
      sourceType: e.sourceType as EventSourceType,
      title: e.eventTitle,
      description: e.eventDescription,
      metadata: (e.metadata as Record<string, unknown>) ?? {},
      createdAt: e.createdAt,
    }));
  }

  static async getTimelineSummary(
    ctx: TenantContext,
    dateRange?: { from?: Date; to?: Date },
  ) {
    const where: Prisma.CollaborationTimelineWhereInput = {
      companyId: ctx.companyId,
    };

    if (dateRange?.from || dateRange?.to) {
      where.createdAt = {
        ...(dateRange?.from ? { gte: dateRange.from } : {}),
        ...(dateRange?.to ? { lte: dateRange.to } : {}),
      };
    }

    const events = await prisma.collaborationTimeline.findMany({
      where,
      select: { eventType: true, sourceType: true },
    });

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const e of events) {
      byType[e.eventType] = (byType[e.eventType] ?? 0) + 1;
      bySource[e.sourceType] = (bySource[e.sourceType] ?? 0) + 1;
    }

    return {
      totalEvents: events.length,
      byType: byType as Record<TimelineEventType, number>,
      bySource: bySource as Record<EventSourceType, number>,
    };
  }
}

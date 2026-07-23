// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Audit Planning Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AuditCalendarEntry,
  GetAuditPlansInput,
  GetEngagementsInput,
  GetAuditCalendarInput,
  CreateAuditPlanInput,
  UpdateAuditPlanInput,
  CreateEngagementInput,
  UpdateEngagementInput,
  AddCalendarEventInput,
} from "./types";

export class AuditPlanningService {
  // ─── Plans ────────────────────────────────────────────────

  /**
   * Get all audit plans, optionally filtered.
   */
  static async getPlans(
    ctx: TenantContext,
    filters?: GetAuditPlansInput,
  ) {
    const where: Prisma.AuditPlanWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.planType) {
      where.planType = filters.planType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.year) {
      where.fiscalYear = filters.year;
    }

    const [plans, total] = await Promise.all([
      prisma.auditPlan.findMany({
        where,
        orderBy: [{ fiscalYear: "desc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditPlan.count({ where }),
    ]);

    return { plans, total };
  }

  /**
   * Create a new audit plan.
   */
  static async createPlan(
    ctx: TenantContext,
    input: CreateAuditPlanInput,
  ) {
    return prisma.auditPlan.create({
      data: {
        companyId: ctx.companyId,
        planName: input.title,
        planType: input.planType,
        status: "draft",
        fiscalYear: input.year,
        startDate: new Date(`${input.year}-01-01`),
        endDate: new Date(`${input.year}-12-31`),
        scope: (input.scope ?? "") as unknown as Prisma.InputJsonValue,
        riskAssessment: {} as unknown as Prisma.InputJsonValue,
        resourceAllocation: {} as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update an existing audit plan.
   */
  static async updatePlan(
    ctx: TenantContext,
    planId: string,
    input: UpdateAuditPlanInput,
  ) {
    const existing = await prisma.auditPlan.findFirst({
      where: {
        id: planId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Audit plan ${planId} not found`);
    }

    const updateData: Prisma.AuditPlanUpdateInput = {};

    if (input.title !== undefined) updateData.planName = input.title;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.scope !== undefined) updateData.scope = input.scope as unknown as Prisma.InputJsonValue;

    return prisma.auditPlan.update({
      where: { id: planId },
      data: updateData,
    });
  }

  // ─── Engagements ──────────────────────────────────────────

  /**
   * Get all engagements, optionally filtered.
   */
  static async getEngagements(
    ctx: TenantContext,
    filters?: GetEngagementsInput,
  ) {
    const where: Prisma.AuditEngagementWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.engagementType) {
      where.engagementType = filters.engagementType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.planId) {
      where.planId = filters.planId;
    }

    const [engagements, total] = await Promise.all([
      prisma.auditEngagement.findMany({
        where,
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditEngagement.count({ where }),
    ]);

    return { engagements, total };
  }

  /**
   * Create a new engagement.
   */
  static async createEngagement(
    ctx: TenantContext,
    input: CreateEngagementInput,
  ) {
    const engagementCount = await prisma.auditEngagement.count({
      where: { companyId: ctx.companyId },
    });

    return prisma.auditEngagement.create({
      data: {
        companyId: ctx.companyId,
        planId: input.planId ?? null,
        engagementNumber: `ENG-${String(engagementCount + 1).padStart(4, "0")}`,
        title: input.title,
        description: input.description,
        engagementType: input.engagementType,
        leadAuditor: input.leadAuditor ?? ctx.userId,
        teamMembers: input.teamMembers ?? [],
        startDate: input.startDate ?? new Date(),
        endDate: input.endDate ?? null,
        scope: (input.scope ?? "") as unknown as Prisma.InputJsonValue,
        objectives: (input.objectives ?? []) as unknown as Prisma.InputJsonValue,
        methodology: {} as unknown as Prisma.InputJsonValue,
        status: "planning",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update an existing engagement.
   */
  static async updateEngagement(
    ctx: TenantContext,
    engagementId: string,
    input: UpdateEngagementInput,
  ) {
    const existing = await prisma.auditEngagement.findFirst({
      where: {
        id: engagementId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Engagement ${engagementId} not found`);
    }

    const updateData: Prisma.AuditEngagementUpdateInput = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.leadAuditor !== undefined) updateData.leadAuditor = input.leadAuditor;
    if (input.teamMembers !== undefined) updateData.teamMembers = input.teamMembers;
    if (input.scope !== undefined) updateData.scope = input.scope as unknown as Prisma.InputJsonValue;
    if (input.objectives !== undefined) updateData.objectives = input.objectives as unknown as Prisma.InputJsonValue;

    return prisma.auditEngagement.update({
      where: { id: engagementId },
      data: updateData,
    });
  }

  // ─── Calendar ─────────────────────────────────────────────

  /**
   * Get audit calendar events, optionally filtered.
   */
  static async getAuditCalendar(
    ctx: TenantContext,
    filters?: GetAuditCalendarInput,
  ) {
    const where: Prisma.AuditCalendarWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.engagementId) {
      where.engagementId = filters.engagementId;
    }

    if (filters?.from || filters?.to) {
      where.startDate = {};
      if (filters.from) where.startDate.gte = filters.from;
      if (filters.to) where.startDate.lte = filters.to;
    }

    const events = await prisma.auditCalendar.findMany({
      where,
      orderBy: { startDate: "asc" },
    });

    return events.map((e) => ({
      id: e.id,
      eventType: e.eventType as any,
      title: e.eventTitle,
      description: undefined,
      eventDate: e.startDate,
      endDate: e.endDate ?? undefined,
      status: e.status as any,
      engagementId: e.engagementId ?? undefined,
      planId: undefined,
      assignee: e.attendees[0] ?? undefined,
    })) as AuditCalendarEntry[];
  }

  /**
   * Add a calendar event.
   */
  static async addCalendarEvent(
    ctx: TenantContext,
    input: AddCalendarEventInput,
  ) {
    return prisma.auditCalendar.create({
      data: {
        companyId: ctx.companyId,
        eventTitle: input.title,
        eventType: input.eventType,
        startDate: input.eventDate,
        endDate: input.endDate ?? null,
        engagementId: input.engagementId ?? null,
        attendees: input.assignee ? [input.assignee] : [],
        status: "scheduled",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Action Tracking Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type { BoardAction, CreateActionInput, UpdateActionInput, ActionListQuery } from "./types";

export class ActionTrackingService {
  static async listActions(
    ctx: TenantContext,
    query: ActionListQuery,
  ): Promise<{ actions: BoardAction[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.meetingId) where.meetingId = query.meetingId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.search) {
      where.OR = [
        { actionTitle: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.boardAction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      }),
      prisma.boardAction.count({ where }),
    ]);

    return { actions: rows as BoardAction[], total, page, limit };
  }

  static async getAction(ctx: TenantContext, id: string): Promise<BoardAction> {
    const action = await prisma.boardAction.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!action) throw new NotFoundError("Action item not found");
    return action as BoardAction;
  }

  static async createAction(ctx: TenantContext, input: CreateActionInput): Promise<BoardAction> {
    const action = await prisma.boardAction.create({
      data: {
        companyId: ctx.companyId,
        meetingId: input.meetingId,
        resolutionId: input.resolutionId,
        actionTitle: input.actionTitle,
        description: input.description,
        assignedTo: input.assignedTo,
        assignedToType: input.assignedToType ?? "human",
        priority: input.priority ?? "medium",
        status: "pending",
        dueDate: input.dueDate,
        progress: 0,
        evidenceIds: [],
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "action.created",
      resourceType: "BoardAction",
      resourceId: action.id,
      metadata: { title: action.actionTitle, assignedTo: action.assignedTo, dueDate: action.dueDate } as Prisma.InputJsonValue,
    });

    return action as BoardAction;
  }

  static async updateAction(
    ctx: TenantContext,
    id: string,
    input: UpdateActionInput,
  ): Promise<BoardAction> {
    const existing = await prisma.boardAction.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!existing) throw new NotFoundError("Action item not found");

    const updateData: Record<string, unknown> = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.progress !== undefined) updateData.progress = input.progress;
    if (input.completedAt !== undefined) updateData.completedAt = input.completedAt;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.status === "completed") {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    const action = await prisma.boardAction.update({ where: { id }, data: updateData });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "action.updated",
      resourceType: "BoardAction",
      resourceId: id,
      metadata: { changes: Object.keys(input) } as Prisma.InputJsonValue,
    });

    return action as BoardAction;
  }

  static async getOverdueActions(ctx: TenantContext): Promise<BoardAction[]> {
    const rows = await prisma.boardAction.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["pending", "in_progress"] },
        dueDate: { lt: new Date() },
      },
      orderBy: { dueDate: "asc" },
    });
    return rows as BoardAction[];
  }
}

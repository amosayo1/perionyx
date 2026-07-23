// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Board Pack Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type { GovernanceBoardPack, CreateBoardPackInput } from "./types";

export class BoardPackService {
  static async listPacks(
    ctx: TenantContext,
    query: { boardId?: string; status?: string; page?: number; limit?: number },
  ): Promise<{ packs: GovernanceBoardPack[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.status) where.status = query.status;

    const [rows, total] = await Promise.all([
      prisma.governanceBoardPack.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.governanceBoardPack.count({ where }),
    ]);

    return { packs: rows as GovernanceBoardPack[], total, page, limit };
  }

  static async getPack(ctx: TenantContext, id: string): Promise<GovernanceBoardPack> {
    const pack = await prisma.governanceBoardPack.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!pack) throw new NotFoundError("Board pack not found");
    return pack as GovernanceBoardPack;
  }

  static async createPack(ctx: TenantContext, input: CreateBoardPackInput): Promise<GovernanceBoardPack> {
    const existing = await prisma.governanceBoardPack.findFirst({
      where: { companyId: ctx.companyId, meetingId: input.meetingId },
      select: { id: true },
    });
    if (existing) throw new ConflictError("Board pack already exists for this meeting");

    const pack = await prisma.governanceBoardPack.create({
      data: {
        companyId: ctx.companyId,
        meetingId: input.meetingId,
        packTitle: input.packTitle,
        packType: input.packType ?? "regular",
        status: "assembling",
        sections: (input.sections ?? []) as Prisma.InputJsonValue,
        assembledBy: ctx.userId,
        evidenceCount: 0,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board_pack.created",
      resourceType: "GovernanceBoardPack",
      resourceId: pack.id,
      metadata: { title: pack.packTitle, meetingId: input.meetingId } as Prisma.InputJsonValue,
    });

    return pack as GovernanceBoardPack;
  }

  static async approvePack(ctx: TenantContext, packId: string): Promise<GovernanceBoardPack> {
    const pack = await prisma.governanceBoardPack.findFirst({ where: { id: packId, companyId: ctx.companyId } });
    if (!pack) throw new NotFoundError("Board pack not found");
    if (pack.status === "approved" || pack.status === "distributed") {
      throw new ConflictError("Board pack is already approved or distributed");
    }

    const updated = await prisma.governanceBoardPack.update({
      where: { id: packId },
      data: { status: "approved", approvedBy: ctx.userId, approvedAt: new Date() },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board_pack.approved",
      resourceType: "GovernanceBoardPack",
      resourceId: packId,
      metadata: { title: pack.packTitle } as Prisma.InputJsonValue,
    });

    return updated as GovernanceBoardPack;
  }

  static async distributePack(ctx: TenantContext, packId: string): Promise<GovernanceBoardPack> {
    const pack = await prisma.governanceBoardPack.findFirst({ where: { id: packId, companyId: ctx.companyId } });
    if (!pack) throw new NotFoundError("Board pack not found");
    if (pack.status !== "approved") throw new ConflictError("Board pack must be approved before distribution");

    const updated = await prisma.governanceBoardPack.update({
      where: { id: packId },
      data: { status: "distributed", distributedAt: new Date() },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board_pack.distributed",
      resourceType: "GovernanceBoardPack",
      resourceId: packId,
      metadata: { title: pack.packTitle } as Prisma.InputJsonValue,
    });

    return updated as GovernanceBoardPack;
  }
}

import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import type {
  AgentMemory as AgentMemoryType,
  MemoryType,
  CreateAgentMemoryInput,
} from "./types";

export class AgentMemory {
  static async store(
    ctx: TenantContext,
    agentId: string,
    input: CreateAgentMemoryInput,
  ): Promise<AgentMemoryType> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const now = new Date();

    const memory = await prisma.agentMemory.upsert({
      where: {
        companyId_agentId_memoryType_key: {
          companyId: ctx.companyId,
          agentId,
          memoryType: input.memoryType,
          key: input.key,
        },
      },
      create: {
        companyId: ctx.companyId,
        agentId,
        userId: input.userId ?? null,
        memoryType: input.memoryType,
        category: input.category ?? "general",
        key: input.key,
        value: input.value as Prisma.InputJsonValue,
        importance: input.importance ?? 0.5,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        accessCount: 0,
        lastAccessedAt: null,
      },
      update: {
        value: input.value as Prisma.InputJsonValue,
        importance: input.importance ?? undefined,
        category: input.category ?? undefined,
        userId: input.userId ?? undefined,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
        updatedAt: now,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "memory.stored",
      resourceType: "AgentMemory",
      resourceId: memory.id,
      metadata: {
        agentId,
        memoryType: input.memoryType,
        key: input.key,
        category: input.category ?? "general",
      } as Prisma.InputJsonValue,
    });

    return this.toMemory(memory);
  }

  static async retrieve(
    ctx: TenantContext,
    agentId: string,
    memoryType: MemoryType,
    key: string,
  ): Promise<AgentMemoryType | null> {
    const memory = await prisma.agentMemory.findUnique({
      where: {
        companyId_agentId_memoryType_key: {
          companyId: ctx.companyId,
          agentId,
          memoryType,
          key,
        },
      },
    });

    if (!memory) {
      return null;
    }

    if (memory.expiresAt && memory.expiresAt < new Date()) {
      return null;
    }

    await this.accessMemory(ctx, memory.id);

    return this.toMemory(memory);
  }

  static async search(
    ctx: TenantContext,
    agentId: string,
    query: {
      category?: string;
      importance?: { min?: number; max?: number };
      text?: string;
      memoryType?: MemoryType;
      limit?: number;
    },
  ): Promise<AgentMemoryType[]> {
    const where: Prisma.AgentMemoryWhereInput = {
      companyId: ctx.companyId,
      agentId,
      expiresAt: null,
      ...(query.category ? { category: query.category } : {}),
      ...(query.memoryType ? { memoryType: query.memoryType } : {}),
      ...(query.importance
        ? {
            importance: {
              ...(query.importance.min != null ? { gte: query.importance.min } : {}),
              ...(query.importance.max != null ? { lte: query.importance.max } : {}),
            },
          }
        : {}),
      ...(query.text
        ? {
            OR: [
              { key: { contains: query.text, mode: "insensitive" } },
              { category: { contains: query.text, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const memories = await prisma.agentMemory.findMany({
      where,
      orderBy: [{ importance: "desc" }, { accessCount: "desc" }, { createdAt: "desc" }],
      take: Math.min(query.limit ?? 50, 200),
    });

    return memories.map(this.toMemory);
  }

  static async listByType(
    ctx: TenantContext,
    agentId: string,
    memoryType: MemoryType,
    limit = 50,
  ): Promise<AgentMemoryType[]> {
    const memories = await prisma.agentMemory.findMany({
      where: {
        companyId: ctx.companyId,
        agentId,
        memoryType,
        expiresAt: null,
      },
      orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      take: Math.min(limit, 200),
    });

    return memories.map(this.toMemory);
  }

  static async listByUser(
    ctx: TenantContext,
    agentId: string,
    userId: string,
    limit = 50,
  ): Promise<AgentMemoryType[]> {
    const memories = await prisma.agentMemory.findMany({
      where: {
        companyId: ctx.companyId,
        agentId,
        userId,
        expiresAt: null,
      },
      orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      take: Math.min(limit, 200),
    });

    return memories.map(this.toMemory);
  }

  static async updateImportance(
    ctx: TenantContext,
    memoryId: string,
    importance: number,
  ): Promise<AgentMemoryType> {
    if (importance < 0 || importance > 1) {
      throw new ValidationError("Importance must be between 0 and 1");
    }

    const existing = await prisma.agentMemory.findFirst({
      where: { id: memoryId, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new NotFoundError("AgentMemory");
    }

    const updated = await prisma.agentMemory.update({
      where: { id: memoryId },
      data: { importance, updatedAt: new Date() },
    });

    return this.toMemory(updated);
  }

  static async accessMemory(ctx: TenantContext, memoryId: string): Promise<AgentMemoryType> {
    const existing = await prisma.agentMemory.findFirst({
      where: { id: memoryId, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new NotFoundError("AgentMemory");
    }

    const updated = await prisma.agentMemory.update({
      where: { id: memoryId },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return this.toMemory(updated);
  }

  static async deleteExpired(ctx: TenantContext): Promise<number> {
    const result = await prisma.agentMemory.deleteMany({
      where: {
        companyId: ctx.companyId,
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }

  static async delete(ctx: TenantContext, memoryId: string): Promise<void> {
    const existing = await prisma.agentMemory.findFirst({
      where: { id: memoryId, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new NotFoundError("AgentMemory");
    }

    await prisma.agentMemory.delete({ where: { id: memoryId } });
  }

  static async getStats(
    ctx: TenantContext,
    agentId: string,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    averageImportance: number;
    expiredCount: number;
  }> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const [allMemories, grouped, expiredCount] = await Promise.all([
      prisma.agentMemory.findMany({
        where: { companyId: ctx.companyId, agentId },
        select: { memoryType: true, importance: true },
      }),
      prisma.agentMemory.groupBy({
        by: ["memoryType"],
        where: { companyId: ctx.companyId, agentId },
        _count: { id: true },
      }),
      prisma.agentMemory.count({
        where: {
          companyId: ctx.companyId,
          agentId,
          expiresAt: { lt: new Date() },
        },
      }),
    ]);

    const byType: Record<string, number> = {};
    for (const g of grouped) {
      byType[g.memoryType] = g._count.id;
    }

    const averageImportance = allMemories.length > 0
      ? allMemories.reduce((sum, m) => sum + Number(m.importance), 0) / allMemories.length
      : 0;

    return {
      total: allMemories.length,
      byType,
      averageImportance: Math.round(averageImportance * 100) / 100,
      expiredCount,
    };
  }

  static async cleanup(ctx: TenantContext, agentId: string): Promise<number> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const now = new Date();

    const expiredResult = await prisma.agentMemory.deleteMany({
      where: {
        companyId: ctx.companyId,
        agentId,
        expiresAt: { lt: now },
      },
    });

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const staleShortTerm = await prisma.agentMemory.deleteMany({
      where: {
        companyId: ctx.companyId,
        agentId,
        memoryType: "short_term",
        importance: { lt: 0.3 },
        lastAccessedAt: { lt: thirtyDaysAgo },
      },
    });

    return expiredResult.count + staleShortTerm.count;
  }

  private static toMemory(row: {
    id: string;
    companyId: string;
    agentId: string;
    userId: string | null;
    memoryType: string;
    category: string;
    key: string;
    value: unknown;
    importance: unknown;
    accessCount: number;
    lastAccessedAt: Date | null;
    expiresAt: Date | null;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): AgentMemoryType {
    return {
      id: row.id,
      companyId: row.companyId,
      agentId: row.agentId,
      userId: row.userId,
      memoryType: row.memoryType as MemoryType,
      category: row.category,
      key: row.key,
      value: row.value,
      importance: Number(row.importance),
      accessCount: row.accessCount,
      lastAccessedAt: row.lastAccessedAt?.toISOString() ?? null,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

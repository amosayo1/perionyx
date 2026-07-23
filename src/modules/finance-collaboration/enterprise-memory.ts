// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Enterprise Memory
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  MemoryType,
  GetMemoryInput,
  StoreMemoryInput,
  MemoryEntry,
} from "./types";

export class EnterpriseMemory {
  // ─── Memory CRUD ────────────────────────────────────────

  static async getMemory(
    ctx: TenantContext,
    filters?: GetMemoryInput,
  ) {
    const where: Prisma.EnterpriseMemoryWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.memoryType) {
      where.memoryType = filters.memoryType;
    }
    if (filters?.specialist) {
      where.sourceSpecialist = filters.specialist;
    }
    if (filters?.entityKey) {
      where.contextKey = filters.entityKey;
    }
    if (filters?.caseId) {
      where.relatedEntityId = filters.caseId;
      where.relatedEntityType = "case";
    }

    const [entries, total] = await Promise.all([
      prisma.enterpriseMemory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.enterpriseMemory.count({ where }),
    ]);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        companyId: e.companyId,
        memoryType: e.memoryType as MemoryType,
        specialist: e.sourceSpecialist,
        caseId: e.relatedEntityType === "case" ? e.relatedEntityId : undefined,
        entityKey: e.contextKey,
        content: (e.contextValue as Record<string, unknown>) ?? {},
        confidence: new Prisma.Decimal(0.8),
        expiresAt: e.expiresAt,
        createdAt: e.createdAt,
      })) as MemoryEntry[],
      total,
    };
  }

  static async storeMemory(
    ctx: TenantContext,
    input: StoreMemoryInput,
  ) {
    const existing = await prisma.enterpriseMemory.findFirst({
      where: {
        companyId: ctx.companyId,
        memoryType: input.memoryType,
        contextKey: input.entityKey,
        sourceSpecialist: input.specialist ?? undefined,
        relatedEntityId: input.caseId ?? undefined,
      },
    });

    if (existing) {
      return prisma.enterpriseMemory.update({
        where: { id: existing.id },
        data: {
          contextValue: input.content as unknown as Prisma.InputJsonValue,
          expiresAt: input.expiresAt ?? existing.expiresAt,
        },
      });
    }

    return prisma.enterpriseMemory.create({
      data: {
        companyId: ctx.companyId,
        memoryType: input.memoryType,
        contextKey: input.entityKey,
        contextValue: input.content as unknown as Prisma.InputJsonValue,
        sourceSpecialist: input.specialist ?? ctx.userId,
        relatedEntityId: input.caseId,
        relatedEntityType: input.caseId ? "case" : undefined,
        expiresAt: input.expiresAt,
      },
    });
  }

  static async getContextForSpecialist(
    ctx: TenantContext,
    specialist: string,
  ) {
    const entries = await prisma.enterpriseMemory.findMany({
      where: {
        companyId: ctx.companyId,
        sourceSpecialist: specialist,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return entries.map((e) => ({
      id: e.id,
      memoryType: e.memoryType as MemoryType,
      entityKey: e.contextKey,
      content: (e.contextValue as Record<string, unknown>) ?? {},
      confidence: new Prisma.Decimal(0.8),
      createdAt: e.createdAt,
    }));
  }

  static async getContextForCase(
    ctx: TenantContext,
    caseId: string,
  ) {
    const entries = await prisma.enterpriseMemory.findMany({
      where: {
        companyId: ctx.companyId,
        relatedEntityId: caseId,
        relatedEntityType: "case",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return entries.map((e) => ({
      id: e.id,
      memoryType: e.memoryType as MemoryType,
      specialist: e.sourceSpecialist,
      entityKey: e.contextKey,
      content: (e.contextValue as Record<string, unknown>) ?? {},
      confidence: new Prisma.Decimal(0.8),
      createdAt: e.createdAt,
    }));
  }

  static async getDecisionHistory(ctx: TenantContext) {
    const entries = await prisma.enterpriseMemory.findMany({
      where: {
        companyId: ctx.companyId,
        memoryType: "decision_history",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return entries.map((e) => ({
      id: e.id,
      specialist: e.sourceSpecialist,
      entityKey: e.contextKey,
      content: (e.contextValue as Record<string, unknown>) ?? {},
      confidence: new Prisma.Decimal(0.8),
      createdAt: e.createdAt,
    }));
  }

  static async getRiskContext(ctx: TenantContext) {
    const entries = await prisma.enterpriseMemory.findMany({
      where: {
        companyId: ctx.companyId,
        memoryType: "risk_context",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return entries.map((e) => ({
      id: e.id,
      specialist: e.sourceSpecialist,
      entityKey: e.contextKey,
      content: (e.contextValue as Record<string, unknown>) ?? {},
      confidence: new Prisma.Decimal(0.8),
      createdAt: e.createdAt,
    }));
  }

  static async expireOldMemory(ctx: TenantContext) {
    const now = new Date();

    const result = await prisma.enterpriseMemory.deleteMany({
      where: {
        companyId: ctx.companyId,
        expiresAt: { lt: now },
      },
    });

    return { expiredCount: result.count };
  }
}

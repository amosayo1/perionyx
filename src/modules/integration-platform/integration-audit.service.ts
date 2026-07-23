import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { AuditAction, AuditRecord } from "./types";

export class IntegrationAuditService {
  static async record(ctx: TenantContext, data: { instanceId: string; action: AuditAction; entityType: string; entityId?: string; changes?: Record<string, unknown>; metadata?: Record<string, unknown> }): Promise<void> {
    await prisma.integrationAudit.create({
      data: { companyId: ctx.companyId, instanceId: data.instanceId, userId: ctx.userId, action: data.action, entityType: data.entityType, entityId: data.entityId, changes: (data.changes ?? {}) as any, metadata: (data.metadata ?? {}) as any, ipAddress: undefined },
    });
  }

  static async list(ctx: TenantContext, opts?: { instanceId?: string; action?: string; limit?: number; offset?: number }): Promise<{ records: AuditRecord[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.instanceId) where.instanceId = opts.instanceId;
    if (opts?.action) where.action = opts.action;
    const [records, total] = await Promise.all([
      prisma.integrationAudit.findMany({ where, orderBy: { createdAt: "desc" }, take: opts?.limit ?? 50, skip: opts?.offset ?? 0 }),
      prisma.integrationAudit.count({ where }),
    ]);
    return { records: records.map(r => ({ ...r, id: r.id, companyId: r.companyId, instanceId: r.instanceId, userId: r.userId ?? undefined, action: r.action as AuditAction, entityType: r.entityType, entityId: r.entityId ?? undefined, changes: r.changes as any as Record<string, unknown> | undefined, metadata: r.metadata as any as Record<string, unknown> | undefined, ipAddress: r.ipAddress ?? undefined, createdAt: r.createdAt.toISOString() })), total };
  }

  static async getByEntity(ctx: TenantContext, entityType: string, entityId: string): Promise<AuditRecord[]> {
    const records = await prisma.integrationAudit.findMany({ where: { companyId: ctx.companyId, entityType, entityId }, orderBy: { createdAt: "desc" } });
    return records.map(r => ({ ...r, id: r.id, companyId: r.companyId, instanceId: r.instanceId, userId: r.userId ?? undefined, action: r.action as AuditAction, entityType: r.entityType, entityId: r.entityId ?? undefined, changes: r.changes as any as Record<string, unknown> | undefined, metadata: r.metadata as any as Record<string, unknown> | undefined, ipAddress: r.ipAddress ?? undefined, createdAt: r.createdAt.toISOString() }));
  }

  static async getTimeline(ctx: TenantContext, instanceId: string): Promise<AuditRecord[]> {
    const records = await prisma.integrationAudit.findMany({ where: { companyId: ctx.companyId, instanceId }, orderBy: { createdAt: "asc" } });
return records.map(r => ({ ...r, id: r.id, companyId: r.companyId, instanceId: r.instanceId, userId: r.userId ?? undefined, action: r.action as AuditAction, entityType: r.entityType, entityId: r.entityId ?? undefined, changes: r.changes as any as Record<string, unknown> | undefined, metadata: r.metadata as any as Record<string, unknown> | undefined, ipAddress: r.ipAddress ?? undefined, createdAt: r.createdAt.toISOString() }));
}
}

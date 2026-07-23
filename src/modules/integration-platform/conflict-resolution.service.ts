import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ConflictRecordData, ConflictResolution, ConflictStatus } from "./types";

export class ConflictResolutionService {
  static async detectConflicts(ctx: TenantContext, instanceId: string, entityType: string, localData: Record<string, unknown>, remoteData: Record<string, unknown>, entityId: string): Promise<ConflictRecordData | null> {
    const diffs: string[] = [];
    for (const key of Object.keys({ ...localData, ...remoteData })) {
      if (JSON.stringify(localData[key]) !== JSON.stringify(remoteData[key])) {
        diffs.push(key);
      }
    }
    if (diffs.length === 0) return null;
    const conflict = await prisma.conflictRecord.create({
      data: { companyId: ctx.companyId, instanceId, entityType, entityId, localValue: localData as any, remoteValue: remoteData as any, status: "open" },
    });
    return this.toConflictData(conflict);
  }

  static async resolve(ctx: TenantContext, conflictId: string, resolution: ConflictResolution, resolvedBy: string): Promise<void> {
    await prisma.conflictRecord.update({
      where: { id: conflictId },
      data: { resolution, resolvedBy, resolvedAt: new Date(), status: "resolved" },
    });
  }

  static async listConflicts(ctx: TenantContext, opts?: { status?: string; instanceId?: string; limit?: number; offset?: number }): Promise<{ conflicts: ConflictRecordData[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.status) where.status = opts.status;
    if (opts?.instanceId) where.instanceId = opts.instanceId;
    const [records, total] = await Promise.all([
      prisma.conflictRecord.findMany({ where, orderBy: { createdAt: "desc" }, take: opts?.limit ?? 50, skip: opts?.offset ?? 0 }),
      prisma.conflictRecord.count({ where }),
    ]);
    return { conflicts: records.map(r => this.toConflictData(r)), total };
  }

  static async getConflict(ctx: TenantContext, conflictId: string): Promise<ConflictRecordData | null> {
    const conflict = await prisma.conflictRecord.findUnique({ where: { id: conflictId } });
    return conflict ? this.toConflictData(conflict) : null;
  }

  static async bulkResolve(ctx: TenantContext, conflictIds: string[], resolution: ConflictResolution, resolvedBy: string): Promise<number> {
    const result = await prisma.conflictRecord.updateMany({
      where: { id: { in: conflictIds }, companyId: ctx.companyId },
      data: { resolution, resolvedBy, resolvedAt: new Date(), status: "resolved" },
    });
    return result.count;
  }

  private static toConflictData(r: Record<string, unknown>): ConflictRecordData {
    return { id: r.id as string, companyId: r.companyId as string, instanceId: r.instanceId as string, entityType: r.entityType as string, entityId: r.entityId as string, localValue: r.localValue as Record<string, unknown>, remoteValue: r.remoteValue as Record<string, unknown>, resolution: r.resolution as ConflictResolution | undefined, resolvedBy: r.resolvedBy as string | undefined, resolvedAt: (r.resolvedAt as Date)?.toISOString(), status: r.status as ConflictStatus };
  }
}

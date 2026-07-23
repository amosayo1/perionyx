import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { LineageRecordData } from "./types";
import crypto from "crypto";

export class DataLineageService {
  static async recordLineage(ctx: TenantContext, data: { instanceId: string; sourceType: string; sourceId: string; targetType: string; targetId: string; parentId?: string; transformation?: string; metadata?: Record<string, unknown> }): Promise<LineageRecordData> {
    let lineageDepth = 0;
    if (data.parentId) {
      const parent = await prisma.lineageRecord.findUnique({ where: { id: data.parentId } });
      if (parent) lineageDepth = parent.lineageDepth + 1;
    }
    const checksum = crypto.createHash("sha256").update(`${data.sourceType}:${data.sourceId}:${data.targetType}:${data.targetId}:${Date.now()}`).digest("hex").slice(0, 16);
    const record = await prisma.lineageRecord.create({
      data: { companyId: ctx.companyId, instanceId: data.instanceId, sourceType: data.sourceType, sourceId: data.sourceId, targetType: data.targetType, targetId: data.targetId, parentId: data.parentId, lineageDepth, transformation: data.transformation, checksum, metadata: (data.metadata ?? {}) as any },
    });
    return this.toLineageData(record);
  }

  static async getLineageByTarget(ctx: TenantContext, targetType: string, targetId: string): Promise<LineageRecordData[]> {
    const records = await prisma.lineageRecord.findMany({
      where: { companyId: ctx.companyId, targetType, targetId },
      orderBy: { lineageDepth: "asc" },
    });
    return records.map(r => this.toLineageData(r));
  }

  static async getLineageChain(ctx: TenantContext, recordId: string): Promise<LineageRecordData[]> {
    const chain: LineageRecordData[] = [];
    let current = await prisma.lineageRecord.findUnique({ where: { id: recordId } });
    while (current) {
      chain.unshift(this.toLineageData(current));
      current = current.parentId ? await prisma.lineageRecord.findUnique({ where: { id: current.parentId } }) : null;
    }
    return chain;
  }

  static async getProvenance(ctx: TenantContext, targetType: string, targetId: string): Promise<{ sourceType: string; sourceId: string; instanceId: string; transformation?: string; checksum?: string } | null> {
    const root = await prisma.lineageRecord.findFirst({
      where: { companyId: ctx.companyId, targetType, targetId },
      orderBy: { lineageDepth: "asc" },
    });
    if (!root) return null;
    return { sourceType: root.sourceType, sourceId: root.sourceId, instanceId: root.instanceId, transformation: root.transformation ?? undefined, checksum: root.checksum ?? undefined };
  }

  static async verifyIntegrity(ctx: TenantContext, recordId: string): Promise<{ valid: boolean; error?: string }> {
    const record = await prisma.lineageRecord.findUnique({ where: { id: recordId } });
    if (!record) return { valid: false, error: "Record not found" };
    const expectedChecksum = crypto.createHash("sha256").update(`${record.sourceType}:${record.sourceId}:${record.targetType}:${record.targetId}:${record.createdAt.getTime()}`).digest("hex").slice(0, 16);
    if (record.checksum && record.checksum !== expectedChecksum) {
      return { valid: false, error: "Checksum mismatch — data integrity compromised" };
    }
    return { valid: true };
  }

  private static toLineageData(r: Record<string, unknown>): LineageRecordData {
    return { id: r.id as string, companyId: r.companyId as string, instanceId: r.instanceId as string, sourceType: r.sourceType as string, sourceId: r.sourceId as string, targetType: r.targetType as string, targetId: r.targetId as string, parentId: r.parentId as string | undefined, lineageDepth: r.lineageDepth as number, transformation: r.transformation as string | undefined, checksum: r.checksum as string | undefined, metadata: r.metadata as Record<string, unknown> | undefined, createdAt: (r.createdAt as Date).toISOString() };
  }
}

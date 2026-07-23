import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { SyncHistoryData, SyncType, SyncResult, SyncStatus } from "./types";
import { IntegrationAuditService } from "./integration-audit.service";

export class SyncEngineService {
  static async startSync(ctx: TenantContext, instanceId: string, syncType: SyncType): Promise<SyncHistoryData> {
    const record = await prisma.syncHistory.create({
      data: { instanceId, companyId: ctx.companyId, syncType, status: "running", startedAt: new Date(), totalRecords: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
    });
    await IntegrationAuditService.record(ctx, { instanceId, action: "synced", entityType: "sync-history", entityId: record.id, metadata: { syncType } });
    await prisma.integrationInstance.updateMany({ where: { id: instanceId, companyId: ctx.companyId }, data: { lastSyncAt: new Date(), version: { increment: 1 } } });
    return this.toSyncData(record);
  }

  static async completeSync(ctx: TenantContext, syncId: string, result: SyncResult): Promise<SyncHistoryData> {
    const record = await prisma.syncHistory.update({
      where: { id: syncId },
      data: { status: "completed", completedAt: new Date(), durationMs: result.durationMs, totalRecords: result.inserted + result.updated + result.skipped + result.failed, inserted: result.inserted, updated: result.updated, skipped: result.skipped, failed: result.failed, details: { errors: result.errors } },
    });
    return this.toSyncData(record);
  }

  static async failSync(ctx: TenantContext, syncId: string, error: string, partial?: Partial<SyncResult>): Promise<SyncHistoryData> {
    const record = await prisma.syncHistory.update({
      where: { id: syncId },
      data: { status: "failed", completedAt: new Date(), durationMs: partial?.durationMs, inserted: partial?.inserted ?? 0, updated: partial?.updated ?? 0, skipped: partial?.skipped ?? 0, failed: partial?.failed ?? 0, error },
    });
    await IntegrationAuditService.record(ctx, { instanceId: record.instanceId, action: "error", entityType: "sync-history", entityId: syncId, metadata: { error } });
    return this.toSyncData(record);
  }

  static async getSyncHistory(ctx: TenantContext, instanceId?: string, opts?: { limit?: number; offset?: number; status?: string }): Promise<{ history: SyncHistoryData[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (instanceId) where.instanceId = instanceId;
    if (opts?.status) where.status = opts.status;
    const [records, total] = await Promise.all([
      prisma.syncHistory.findMany({ where, orderBy: { startedAt: "desc" }, take: opts?.limit ?? 50, skip: opts?.offset ?? 0 }),
      prisma.syncHistory.count({ where }),
    ]);
    return { history: records.map(r => this.toSyncData(r)), total };
  }

  static async getSyncStats(ctx: TenantContext, instanceId: string): Promise<{ total: number; succeeded: number; failed: number; avgDuration: number }> {
    const history = await prisma.syncHistory.findMany({ where: { companyId: ctx.companyId, instanceId } });
    const total = history.length;
    const succeeded = history.filter(h => h.status === "completed").length;
    const failed = history.filter(h => h.status === "failed").length;
    const durations = history.filter(h => h.durationMs != null).map(h => h.durationMs!);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    return { total, succeeded, failed, avgDuration };
  }

  static async scheduleSync(ctx: TenantContext, instanceId: string, frequency: string): Promise<void> {
    await prisma.integrationInstance.updateMany({ where: { id: instanceId, companyId: ctx.companyId }, data: { metadata: { ...(await this.getMetadata(ctx, instanceId)), syncFrequency: frequency }, version: { increment: 1 } } });
  }

  static async unscheduleSync(ctx: TenantContext, instanceId: string): Promise<void> {
    await prisma.integrationInstance.updateMany({ where: { id: instanceId, companyId: ctx.companyId }, data: { metadata: { ...(await this.getMetadata(ctx, instanceId)), syncFrequency: null }, version: { increment: 1 } } });
  }

  private static async getMetadata(ctx: TenantContext, instanceId: string): Promise<Record<string, unknown>> {
    const inst = await prisma.integrationInstance.findFirst({ where: { id: instanceId, companyId: ctx.companyId } });
    return (inst?.metadata as Record<string, unknown>) ?? {};
  }

  private static toSyncData(r: Record<string, unknown>): SyncHistoryData {
    return { id: r.id as string, instanceId: r.instanceId as string, companyId: r.companyId as string, syncType: r.syncType as SyncType, status: r.status as SyncStatus, startedAt: (r.startedAt as Date).toISOString(), completedAt: (r.completedAt as Date)?.toISOString(), durationMs: r.durationMs as number | undefined, totalRecords: r.totalRecords as number, inserted: r.inserted as number, updated: r.updated as number, skipped: r.skipped as number, failed: r.failed as number, error: r.error as string | undefined, details: r.details as Record<string, unknown> | undefined };
  }
}

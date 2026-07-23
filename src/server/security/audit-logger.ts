import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { AuditSeverity } from "@prisma/client";

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  type: string;
  severity: "info" | "warning" | "critical";
  userId?: string;
  companyId?: string;
  action: string;
  resource?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  previousHash?: string;
  hash?: string;
}

export interface AuditLogFilter {
  companyId?: string;
  userId?: string;
  type?: string;
  action?: string;
  severity?: "info" | "warning" | "critical";
  startDate?: string;
  endDate?: string;
  search?: string;
  cursor?: string;
  take?: number;
}

export class AuditEventStore {
  private readonly algorithm = "sha256";

  async record(event: Omit<SecurityAuditEntry, "id" | "timestamp" | "hash" | "previousHash">): Promise<SecurityAuditEntry> {
    const previousHash = await this.getLatestHash(event.companyId) ?? undefined;
    const entryData = { ...event, previousHash };
    const hash = this.computeHash(entryData);

    const entry: SecurityAuditEntry = {
      ...event,
      id: `aud_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      timestamp: new Date().toISOString(),
      previousHash,
      hash,
    };

    await prisma.auditLog.create({
      data: {
        id: entry.id,
        companyId: event.companyId ?? undefined,
        actorUserId: event.userId ?? undefined,
        action: event.action,
        resourceType: event.type,
        resourceId: event.resource ?? undefined,
        severity: this.toPrismaSeverity(event.severity),
        metadata: {
          details: event.details,
          correlationId: event.correlationId,
          hash,
          previousHash,
        } as any,
        requestId: event.correlationId ?? undefined,
        payloadHash: hash,
        ipAddress: event.ip ?? undefined,
        userAgent: event.userAgent ?? undefined,
      },
    });

    return entry;
  }

  async query(filter: AuditLogFilter): Promise<{ entries: SecurityAuditEntry[]; nextCursor?: string }> {
    const take = filter.take ?? 50;
    const where: any = {};

    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.userId) where.actorUserId = filter.userId;
    if (filter.type) where.resourceType = filter.type;
    if (filter.action) where.action = filter.action;
    if (filter.severity) where.severity = this.toPrismaSeverity(filter.severity);
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
      if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
    }
    if (filter.search) {
      where.OR = [
        { action: { contains: filter.search, mode: "insensitive" } },
        { resourceType: { contains: filter.search, mode: "insensitive" } },
        { resourceId: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(filter.cursor ? { cursor: { id: filter.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > take) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    const entries: SecurityAuditEntry[] = rows.map((row) => ({
      id: row.id,
      timestamp: row.createdAt.toISOString(),
      type: row.resourceType,
      severity: this.fromPrismaSeverity(row.severity),
      userId: row.actorUserId ?? undefined,
      companyId: row.companyId ?? undefined,
      action: row.action,
      resource: row.resourceId ?? undefined,
      details: (row.metadata as any)?.details ?? undefined,
      correlationId: row.requestId ?? undefined,
      ip: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      hash: row.payloadHash ?? undefined,
    }));

    return { entries, nextCursor };
  }

  async verifyChain(companyId?: string): Promise<{ valid: boolean; breaks: number; entries: number }> {
    const where: any = {};
    if (companyId) where.companyId = companyId;

    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, payloadHash: true, metadata: true, createdAt: true },
    });

    let breaks = 0;
    let previousHash: string | null = null;

    for (const row of rows) {
      const meta = row.metadata as any;
      const storedPreviousHash = meta?.previousHash ?? null;
      if (storedPreviousHash !== previousHash) {
        breaks++;
      }
      previousHash = row.payloadHash;
    }

    return { valid: breaks === 0, breaks, entries: rows.length };
  }

  async exportCSV(filter: AuditLogFilter): Promise<string> {
    const result = await this.query({ ...filter, take: 10000 });
    const header = "ID,Timestamp,Type,Severity,User ID,Company ID,Action,Resource,Details,Correlation ID,IP,User Agent";
    const rows = result.entries.map((e) =>
      [
        e.id,
        e.timestamp,
        e.type,
        e.severity,
        e.userId ?? "",
        e.companyId ?? "",
        e.action,
        e.resource ?? "",
        (e.details ?? "").replace(/"/g, '""'),
        e.correlationId ?? "",
        e.ip ?? "",
        (e.userAgent ?? "").replace(/"/g, '""'),
      ]
        .map((v) => `"${v}"`)
        .join(","),
    );
    return [header, ...rows].join("\n");
  }

  async applyRetention(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 86400000);
    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count;
  }

  private async getLatestHash(companyId?: string): Promise<string | null> {
    const last = await prisma.auditLog.findFirst({
      where: companyId ? { companyId } : {},
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { payloadHash: true },
    });
    return last?.payloadHash ?? null;
  }

  private computeHash(entry: Partial<SecurityAuditEntry>): string {
    const data = JSON.stringify({
      action: entry.action,
      type: entry.type,
      severity: entry.severity,
      userId: entry.userId,
      companyId: entry.companyId,
      resource: entry.resource,
      details: entry.details,
      correlationId: entry.correlationId,
      ip: entry.ip,
      userAgent: entry.userAgent,
      previousHash: entry.previousHash,
      timestamp: entry.timestamp ?? new Date().toISOString(),
    });
    return crypto.createHash(this.algorithm).update(data).digest("hex");
  }

  private toPrismaSeverity(severity: "info" | "warning" | "critical"): AuditSeverity {
    switch (severity) {
      case "critical": return AuditSeverity.CRITICAL;
      case "warning": return AuditSeverity.WARNING;
      default: return AuditSeverity.INFO;
    }
  }

  private fromPrismaSeverity(severity: AuditSeverity): "info" | "warning" | "critical" {
    switch (severity) {
      case AuditSeverity.CRITICAL: return "critical";
      case AuditSeverity.WARNING: return "warning";
      default: return "info";
    }
  }
}

export class SecurityAuditLogger {
  private store: AuditEventStore;

  constructor(store?: AuditEventStore) {
    this.store = store ?? new AuditEventStore();
  }

  async log(event: Omit<SecurityAuditEntry, "id" | "timestamp" | "hash" | "previousHash">): Promise<string> {
    const entry = await this.store.record(event);
    return entry.id;
  }

  async query(filter?: AuditLogFilter): Promise<{ entries: SecurityAuditEntry[]; nextCursor?: string }> {
    return this.store.query(filter ?? {});
  }

  async verifyChain(companyId?: string): Promise<{ valid: boolean; breaks: number; entries: number }> {
    return this.store.verifyChain(companyId);
  }

  async exportCSV(filter?: AuditLogFilter): Promise<string> {
    return this.store.exportCSV(filter ?? {});
  }

  async applyRetention(days: number): Promise<number> {
    return this.store.applyRetention(days);
  }

  async getRecent(limit = 100): Promise<SecurityAuditEntry[]> {
    const { entries } = await this.store.query({ take: limit });
    return entries;
  }

  async getByType(type: string): Promise<SecurityAuditEntry[]> {
    const { entries } = await this.store.query({ type });
    return entries;
  }

  async getByUser(userId: string): Promise<SecurityAuditEntry[]> {
    const { entries } = await this.store.query({ userId });
    return entries;
  }

  async getStats(companyId?: string): Promise<{ total: number; byType: Record<string, number>; bySeverity: Record<string, number> }> {
    let cursor: string | undefined;
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let total = 0;

    do {
      const { entries, nextCursor } = await this.store.query({ companyId, cursor, take: 100 });
      for (const entry of entries) {
        total++;
        byType[entry.type] = (byType[entry.type] ?? 0) + 1;
        bySeverity[entry.severity] = (bySeverity[entry.severity] ?? 0) + 1;
      }
      cursor = nextCursor;
    } while (cursor);

    return { total, byType, bySeverity };
  }
}

export const securityAuditLogger = new SecurityAuditLogger();
export const auditEventStore = new AuditEventStore();

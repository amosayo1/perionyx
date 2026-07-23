import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/server/db/prisma";
import { AuditEventStore } from "@/server/security/audit-logger";

function mockAuditLogRow(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    id: overrides.id ?? "aud_1",
    companyId: overrides.companyId ?? null,
    actorUserId: overrides.actorUserId ?? null,
    action: overrides.action ?? "user.login",
    resourceType: overrides.resourceType ?? "auth",
    resourceId: overrides.resourceId ?? null,
    severity: overrides.severity ?? "INFO",
    metadata: overrides.metadata ?? null,
    requestId: overrides.requestId ?? null,
    payloadHash: overrides.payloadHash ?? null,
    ipAddress: overrides.ipAddress ?? null,
    userAgent: overrides.userAgent ?? null,
    createdAt: overrides.createdAt ?? new Date(),
  };
}

describe("AuditEventStore", () => {
  let store: AuditEventStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new AuditEventStore();
  });

  describe("record", () => {
    it("creates entry with id, timestamp, and hash", async () => {
      (prisma.auditLog.findFirst as Mock).mockResolvedValue(null);
      (prisma.auditLog.create as Mock).mockResolvedValue({ id: "aud_123" });

      const entry = await store.record({
        companyId: "c1",
        userId: "u1",
        action: "user.login",
        type: "auth",
        severity: "info",
        details: "User logged in from 192.168.1.1",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        correlationId: "corr-123",
      });

      expect(entry.id).toMatch(/^aud_/);
      expect(entry.timestamp).toBeTruthy();
      expect(entry.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.action).toBe("user.login");
      expect(entry.type).toBe("auth");
      expect(entry.severity).toBe("info");
    });

    it("chains hashes when recording multiple entries (previousHash should match)", async () => {
      let capturedHash: string | null = null;

      (prisma.auditLog.findFirst as Mock).mockImplementation(async () => {
        if (!capturedHash) return null;
        return { payloadHash: capturedHash };
      });

      (prisma.auditLog.create as Mock).mockImplementation(async (args: any) => ({
        id: args.data.id ?? `aud_${Date.now()}`,
      }));

      const entry1 = await store.record({
        companyId: "c1",
        action: "create",
        type: "user",
        severity: "info",
      });

      expect(entry1.previousHash).toBeUndefined();
      expect(entry1.hash).toBeTruthy();

      capturedHash = entry1.hash!;

      const entry2 = await store.record({
        companyId: "c1",
        action: "update",
        type: "user",
        severity: "info",
      });

      expect(entry2.previousHash).toBe(capturedHash);
      expect(entry2.hash).not.toBe(entry1.hash);
    });

    it("includes optional fields when provided", async () => {
      (prisma.auditLog.findFirst as Mock).mockResolvedValue(null);
      (prisma.auditLog.create as Mock).mockResolvedValue({ id: "aud_456" });

      const entry = await store.record({
        companyId: "c1",
        userId: "u42",
        action: "role.updated",
        type: "rbac",
        severity: "warning",
        resource: "role:admin",
        details: "Permission removed",
        correlationId: "corr-789",
        ip: "10.0.0.1",
        userAgent: "curl/7.68",
      });

      expect(entry.userId).toBe("u42");
      expect(entry.resource).toBe("role:admin");
      expect(entry.details).toBe("Permission removed");
      expect(entry.correlationId).toBe("corr-789");
      expect(entry.ip).toBe("10.0.0.1");
      expect(entry.userAgent).toBe("curl/7.68");
    });

    it("defaults to info severity when not critical/warning", async () => {
      (prisma.auditLog.findFirst as Mock).mockResolvedValue(null);
      (prisma.auditLog.create as Mock).mockResolvedValue({ id: "aud_789" });

      const entry = await store.record({
        companyId: "c1",
        action: "view",
        type: "report",
        severity: "info",
      });

      expect(entry.severity).toBe("info");
    });

    it("maps critical severity correctly", async () => {
      (prisma.auditLog.findFirst as Mock).mockResolvedValue(null);
      (prisma.auditLog.create as Mock).mockResolvedValue({ id: "aud_crit" });

      const entry = await store.record({
        companyId: "c1",
        action: "user.deleted",
        type: "user",
        severity: "critical",
      });

      expect(entry.severity).toBe("critical");
    });
  });

  describe("query", () => {
    const now = new Date();

    it("returns entries with default take of 50", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([
        mockAuditLogRow({ id: "1", action: "login", createdAt: now }),
      ]);

      const result = await store.query({});

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].action).toBe("login");
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 51 }),
      );
    });

    it("filters by companyId", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      await store.query({ companyId: "c1" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: "c1" }),
        }),
      );
    });

    it("filters by userId", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      await store.query({ userId: "u1" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ actorUserId: "u1" }),
        }),
      );
    });

    it("filters by type (resourceType)", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      await store.query({ type: "auth" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ resourceType: "auth" }),
        }),
      );
    });

    it("filters by action", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      await store.query({ action: "user.login" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: "user.login" }),
        }),
      );
    });

    it("filters by severity", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      await store.query({ severity: "critical" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ severity: "CRITICAL" }),
        }),
      );
    });

    it("filters by date range", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      const start = "2026-01-01T00:00:00Z";
      const end = "2026-06-01T00:00:00Z";
      await store.query({ startDate: start, endDate: end });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: { gte: new Date(start), lte: new Date(end) },
          }),
        }),
      );
    });

    it("supports cursor pagination", async () => {
      const rows = Array.from({ length: 11 }, (_, i) =>
        mockAuditLogRow({ id: `entry_${i}`, action: "view", createdAt: new Date() }),
      );
      (prisma.auditLog.findMany as Mock).mockResolvedValue(rows);

      const result = await store.query({ take: 10, cursor: "entry_5" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "entry_5" },
          skip: 1,
          take: 11,
        }),
      );
      expect(result.entries.length).toBeLessThanOrEqual(10);
      expect(result.nextCursor).toBeTruthy();
    });

    it("returns nextCursor when more results exist", async () => {
      const rows = Array.from({ length: 11 }, (_, i) =>
        mockAuditLogRow({ id: `row_${i}`, action: "view", createdAt: new Date() }),
      );
      (prisma.auditLog.findMany as Mock).mockResolvedValue(rows);

      const result = await store.query({ take: 10 });

      expect(result.nextCursor).toBeTruthy();
      expect(result.entries).toHaveLength(10);
    });

    it("omits nextCursor when all results fit", async () => {
      const rows = Array.from({ length: 5 }, (_, i) =>
        mockAuditLogRow({ id: `row_${i}`, action: "view", createdAt: new Date() }),
      );
      (prisma.auditLog.findMany as Mock).mockResolvedValue(rows);

      const result = await store.query({ take: 10 });

      expect(result.nextCursor).toBeUndefined();
      expect(result.entries).toHaveLength(5);
    });

    it("supports text search across action, resourceType, and resourceId", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([]);
      await store.query({ search: "login" });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { action: { contains: "login", mode: "insensitive" } },
              { resourceType: { contains: "login", mode: "insensitive" } },
              { resourceId: { contains: "login", mode: "insensitive" } },
            ],
          }),
        }),
      );
    });
  });

  describe("exportCSV", () => {
    it("produces valid CSV with header row", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([
        mockAuditLogRow({
          id: "aud_1",
          action: "user.login",
          resourceType: "auth",
          severity: "INFO",
          actorUserId: "u1",
          companyId: "c1",
          ipAddress: "10.0.0.1",
          userAgent: "Chrome",
          payloadHash: "abc123",
          createdAt: new Date("2026-01-15T10:00:00Z"),
        }),
      ]);

      const csv = await store.exportCSV({ take: 10 });

      expect(csv).toContain("ID,Timestamp,Type,Severity,User ID,Company ID,Action,Resource,Details,Correlation ID,IP,User Agent");
      expect(csv).toContain("aud_1");
      expect(csv).toContain("user.login");
      expect(csv).toContain("10.0.0.1");
    });

    it("escapes double quotes in details and user agent", async () => {
      (prisma.auditLog.findMany as Mock).mockResolvedValue([
        mockAuditLogRow({
          id: "aud_2",
          action: "update",
          resourceType: "config",
          severity: "WARNING",
          metadata: { details: 'said "hello" world' },
          userAgent: 'Mozilla "Firefox"',
          createdAt: new Date(),
        }),
      ]);

      const csv = await store.exportCSV({});

      expect(csv).toContain('""'); // escaped quotes
    });
  });

  describe("applyRetention", () => {
    it("removes entries older than specified days", async () => {
      (prisma.auditLog.deleteMany as Mock).mockResolvedValue({ count: 10 });

      const count = await store.applyRetention(90);

      expect(count).toBe(10);
      expect(prisma.auditLog.deleteMany).toHaveBeenCalledOnce();
    });

    it("uses the correct cutoff date based on days parameter", async () => {
      (prisma.auditLog.deleteMany as Mock).mockResolvedValue({ count: 0 });
      const days = 30;
      const beforeCall = Date.now();

      await store.applyRetention(days);

      expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: expect.objectContaining({
              lt: expect.any(Date),
            }),
          },
        }),
      );

      const callArg = (prisma.auditLog.deleteMany as Mock).mock.calls[0][0];
      const cutoff = callArg.where.createdAt.lt.getTime();
      const expectedCutoff = beforeCall - days * 86400000;
      expect(cutoff).toBeLessThanOrEqual(expectedCutoff + 1000);
      expect(cutoff).toBeGreaterThanOrEqual(expectedCutoff - 1000);
    });

    it("returns 0 when no entries match", async () => {
      (prisma.auditLog.deleteMany as Mock).mockResolvedValue({ count: 0 });

      const count = await store.applyRetention(7);

      expect(count).toBe(0);
    });
  });
});

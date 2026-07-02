import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { recordAudit, listAuditLogsForTenant } from "@/modules/audit/audit.service";
import { prisma } from "@/server/db/prisma";
import { createCompany, createUser, createMembership } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";

afterAll(cleanup);

describe("AuditService", () => {
  describe("recordAudit", () => {
    it("creates an audit log entry", async () => {
      const company = await createCompany();
      const user = await createUser();
      await createMembership(user.id, company.id);

      const log = await recordAudit(prisma, {
        companyId: company.id,
        actorUserId: user.id,
        action: "TEST_ACTION",
        resourceType: "TestResource",
        resourceId: "test-123",
        metadata: { detail: "unit test" },
      });

      expect(log.id).toBeDefined();
      expect(log.action).toBe("TEST_ACTION");
      expect(log.resourceType).toBe("TestResource");
      expect(log.companyId).toBe(company.id);
      expect(log.actorUserId).toBe(user.id);
    });

    it("defaults severity to INFO", async () => {
      const log = await recordAudit(prisma, {
        action: "NO_SEVERITY",
        resourceType: "Test",
      });
      expect(log.severity).toBe("INFO");
    });

    it("accepts optional fields (payloadHash, ipAddress, userAgent)", async () => {
      const log = await recordAudit(prisma, {
        action: "FULL_LOG",
        resourceType: "Test",
        payloadHash: "abc123",
        ipAddress: "192.168.1.1",
        userAgent: "vitest/1.0",
        requestId: "req-001",
      });
      expect(log.payloadHash).toBe("abc123");
      expect(log.ipAddress).toBe("192.168.1.1");
      expect(log.userAgent).toBe("vitest/1.0");
      expect(log.requestId).toBe("req-001");
    });
  });

  describe("listAuditLogsForTenant", () => {
    it("returns only logs for the given tenant", async () => {
      const companyA = await createCompany();
      const companyB = await createCompany();
      const ctxA = buildTenantContext(companyA.id);
      const ctxB = buildTenantContext(companyB.id);

      await recordAudit(prisma, { companyId: companyA.id, action: "A_ACTION", resourceType: "Test" });
      await recordAudit(prisma, { companyId: companyB.id, action: "B_ACTION", resourceType: "Test" });

      const resultA = await listAuditLogsForTenant(ctxA, { take: 10 });
      expect(resultA.rows).toHaveLength(1);
      expect(resultA.rows[0].action).toBe("A_ACTION");

      const resultB = await listAuditLogsForTenant(ctxB, { take: 10 });
      expect(resultB.rows).toHaveLength(1);
      expect(resultB.rows[0].action).toBe("B_ACTION");
    });

    it("returns empty list when no logs exist", async () => {
      const company = await createCompany();
      const ctx = buildTenantContext(company.id);
      const result = await listAuditLogsForTenant(ctx, { take: 10 });
      expect(result.rows).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });

    it("orders by newest first", async () => {
      const company = await createCompany();
      const ctx = buildTenantContext(company.id);

      await recordAudit(prisma, { companyId: company.id, action: "FIRST", resourceType: "Test" });
      await recordAudit(prisma, { companyId: company.id, action: "SECOND", resourceType: "Test" });

      const result = await listAuditLogsForTenant(ctx, { take: 10 });
      expect(result.rows[0].action).toBe("SECOND");
      expect(result.rows[1].action).toBe("FIRST");
    });

    it("filters by search term", async () => {
      const company = await createCompany();
      const ctx = buildTenantContext(company.id);

      await recordAudit(prisma, { companyId: company.id, action: "WALLET_CREATE", resourceType: "Wallet" });
      await recordAudit(prisma, { companyId: company.id, action: "TRANSFER_SEND", resourceType: "Transaction" });

      const result = await listAuditLogsForTenant(ctx, { take: 10, search: "WALLET" });
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].action).toBe("WALLET_CREATE");
    });

    it("supports cursor-based pagination", async () => {
      const company = await createCompany();
      const ctx = buildTenantContext(company.id);

      for (let i = 0; i < 5; i++) {
        await recordAudit(prisma, { companyId: company.id, action: `ACTION_${i}`, resourceType: "Test" });
      }

      const page1 = await listAuditLogsForTenant(ctx, { take: 2 });
      expect(page1.rows).toHaveLength(2);
      expect(page1.nextCursor).toBeDefined();

      const page2 = await listAuditLogsForTenant(ctx, { take: 2, cursor: page1.nextCursor });
      expect(page2.rows).toHaveLength(2);
      expect(page2.nextCursor).toBeDefined();

      const page3 = await listAuditLogsForTenant(ctx, { take: 2, cursor: page2.nextCursor });
      expect(page3.rows).toHaveLength(1);
      expect(page3.nextCursor).toBeUndefined();
    });
  });
});

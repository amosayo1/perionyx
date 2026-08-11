import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import {
  DashboardV2CompositionService,
  personaFromRole,
  pctDelta,
  rankAttention,
} from "@/modules/dashboard/composition.service";
import type { AttentionItem } from "@/modules/dashboard/types";

const service = new DashboardV2CompositionService();

interface TestContext {
  companyId: string;
  userId: string;
  cleanup: (() => Promise<unknown>)[];
}

async function createTestData(): Promise<TestContext> {
  const cleanup: TestContext["cleanup"] = [];

  const company = await prisma.company.create({
    data: { name: `DC V2 Test ${Date.now()}`, slug: `dc-v2-${Date.now()}` },
  });
  cleanup.push(() => prisma.company.delete({ where: { id: company.id } }).catch(() => {}));

  const user = await prisma.user.create({
    data: {
      email: `dc-v2-${Date.now()}@perionyx.test`,
      name: "Dashboard V2 Test",
    },
  });
  cleanup.push(() => prisma.user.delete({ where: { id: user.id } }).catch(() => {}));

  return { companyId: company.id, userId: user.id, cleanup };
}

async function cleanupTestData(ctx: TestContext): Promise<void> {
  for (const fn of ctx.cleanup.reverse()) {
    await fn();
  }
}

describe("personaFromRole", () => {
  it("maps treasury roles to treasurer", () => {
    expect(personaFromRole("TREASURER")).toBe("treasurer");
  });

  it("maps owner/admin roles to executive", () => {
    expect(personaFromRole("OWNER")).toBe("executive");
    expect(personaFromRole("ADMIN")).toBe("executive");
  });

  it("maps viewer roles to auditor", () => {
    expect(personaFromRole("VIEWER")).toBe("auditor");
  });

  it("defaults unknown or missing roles to controller", () => {
    expect(personaFromRole("MEMBER")).toBe("controller");
    expect(personaFromRole(undefined)).toBe("controller");
    expect(personaFromRole(null)).toBe("controller");
  });
});

describe("pctDelta", () => {
  it("returns null when there is no comparable previous period", () => {
    expect(pctDelta(100, 0)).toBeNull();
    expect(pctDelta(100, NaN)).toBeNull();
  });

  it("computes signed percentage with + prefix for growth", () => {
    expect(pctDelta(150, 100)).toEqual({ delta: "+50%", basis: "vs prior period" });
  });

  it("computes negative change", () => {
    expect(pctDelta(80, 100)).toEqual({ delta: "-20%", basis: "vs prior period" });
  });
});

describe("rankAttention", () => {
  const item = (over: Partial<AttentionItem>): AttentionItem => ({
    id: `i-${Math.random()}`,
    title: "Item",
    impact: "USD 1,000",
    reason: "review",
    due: null,
    priority: "medium",
    target: "/procurement/invoices/x",
    ...over,
  });

  it("keeps higher business priority first", () => {
    const high = item({ id: "high", priority: "high" });
    const medium = item({ id: "medium", priority: "medium" });
    expect(rankAttention([medium, high]).map((i) => i.id)).toEqual(["high", "medium"]);
  });

  it("ranks overdue above due-today above normal", () => {
    const overdue = item({ id: "overdue", reason: "Overdue and SLA breached" });
    const dueToday = item({ id: "due", reason: "Due today" });
    const normal = item({ id: "normal", reason: "Review required" });
    expect(rankAttention([normal, dueToday, overdue]).map((i) => i.id)).toEqual([
      "overdue",
      "due",
      "normal",
    ]);
  });

  it("boosts high-value items above routine ones", () => {
    const highValue = item({ id: "hv", reason: "High value invoice" });
    const routine = item({ id: "routine", reason: "Review required" });
    expect(rankAttention([routine, highValue]).map((i) => i.id)).toEqual(["hv", "routine"]);
  });

  it("breaks ties by impact magnitude", () => {
    const big = item({ id: "big", impact: "USD 50,000", reason: "review" });
    const small = item({ id: "small", impact: "USD 100", reason: "review" });
    expect(rankAttention([small, big]).map((i) => i.id)).toEqual(["big", "small"]);
  });

  it("does not mutate the input array", () => {
    const input = [item({ id: "a", priority: "low" }), item({ id: "b", priority: "critical" })];
    rankAttention(input);
    expect(input.map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("DashboardV2CompositionService", () => {
  describe("with no data", () => {
    let ctx: TestContext;

    beforeAll(async () => {
      ctx = await createTestData();
    });

    afterAll(async () => {
      await cleanupTestData(ctx);
    });

    it("returns the full DashboardDataV2 shape with empty sections", async () => {
      const result = await service.getDashboardData({
        companyId: ctx.companyId,
        userId: ctx.userId,
        role: "MEMBER",
      });

      expect(result).toHaveProperty("persona");
      expect(result).toHaveProperty("generatedAt");
      expect(result).toHaveProperty("dataMode");
      expect(result).toHaveProperty("metrics");
      expect(result).toHaveProperty("attentionQueue");
      expect(result).toHaveProperty("decisions");
      expect(result).toHaveProperty("workQueue");
      expect(result).toHaveProperty("workQueueTotal");
      expect(result).toHaveProperty("todaysWork");
      expect(result).toHaveProperty("activity");

      expect(result.persona).toBe("controller");
      expect(result.dataMode).toBe("seeded");
      expect(result.metrics).toHaveLength(5);
      expect(result.workQueueTotal).toBe(0);
      expect(result.todaysWork.totalTasks).toBe(0);
    });

    it("empty-state metric values are honest zeros", async () => {
      const result = await service.getDashboardData({
        companyId: ctx.companyId,
        userId: ctx.userId,
        role: "TREASURER",
      });

      const cash = result.metrics.find((m) => m.id === "cash-position");
      const approvals = result.metrics.find((m) => m.id === "pending-approvals");
      const exceptions = result.metrics.find((m) => m.id === "open-exceptions");

      expect(cash?.value).toContain("0");
      expect(approvals?.value).toBe("0");
      expect(exceptions?.value).toBe("0");
      expect(cash?.basis).toBe("no flow history");
      expect(approvals?.basis).toBe("no prior period");
    });

    it("persona follows the tenant role", async () => {
      const result = await service.getDashboardData({
        companyId: ctx.companyId,
        userId: ctx.userId,
        role: "VIEWER",
      });
      expect(result.persona).toBe("auditor");
    });

    it("is resilient when decision service yields nothing", async () => {
      const result = await service.getDashboardData({
        companyId: ctx.companyId,
        userId: ctx.userId,
        role: "ADMIN",
      });
      expect(Array.isArray(result.decisions)).toBe(true);
      expect(result.decisions).toHaveLength(0);
    });
  });

  describe("pending-approvals KPI counts invoices, not approval records", () => {
    let ctx: TestContext;
    let vendorId: string;

    beforeAll(async () => {
      ctx = await createTestData();

      const vendor = await prisma.procurementVendor.create({
        data: {
          companyId: ctx.companyId,
          vendorCode: `DC-VND-${Date.now()}`,
          name: "KPI Test Vendor",
          legalName: "KPI Test Vendor LLC",
          category: "SUPPLIER",
          taxId: "00-0000000",
          taxCountry: "US",
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
        },
      });
      vendorId = vendor.id;
      ctx.cleanup.push(() =>
        prisma.procurementVendor.delete({ where: { id: vendor.id } }).catch(() => {}),
      );
    });

    afterAll(async () => {
      await cleanupTestData(ctx);
    });

    async function createInvoice(over: {
      invoiceNumber: string;
      status: string;
      approvalRecords: { approvalLevel: number; status: string }[];
    }) {
      const invoice = await prisma.procurementVendorInvoice.create({
        data: {
          companyId: ctx.companyId,
          vendorId,
          invoiceNumber: over.invoiceNumber,
          invoiceDate: new Date("2026-07-01"),
          dueDate: new Date("2026-08-01"),
          status: over.status as never,
          subtotal: new Prisma.Decimal(25000),
          totalAmount: new Prisma.Decimal(27000),
          totalWithTax: new Prisma.Decimal(27000),
          balanceDue: new Prisma.Decimal(27000),
          netBalance: new Prisma.Decimal(27000),
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
        },
      });
      ctx.cleanup.push(() =>
        prisma.procurementVendorInvoice.delete({ where: { id: invoice.id } }).catch(() => {}),
      );

      for (const r of over.approvalRecords) {
        const record = await prisma.procurementApprovalRecord.create({
          data: {
            companyId: ctx.companyId,
            vendorInvoiceId: invoice.id,
            approvalLevel: r.approvalLevel,
            approvalLevelName: `Level ${r.approvalLevel}`,
            requiredRole: "CONTROLLER",
            requiredThreshold: new Prisma.Decimal(25000),
            status: r.status as never,
            createdBy: ctx.userId,
            updatedBy: ctx.userId,
          },
        });
        ctx.cleanup.push(() =>
          prisma.procurementApprovalRecord.delete({ where: { id: record.id } }).catch(() => {}),
        );
      }

      return invoice;
    }

    it("counts genuinely pending invoices, ignores stale records on APPROVED invoices", async () => {
      // Genuinely pending invoice with a legitimate multi-level chain:
      // 2 PENDING records on 1 invoice → counts as 1.
      await createInvoice({
        invoiceNumber: "INV-PENDING-MULTI",
        status: "PENDING_APPROVAL",
        approvalRecords: [
          { approvalLevel: 1, status: "PENDING" },
          { approvalLevel: 2, status: "PENDING" },
        ],
      });

      // APPROVED invoice carrying a stale PENDING record (the INV-NS-7002
      // shape) → must NOT inflate the KPI.
      await createInvoice({
        invoiceNumber: "INV-APPROVED-STALE",
        status: "APPROVED",
        approvalRecords: [{ approvalLevel: 2, status: "PENDING" }],
      });

      const result = await service.getDashboardData({
        companyId: ctx.companyId,
        userId: ctx.userId,
        role: "MEMBER",
      });

      const approvals = result.metrics.find((m) => m.id === "pending-approvals");
      expect(approvals?.value).toBe("1");
      expect(approvals?.source).toBe("AP Approvals");
      expect(approvals?.drillTarget).toBe("/procurement/invoices");
    });
  });
});

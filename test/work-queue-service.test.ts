import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Prisma, VendorInvoiceStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { WorkQueueService } from "@/modules/work-queue";

const service = new WorkQueueService();

interface TestData {
  companyId: string;
  vendorId: string;
  createdIds: { model: string; id: string }[];
}

async function createTestData(): Promise<TestData> {
  const createdIds: TestData["createdIds"] = [];

  const company = await prisma.company.create({
    data: { name: "Test Co WQ", slug: `test-co-wq-${Date.now()}` },
  });
  createdIds.push({ model: "company", id: company.id });

  const vendor = await prisma.procurementVendor.create({
    data: {
      companyId: company.id,
      vendorCode: "V-WQ-001",
      name: "Test Vendor WQ",
      legalName: "Test Vendor Legal WQ",
      category: "SUPPLIER",
      taxId: "99-9999999",
      taxCountry: "US",
      createdBy: "test",
      updatedBy: "test",
    },
  });
  createdIds.push({ model: "procurementVendor", id: vendor.id });

  return { companyId: company.id, vendorId: vendor.id, createdIds };
}

function addToCleanup(createdIds: TestData["createdIds"], model: string, id: string) {
  createdIds.push({ model, id });
}

async function cleanup(createdIds: TestData["createdIds"]) {
  const order = [
    "procurementInvoiceException",
    "procurementApprovalRecord",
    "procurementThreeWayMatch",
    "procurementVendorInvoice",
    "procurementVendor",
    "company",
  ];
  for (const model of order) {
    const ids = createdIds.filter((c) => c.model === model).map((c) => c.id);
    if (ids.length === 0) continue;
    try {
      await (
        prisma as unknown as Record<
          string,
          { deleteMany: (args: { where: { id: { in: string[] } } }) => Promise<{ count: number }> }
        >
      )[model].deleteMany({ where: { id: { in: ids } } });
    } catch {
      // ignore FK blocks
    }
  }
}

describe("WorkQueueService", () => {
  let td: TestData;

  beforeEach(async () => {
    td = await createTestData();
  });

  afterEach(async () => {
    await cleanup(td.createdIds);
  });

  it("returns empty result when no invoices exist", async () => {
    const result = await service.getWorkQueue(td.companyId, { page: 1, pageSize: 25 });
    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("returns all invoices with default sorting", async () => {
    const today = new Date();
    const inv1 = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-001", 1000, today, "PENDING_APPROVAL"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv1.id);
    const inv2 = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-002", 2000, today, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv2.id);

    const result = await service.getWorkQueue(td.companyId, { page: 1, pageSize: 25 });
    expect(result.items).toHaveLength(2);
    expect(result.totalItems).toBe(2);
  });

  it("filters by high-priority (overdue invoices)", async () => {
    const overdueDate = new Date(Date.now() - 5 * 86400000);
    const futureDate = new Date(Date.now() + 5 * 86400000);

    const overdue = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-OVERDUE", 1000, overdueDate, "PENDING_APPROVAL"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", overdue.id);

    const future = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-FUTURE", 500, futureDate, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", future.id);

    const result = await service.getWorkQueue(td.companyId, { filter: "high-priority", page: 1, pageSize: 25 });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items.every((i) => i.priority === "critical" || i.priority === "high")).toBe(true);
  });

  it("filters by high-priority (high value invoices)", async () => {
    const today = new Date();
    const highValue = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-HIGH", 50000, today, "PENDING_APPROVAL"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", highValue.id);

    const lowValue = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-LOW", 100, today, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", lowValue.id);

    const result = await service.getWorkQueue(td.companyId, { filter: "high-priority", page: 1, pageSize: 25 });
    const highAmountItem = result.items.find((i) => i.invoiceNumber === "INV-HIGH");
    expect(highAmountItem).toBeDefined();
    expect(highAmountItem!.priority).toBe("critical");
  });

  it("filters by medium-priority", async () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    const pending = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-MED", 1000, nextWeek, "PENDING_APPROVAL"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", pending.id);

    const result = await service.getWorkQueue(td.companyId, { filter: "medium-priority", page: 1, pageSize: 25 });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
  });

  it("filters by quick-approvals", async () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    const validated = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-QUICK", 500, nextWeek, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", validated.id);

    const result = await service.getWorkQueue(td.companyId, { filter: "quick-approvals", page: 1, pageSize: 25 });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
  });

  it("filters by exceptions", async () => {
    const today = new Date();
    const exception = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-EXC", 1000, today, "EXCEPTION"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", exception.id);

    const normal = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-NORM", 500, today, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", normal.id);

    const result = await service.getWorkQueue(td.companyId, { filter: "exceptions", page: 1, pageSize: 25 });
    expect(result.items.every((i) => i.status === "Exception")).toBe(true);
  });

  it("searches by invoice number", async () => {
    const today = new Date();
    const inv1 = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-SEARCH-001", 100, today, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv1.id);
    const inv2 = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-OTHER", 200, today, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv2.id);

    const result = await service.getWorkQueue(td.companyId, { search: "SEARCH", page: 1, pageSize: 25 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].invoiceNumber).toBe("INV-SEARCH-001");
  });

  it("sorts by invoice date descending", async () => {
    const oldDate = new Date("2024-01-01");
    const newDate = new Date("2026-01-01");
    const inv1 = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-OLD", 100, oldDate, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv1.id);
    const inv2 = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-NEW", 200, newDate, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv2.id);

    const result = await service.getWorkQueue(td.companyId, { sort: "invoiceDate", dir: "desc", page: 1, pageSize: 25 });
    expect(result.items[0].invoiceNumber).toBe("INV-NEW");
    expect(result.items[1].invoiceNumber).toBe("INV-OLD");
  });

  it("paginates correctly", async () => {
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const inv = await prisma.procurementVendorInvoice.create({
        data: makeInvoice(td, `INV-PG-${i}`, 100 * i, today, "VALIDATED"),
      });
      addToCleanup(td.createdIds, "procurementVendorInvoice", inv.id);
    }

    const page1 = await service.getWorkQueue(td.companyId, { page: 1, pageSize: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.totalItems).toBe(5);
    expect(page1.totalPages).toBe(3);

    const page3 = await service.getWorkQueue(td.companyId, { page: 3, pageSize: 2 });
    expect(page3.items).toHaveLength(1);
    expect(page3.page).toBe(3);
  });

  it("respects tenant isolation (different company)", async () => {
    const today = new Date();
    const inv = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-TENANT", 500, today, "VALIDATED"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv.id);

    const result = await service.getWorkQueue("nonexistent-company", { page: 1, pageSize: 25 });
    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
  });

  it("maps status to human-readable labels", async () => {
    const statuses = ["DRAFT", "CAPTURED", "VALIDATING", "VALIDATED", "THREE_WAY_MATCHING", "MATCHED", "EXCEPTION", "PENDING_APPROVAL", "APPROVED", "PAID"] as const;
    const today = new Date();
    for (const s of statuses) {
      const inv = await prisma.procurementVendorInvoice.create({
        data: makeInvoice(td, `INV-${s}`, 100, today, s),
      });
      addToCleanup(td.createdIds, "procurementVendorInvoice", inv.id);
    }

    const result = await service.getWorkQueue(td.companyId, { page: 1, pageSize: 25 });
    expect(result.items.find((i) => i.invoiceNumber === "INV-PENDING_APPROVAL")?.status).toBe("Pending Approval");
    expect(result.items.find((i) => i.invoiceNumber === "INV-DRAFT")?.status).toBe("Draft");
    expect(result.items.find((i) => i.invoiceNumber === "INV-EXCEPTION")?.status).toBe("Exception");
    expect(result.items.find((i) => i.invoiceNumber === "INV-PAID")?.status).toBe("Paid");
    expect(result.items.find((i) => i.invoiceNumber === "INV-THREE_WAY_MATCHING")?.status).toBe("Matching");
  });
});

function makeInvoice(td: TestData, invoiceNumber: string, amount: number, dueDate: Date, status: string) {
  const now = new Date();
  const total = new Prisma.Decimal(amount);
  return {
    companyId: td.companyId,
    vendorId: td.vendorId,
    invoiceNumber,
    invoiceDate: now,
    dueDate,
    status: status as VendorInvoiceStatus,
    currency: "USD",
    subtotal: total,
    totalAmount: total,
    totalWithTax: total,
    balanceDue: total,
    netBalance: total,
    createdBy: "test",
    updatedBy: "test",
  };
}

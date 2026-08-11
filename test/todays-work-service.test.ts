import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Prisma, VendorInvoiceStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { TodaysWorkService } from "@/modules/todays-work";

const service = new TodaysWorkService();

interface TestData {
  companyId: string;
  vendorId: string;
  createdIds: { model: string; id: string }[];
}

async function createTestData(): Promise<TestData> {
  const createdIds: TestData["createdIds"] = [];

  const company = await prisma.company.create({
    data: { name: "Test Co TW", slug: `test-co-tw-${Date.now()}` },
  });
  createdIds.push({ model: "company", id: company.id });

  const vendor = await prisma.procurementVendor.create({
    data: {
      companyId: company.id,
      vendorCode: "V-TW-001",
      name: "Test Vendor TW",
      legalName: "Test Vendor Legal TW",
      category: "SUPPLIER",
      taxId: "88-8888888",
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

describe("TodaysWorkService", () => {
  let td: TestData;

  beforeEach(async () => {
    td = await createTestData();
  });

  afterEach(async () => {
    await cleanup(td.createdIds);
  });

  it("returns high-priority-reviews category with count 0 when no pending invoices exist", async () => {
    const inv = await prisma.procurementVendorInvoice.create({
      data: makeInvoice(td, "INV-PAID", 100, new Date(), "PAID"),
    });
    addToCleanup(td.createdIds, "procurementVendorInvoice", inv.id);

    const result = await service.getTodaysWork(td.companyId);
    const highCategory = result.categories.find((c) => c.id === "high-priority-reviews");
    expect(highCategory).toBeDefined();
    expect(highCategory!.count).toBe(0);
  });

  it("categorizes overdue invoices as high priority", async () => {
    const overdueDate = new Date(Date.now() - 5 * 86400000);
    await createInvoice(td, "INV-OVERDUE-1", 1000, overdueDate, "PENDING_APPROVAL");
    await createInvoice(td, "INV-OVERDUE-2", 2000, overdueDate, "PENDING_APPROVAL");

    const result = await service.getTodaysWork(td.companyId);
    const highCategory = result.categories.find((c) => c.id === "high-priority-reviews");
    expect(highCategory).toBeDefined();
    expect(highCategory!.count).toBeGreaterThanOrEqual(2);
  });

  it("classifies high-value invoices as high priority", async () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    await createInvoice(td, "INV-HIGHVAL", 50000, nextWeek, "PENDING_APPROVAL");

    const result = await service.getTodaysWork(td.companyId);
    const highCategory = result.categories.find((c) => c.id === "high-priority-reviews");
    expect(highCategory).toBeDefined();
    expect(highCategory!.count).toBeGreaterThanOrEqual(1);
  });

  it("categorizes non-overdue, non-high-value pending invoices as medium priority", async () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    await createInvoice(td, "INV-MED-1", 500, nextWeek, "VALIDATING");

    const result = await service.getTodaysWork(td.companyId);
    const medCategory = result.categories.find((c) => c.id === "medium-priority-reviews");
    expect(medCategory).toBeDefined();
    expect(medCategory!.count).toBe(1);
  });

  it("classifies validated non-overdue invoices as quick approvals", async () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    await createInvoice(td, "INV-QUICK", 200, nextWeek, "VALIDATED");

    const result = await service.getTodaysWork(td.companyId);
    const quickCategory = result.categories.find((c) => c.id === "quick-approvals");
    expect(quickCategory).toBeDefined();
    expect(quickCategory!.count).toBe(1);
  });

  it("includes exception count in policy-exceptions category", async () => {
    const today = new Date();
    const inv = await createInvoice(td, "INV-EXC", 1000, today, "EXCEPTION");
    await createException(td, inv.id);

    const result = await service.getTodaysWork(td.companyId);
    const excCategory = result.categories.find((c) => c.id === "policy-exceptions");
    expect(excCategory).toBeDefined();
    expect(excCategory!.count).toBe(1);
  });

  it("computes estimated total minutes", async () => {
    const overdueDate = new Date(Date.now() - 5 * 86400000);
    const nextWeek = new Date(Date.now() + 7 * 86400000);

    await createInvoice(td, "INV-HP-1", 50000, new Date(), "PENDING_APPROVAL");
    await createInvoice(td, "INV-HP-2", 1000, overdueDate, "PENDING_APPROVAL");
    await createInvoice(td, "INV-MP-1", 500, nextWeek, "VALIDATING");
    await createInvoice(td, "INV-QA-1", 200, nextWeek, "VALIDATED");

    const result = await service.getTodaysWork(td.companyId);
    expect(result.estimatedTotalMinutes).toBeGreaterThan(0);
    expect(result.totalTasks).toBe(result.estimatedTotalMinutes);
  });

  it("returns high-priority percentage", async () => {
    const overdueDate = new Date(Date.now() - 5 * 86400000);
    const nextWeek = new Date(Date.now() + 7 * 86400000);

    await createInvoice(td, "INV-HP-1", 50000, overdueDate, "PENDING_APPROVAL");
    await createInvoice(td, "INV-MP-1", 500, nextWeek, "PENDING_APPROVAL");

    const result = await service.getTodaysWork(td.companyId);
    expect(result.highPriorityPercentage).toBeGreaterThanOrEqual(0);
    expect(result.highPriorityPercentage).toBeLessThanOrEqual(100);
  });

  it("generates meaningful supporting reasons for high-priority", async () => {
    const overdueDate = new Date(Date.now() - 5 * 86400000);
    await createInvoice(td, "INV-REASON", 1000, overdueDate, "PENDING_APPROVAL");

    const result = await service.getTodaysWork(td.companyId);
    const highCategory = result.categories.find((c) => c.id === "high-priority-reviews");
    expect(highCategory).toBeDefined();
    expect(highCategory!.supportingReason).toContain("overdue");
  });

  it("respects tenant isolation", async () => {
    const today = new Date();
    await createInvoice(td, "INV-ISO", 500, today, "PENDING_APPROVAL");

    const result = await service.getTodaysWork("nonexistent-company");
    const totalCount = result.categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBe(0);
  });

  it("skips medium-priority category when count is zero", async () => {
    const result = await service.getTodaysWork(td.companyId);
    const medCategory = result.categories.find((c) => c.id === "medium-priority-reviews");
    expect(medCategory).toBeUndefined();
  });

  it("skips quick-approvals and exceptions when counts are zero", async () => {
    const result = await service.getTodaysWork(td.companyId);
    expect(result.categories.find((c) => c.id === "quick-approvals")).toBeUndefined();
    expect(result.categories.find((c) => c.id === "policy-exceptions")).toBeUndefined();
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

async function createInvoice(td: TestData, invoiceNumber: string, amount: number, dueDate: Date, status: string) {
  const inv = await prisma.procurementVendorInvoice.create({
    data: makeInvoice(td, invoiceNumber, amount, dueDate, status),
  });
  addToCleanup(td.createdIds, "procurementVendorInvoice", inv.id);
  return inv;
}

async function createException(td: TestData, invoiceId: string) {
  const exc = await prisma.procurementInvoiceException.create({
    data: {
      companyId: td.companyId,
      vendorInvoiceId: invoiceId,
      exceptionType: "PRICE_VARIANCE",
      severity: "HIGH",
      description: "Price variance detected",
      status: "OPEN",
      createdBy: "test",
      updatedBy: "test",
    },
  });
  addToCleanup(td.createdIds, "procurementInvoiceException", exc.id);
  return exc;
}

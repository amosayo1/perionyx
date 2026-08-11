import { describe, it, expect } from "vitest";
import {
  toWorkQueueStatusLabel,
  toWorkQueueSlaLabel,
  workQueueStatusToNextAction,
  deriveSlaStatus,
  derivePriority,
  buildWorkQueueWhere,
  getWorkQueuePagination,
  toWorkQueuePreviewItem,
  PENDING_STATUSES,
  HIGH_VALUE_THRESHOLD,
} from "@/modules/work-queue";
import type { WorkQueueItem } from "@/modules/work-queue";

const TODAY_START = new Date(Date.UTC(2026, 6, 30));

describe("work-queue shared utilities", () => {
  describe("toWorkQueueStatusLabel", () => {
    it("maps known raw statuses to display labels", () => {
      expect(toWorkQueueStatusLabel("PENDING_APPROVAL")).toBe("Pending Approval");
      expect(toWorkQueueStatusLabel("THREE_WAY_MATCHING")).toBe("Matching");
      expect(toWorkQueueStatusLabel("MATCH_FAILED")).toBe("Match Failed");
      expect(toWorkQueueStatusLabel("PARTIALLY_PAID")).toBe("Partially Paid");
    });

    it("passes through unknown statuses unchanged", () => {
      expect(toWorkQueueStatusLabel("WEIRD_STATUS")).toBe("WEIRD_STATUS");
    });
  });

  describe("toWorkQueueSlaLabel", () => {
    it("maps SLA statuses to display labels", () => {
      expect(toWorkQueueSlaLabel("on-track")).toBe("On Track");
      expect(toWorkQueueSlaLabel("at-risk")).toBe("At Risk");
      expect(toWorkQueueSlaLabel("breached")).toBe("Breached");
    });

    it("passes through unknown statuses unchanged", () => {
      expect(toWorkQueueSlaLabel("unknown")).toBe("unknown");
    });
  });

  describe("workQueueStatusToNextAction", () => {
    it("maps labels to next actions", () => {
      expect(workQueueStatusToNextAction("Pending Approval")).toBe("Review & Approve");
      expect(workQueueStatusToNextAction("Exception")).toBe("Resolve Exception");
      expect(workQueueStatusToNextAction("Match Failed")).toBe("Review Match");
      expect(workQueueStatusToNextAction("Captured")).toBe("Process Invoice");
    });

    it("falls back to Review", () => {
      expect(workQueueStatusToNextAction("Draft")).toBe("Review");
    });
  });

  describe("deriveSlaStatus", () => {
    it("marks overdue invoices as breached", () => {
      expect(deriveSlaStatus(new Date(Date.UTC(2026, 6, 29)), TODAY_START)).toBe("breached");
    });

    it("marks invoices within the 3-day window as at-risk", () => {
      expect(deriveSlaStatus(new Date(Date.UTC(2026, 6, 31)), TODAY_START)).toBe("at-risk");
      expect(deriveSlaStatus(new Date(Date.UTC(2026, 7, 1)), TODAY_START)).toBe("at-risk");
    });

    it("marks invoices beyond the window as on-track", () => {
      expect(deriveSlaStatus(new Date(Date.UTC(2026, 7, 2)), TODAY_START)).toBe("on-track");
    });
  });

  describe("derivePriority", () => {
    const base = { dueDate: new Date(Date.UTC(2026, 7, 5)), todayStart: TODAY_START, invoiceAgeDays: 10 };

    it("returns critical for high-value invoices", () => {
      expect(derivePriority({ ...base, totalAmount: HIGH_VALUE_THRESHOLD })).toBe("critical");
      expect(derivePriority({ ...base, totalAmount: HIGH_VALUE_THRESHOLD + 1 })).toBe("critical");
    });

    it("returns high for overdue invoices", () => {
      expect(derivePriority({ ...base, totalAmount: 100, dueDate: new Date(Date.UTC(2026, 6, 29)) })).toBe("high");
    });

    it("returns high for invoices older than 30 days", () => {
      expect(derivePriority({ ...base, totalAmount: 100, invoiceAgeDays: 31 })).toBe("high");
    });

    it("returns medium otherwise", () => {
      expect(derivePriority({ ...base, totalAmount: 100 })).toBe("medium");
    });
  });

  describe("getWorkQueuePagination", () => {
    it("applies sensible defaults", () => {
      expect(getWorkQueuePagination({})).toEqual({ page: 0, pageSize: 25, skip: 0, take: 25 });
    });

    it("respects custom page and pageSize", () => {
      expect(getWorkQueuePagination({ page: 3, pageSize: 10 })).toEqual({ page: 2, pageSize: 10, skip: 20, take: 10 });
    });

    it("clamps pageSize to the 1-100 range", () => {
      expect(getWorkQueuePagination({ pageSize: 1000 })).toEqual({ page: 0, pageSize: 100, skip: 0, take: 100 });
      expect(getWorkQueuePagination({ pageSize: 0 })).toEqual({ page: 0, pageSize: 1, skip: 0, take: 1 });
    });
  });

  describe("buildWorkQueueWhere", () => {
    it("returns tenant-scoped where with no filter", () => {
      expect(buildWorkQueueWhere({}, "company-1", TODAY_START)).toEqual({ companyId: "company-1" });
    });

    it("builds high-priority OR conditions", () => {
      const where = buildWorkQueueWhere({ filter: "high-priority" }, "company-1", TODAY_START) as {
        OR: unknown[];
      };
      expect(where.OR).toHaveLength(3);
    });

    it("builds medium-priority status list from canonical PENDING_STATUSES", () => {
      const where = buildWorkQueueWhere({ filter: "medium-priority" }, "company-1", TODAY_START) as {
        status: { in: string[] };
        dueDate: { gte: Date };
      };
      expect(where.status.in).toEqual([...PENDING_STATUSES]);
      expect(where.dueDate.gte).toBe(TODAY_START);
    });

    it("builds quick-approvals to include invoices awaiting approval", () => {
      const where = buildWorkQueueWhere({ filter: "quick-approvals" }, "company-1", TODAY_START) as {
        status: { in: string[] };
        dueDate: { gte: Date };
      };
      // PENDING_APPROVAL invoices are exactly what quick approvals must
      // surface; APPROVED (decided) invoices are excluded.
      expect(where.status.in).toEqual(["VALIDATED", "MATCHED", "PENDING_APPROVAL"]);
      expect(where.status.in).not.toContain("APPROVED");
      expect(where.dueDate.gte).toBe(TODAY_START);
    });

    it("builds exceptions filter", () => {
      const where = buildWorkQueueWhere({ filter: "exceptions" }, "company-1", TODAY_START) as {
        status: string;
      };
      expect(where.status).toBe("EXCEPTION");
    });
  });

  describe("toWorkQueuePreviewItem", () => {
    const item: WorkQueueItem = {
      id: "inv-1",
      priority: "high",
      supplier: "Acme Corp",
      supplierId: "vendor-1",
      invoiceNumber: "INV-100",
      invoiceDate: "2026-07-01T00:00:00.000Z",
      dueDate: "2026-08-01T00:00:00.000Z",
      amount: 1200.5,
      currency: "USD",
      status: "Pending Approval",
      assignedTo: null,
      slaStatus: "at-risk",
      exceptionCount: 0,
      poReference: "PO-9",
      invoiceAgeDays: 29,
    };

    it("projects canonical items into the dashboard preview shape", () => {
      expect(toWorkQueuePreviewItem(item)).toEqual({
        id: "inv-1",
        priority: "high",
        supplier: "Acme Corp",
        invoice: "INV-100",
        amount: 1200.5,
        currency: "USD",
        status: "Pending Approval",
        nextAction: "Review & Approve",
      });
    });
  });
});

import { Prisma } from "@prisma/client";
import { HIGH_VALUE_THRESHOLD, PENDING_STATUSES, type VendorInvoiceStatus } from "./constants";
import type { WorkQueueFilters } from "./types";

export const DEFAULT_WORK_QUEUE_FILTERS: WorkQueueFilters = {
  filter: undefined,
  search: undefined,
  sort: "dueDate",
  dir: "asc",
  page: 1,
  pageSize: 25,
};

export interface WorkQueuePagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function getWorkQueuePagination(filter: WorkQueueFilters): WorkQueuePagination {
  const page = Math.max(0, (filter.page ?? 1) - 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 25));
  return { page, pageSize, skip: page * pageSize, take: pageSize };
}

export function buildWorkQueueWhere(
  filter: WorkQueueFilters,
  companyId: string,
  todayStart: Date,
): Prisma.ProcurementVendorInvoiceWhereInput {
  const where: Prisma.ProcurementVendorInvoiceWhereInput = { companyId };

  switch (filter.filter) {
    case "high-priority":
      where.OR = [
        { dueDate: { lt: todayStart } },
        { totalAmount: { gte: new Prisma.Decimal(HIGH_VALUE_THRESHOLD) } },
        { status: "EXCEPTION" as VendorInvoiceStatus },
      ];
      break;
    case "medium-priority":
      where.status = { in: [...PENDING_STATUSES] };
      where.dueDate = { gte: todayStart };
      break;
    case "quick-approvals":
      where.status = { in: ["VALIDATED" as VendorInvoiceStatus, "MATCHED" as VendorInvoiceStatus] };
      where.dueDate = { gte: todayStart };
      break;
    case "exceptions":
      where.status = "EXCEPTION" as VendorInvoiceStatus;
      break;
  }

  return where;
}

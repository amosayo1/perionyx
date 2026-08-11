import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { type VendorInvoiceStatus } from "./constants";
import { derivePriority, deriveSlaStatus, toWorkQueueStatusLabel } from "./status";
import { buildWorkQueueWhere, getWorkQueuePagination } from "./filters";
import type { IWorkQueueService, WorkQueueFilters, WorkQueueItem, PaginatedResult } from "./types";

export class WorkQueueService implements IWorkQueueService {
  async getWorkQueue(companyId: string, filter: WorkQueueFilters): Promise<PaginatedResult<WorkQueueItem>> {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const { skip, take, pageSize } = getWorkQueuePagination(filter);
    const sortField = filter.sort ?? "dueDate";
    const sortDir = filter.dir ?? "asc";
    const where = buildWorkQueueWhere(filter, companyId, todayStart);

    const [totalItems, rows] = await Promise.all([
      prisma.procurementVendorInvoice.count({ where }),
      prisma.procurementVendorInvoice.findMany({
        where,
        include: {
          vendor: { select: { name: true } },
          exceptions: {
            where: { status: "OPEN" },
            select: { id: true },
          },
        },
        orderBy: this.buildOrderBy(sortField, sortDir),
        skip,
        take,
      }),
    ]);

    const items: WorkQueueItem[] = rows.map((row) => {
      const dueDate = new Date(row.dueDate);
      const invoiceDate = new Date(row.invoiceDate);
      const invoiceAgeDays = Math.floor((now.getTime() - invoiceDate.getTime()) / 86400000);
      const totalAmount = row.totalAmount.toNumber();

      return {
        id: row.id,
        priority: derivePriority({ totalAmount, dueDate, todayStart, invoiceAgeDays }),
        supplier: row.vendor.name,
        supplierId: row.vendorId,
        invoiceNumber: row.invoiceNumber,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        amount: totalAmount,
        currency: row.currency,
        status: toWorkQueueStatusLabel(row.status as VendorInvoiceStatus),
        assignedTo: row.approvedBy ?? null,
        slaStatus: deriveSlaStatus(dueDate, todayStart),
        exceptionCount: row.exceptions.length,
        poReference: row.poReferenceId ?? null,
        invoiceAgeDays,
      };
    });

    if (filter.search) {
      const q = filter.search.toLowerCase();
      const filtered = items.filter(
        (i) =>
          i.supplier.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q) ||
          (i.poReference ?? "").toLowerCase().includes(q),
      );
      return {
        items: filtered,
        totalItems: filtered.length,
        page: filter.page ?? 1,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    }

    const totalPages = Math.ceil(totalItems / pageSize);
    return { items, totalItems, page: filter.page ?? 1, pageSize, totalPages };
  }

  private buildOrderBy(sortField: string, sortDir: "asc" | "desc"): Prisma.ProcurementVendorInvoiceOrderByWithRelationInput {
    const fieldMap: Record<string, Prisma.ProcurementVendorInvoiceOrderByWithRelationInput> = {
      invoiceDate: { invoiceDate: sortDir },
      dueDate: { dueDate: sortDir },
      amount: { totalAmount: sortDir },
      invoiceNumber: { invoiceNumber: sortDir },
      status: { status: sortDir },
      createdAt: { createdAt: sortDir },
    };
    return fieldMap[sortField] ?? { dueDate: sortDir };
  }
}

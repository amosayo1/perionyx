/**
 * Phase 22.4 — PO & GRN reference loader.
 *
 * Shared mapping from Prisma `ProcurementPOReference` / `ProcurementGRNReference`
 * rows to the canonical domain value objects (`POReference` / `GRNReference`).
 * Used by both the Decision Workspace service and the Evidence Engine's
 * PurchaseOrderProvider so the mapping exists exactly once.
 */

import { prisma } from "@/server/db/prisma";
import type { POReference, GRNReference } from "./types";
import { toIso, toNumber } from "./prisma-ap-helpers";

export async function loadPOReference(poReferenceId: string, companyId: string): Promise<POReference | null> {
  const row = await prisma.procurementPOReference.findFirst({
    where: { id: poReferenceId, companyId },
    include: { lineItems: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.companyId,
    poNumber: row.poNumber,
    poId: row.poId,
    vendorId: row.vendorId,
    status: row.status,
    orderDate: toIso(row.orderDate) ?? "",
    expectedDeliveryDate: toIso(row.expectedDeliveryDate),
    currency: row.currency,
    totalAmount: toNumber(row.totalAmount),
    receivedAmount: toNumber(row.receivedAmount),
    taxAmount: toNumber(row.taxAmount),
    shippingAmount: toNumber(row.shippingAmount),
    paymentTerms: row.paymentTerms,
    requestedBy: row.requestedBy,
    approvedBy: row.approvedBy,
    approvalDate: toIso(row.approvalDate),
    syncedAt: toIso(row.syncedAt) ?? "",
    lineItems: row.lineItems.map((li) => ({
      id: li.id,
      companyId: li.companyId,
      poReferenceId: li.poReferenceId,
      lineNumber: li.lineNumber,
      description: li.description,
      quantity: toNumber(li.quantity),
      unitOfMeasure: li.unitOfMeasure,
      unitPrice: toNumber(li.unitPrice),
      lineTotal: toNumber(li.lineTotal),
      taxRate: toNumber(li.taxRate),
      taxAmount: toNumber(li.taxAmount),
      glAccountId: li.glAccountId,
      costCenterId: li.costCenterId,
      receivedQuantity: toNumber(li.receivedQuantity),
      invoicedQuantity: toNumber(li.invoicedQuantity),
      status: li.status,
      createdAt: toIso(li.createdAt) ?? "",
      updatedAt: toIso(li.updatedAt) ?? "",
      createdBy: li.createdBy,
      updatedBy: li.updatedBy,
    })),
    createdAt: toIso(row.createdAt) ?? "",
    updatedAt: toIso(row.updatedAt) ?? "",
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export async function loadGRNReference(grnReferenceId: string, companyId: string): Promise<GRNReference | null> {
  const row = await prisma.procurementGRNReference.findFirst({
    where: { id: grnReferenceId, companyId },
    include: { lineItems: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.companyId,
    grnNumber: row.grnNumber,
    grnId: row.grnId,
    poReferenceId: row.poReferenceId,
    vendorId: row.vendorId,
    receiptDate: toIso(row.receiptDate) ?? "",
    status: row.status,
    receivedBy: row.receivedBy,
    warehouseLocation: row.warehouseLocation,
    totalValue: toNumber(row.totalValue),
    totalTax: toNumber(row.totalTax),
    inspectionNotes: row.inspectionNotes,
    syncedAt: toIso(row.syncedAt) ?? "",
    lineItems: row.lineItems.map((li) => ({
      id: li.id,
      companyId: li.companyId,
      grnReferenceId: li.grnReferenceId,
      poReferenceLineItemId: li.poReferenceLineItemId,
      lineNumber: li.lineNumber,
      description: li.description,
      quantityReceived: toNumber(li.quantityReceived),
      quantityAccepted: toNumber(li.quantityAccepted),
      quantityRejected: toNumber(li.quantityRejected),
      unitOfMeasure: li.unitOfMeasure,
      unitPrice: toNumber(li.unitPrice),
      lineTotal: toNumber(li.lineTotal),
      condition: li.condition,
      createdAt: toIso(li.createdAt) ?? "",
      updatedAt: toIso(li.updatedAt) ?? "",
      createdBy: li.createdBy,
      updatedBy: li.updatedBy,
    })),
    createdAt: toIso(row.createdAt) ?? "",
    updatedAt: toIso(row.updatedAt) ?? "",
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

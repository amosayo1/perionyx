/**
 * Phase 22.4 — AP Evidence Providers: Purchase Order
 *
 * The purchase side of the three-way match — the referenced purchase order and
 * goods receipt (GRN). Contributes to the relationships section.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice, loadPO, loadGRN } from "./loaders";
import { formatCurrency, formatDate, formatDateTime } from "@/modules/decision-workspace/format";
import type { GRNReference, POReference, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class PurchaseOrderProvider implements IEvidenceProvider {
  readonly id = "ap.purchase-order";
  readonly name = "AP Purchase Order";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository", "prisma.procurementPOReference"];

  readonly required: RequiredEvidence[] = [
    {
      id: "po.attachment",
      sectionId: "relationships",
      label: "Purchase order",
      reason: "Without a PO there is no commitment anchor for the three-way match.",
      blocking: false,
      satisfiedBy: ["po.id"],
    },
    {
      id: "grn.attachment",
      sectionId: "relationships",
      label: "Goods receipt",
      reason: "Receipt proves delivery; missing GRN blocks the match.",
      blocking: false,
      satisfiedBy: ["grn.id"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const po = await loadPO(context, invoice);
    const grn = await loadGRN(context, invoice);
    const currency = invoice.currency || "USD";

    return contribution(this.id, [
      section("relationships", [...this.poItems(po, invoice, currency), ...this.grnItems(grn, invoice, currency)]),
    ], [], this.sourceSystems);
  }

  private poItems(po: POReference | null, invoice: VendorInvoice, currency: string): EvidenceItem[] {
    if (!po) {
      return [
        item({
          id: "po.none",
          sectionId: "relationships",
          groupId: "po",
          title: "Purchase order",
          summary: "Not attached",
          reason: "A PO anchors the three-way match; a PO-less invoice needs exception handling.",
          source: apSource("POReference", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "high",
          status: invoice.poReferenceId ? "negative" : "pending",
          confidence: "none",
          confidenceBasis: invoice.poReferenceId ? "PO reference missing from repository" : "No PO reference on the invoice",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      ];
    }
    const variance = po.totalAmount - invoice.totalWithTax;
    return [
      item({
        id: "po.id",
        sectionId: "relationships",
        groupId: "po",
        title: "PO number",
        summary: po.poNumber,
        reason: "Links the invoice to the approved commitment.",
        source: apSource("POReference", po.id, po.orderDate),
        timestamp: po.orderDate,
        importance: "medium",
        status: po.status === "CANCELLED" ? "negative" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [`status ${po.status.replace(/_/g, " ")}`],
        related: [invoice.id, po.id],
        order: 0,
      }),
      item({
        id: "po.amount",
        sectionId: "relationships",
        groupId: "po",
        title: "Ordered vs invoiced",
        summary: `${formatCurrency(po.totalAmount, currency)} vs ${formatCurrency(invoice.totalWithTax, currency)}`,
        reason: "A price gap between PO and invoice is a variance that must be explained.",
        source: apSource("POReference", po.id, po.updatedAt),
        timestamp: po.updatedAt,
        importance: "high",
        status: Math.abs(variance) < 0.01 ? "positive" : "pending",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [`variance ${formatCurrency(variance, currency)}`],
        related: [invoice.id, po.id],
        order: 1,
      }),
      item({
        id: "po.received",
        sectionId: "relationships",
        groupId: "po",
        title: "Received",
        summary: `${formatCurrency(po.receivedAmount, currency)} of ${formatCurrency(po.totalAmount, currency)}`,
        reason: "Goods not yet received should not be paid in full.",
        source: apSource("POReference", po.id, po.updatedAt),
        timestamp: po.updatedAt,
        importance: "medium",
        status: po.receivedAmount >= po.totalAmount ? "positive" : "pending",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [],
        related: [invoice.id, po.id],
        order: 2,
      }),
      item({
        id: "po.dates",
        sectionId: "relationships",
        groupId: "po",
        title: "Ordered / expected delivery",
        summary: `${formatDate(po.orderDate)} / ${formatDate(po.expectedDeliveryDate)}`,
        reason: "Delivery timing checks the goods-receipt side of the match.",
        source: apSource("POReference", po.id, po.expectedDeliveryDate ?? po.orderDate),
        timestamp: po.expectedDeliveryDate ?? po.orderDate,
        importance: "low",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [],
        related: [invoice.id, po.id],
        order: 3,
      }),
    ];
  }

  private grnItems(grn: GRNReference | null, invoice: VendorInvoice, currency: string): EvidenceItem[] {
    if (!grn) {
      return [
        item({
          id: "grn.none",
          sectionId: "relationships",
          groupId: "grn",
          title: "Goods receipt",
          summary: "Not attached",
          reason: "Receipt proves the goods arrived; missing GRN blocks the match.",
          source: apSource("GRNReference", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "high",
          status: invoice.grnReferenceId ? "negative" : "pending",
          confidence: "none",
          confidenceBasis: invoice.grnReferenceId ? "GRN reference missing from repository" : "No GRN reference on the invoice",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      ];
    }
    const items: EvidenceItem[] = [
      item({
        id: "grn.id",
        sectionId: "relationships",
        groupId: "grn",
        title: "GRN number",
        summary: grn.grnNumber,
        reason: "Confirms the goods-receipt side of the three-way match.",
        source: apSource("GRNReference", grn.id, grn.receiptDate),
        timestamp: grn.receiptDate,
        importance: "medium",
        status: grn.status === "REJECTED" ? "negative" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [`status ${grn.status}`, `received ${formatDateTime(grn.receiptDate)}`],
        related: [invoice.id, grn.id, grn.poReferenceId],
        order: 0,
      }),
      item({
        id: "grn.value",
        sectionId: "relationships",
        groupId: "grn",
        title: "Received value",
        summary: formatCurrency(grn.totalValue, currency),
        reason: "Received value vs invoiced value exposes over-invoicing.",
        source: apSource("GRNReference", grn.id, grn.receiptDate),
        timestamp: grn.receiptDate,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [`tax ${formatCurrency(grn.totalTax, currency)}`],
        related: [invoice.id, grn.id],
        order: 1,
      }),
    ];
    if (grn.inspectionNotes) {
      items.push(
        item({
          id: "grn.notes",
          sectionId: "relationships",
          groupId: "grn",
          title: "Inspection notes",
          summary: grn.inspectionNotes,
          reason: "Inspection findings can change whether a receipt is accepted.",
          source: apSource("GRNReference", grn.id, grn.receiptDate),
          timestamp: grn.receiptDate,
          importance: "low",
          status: "neutral",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice.id, grn.id],
          expandable: true,
          order: 2,
        }),
      );
    }
    return items;
  }
}

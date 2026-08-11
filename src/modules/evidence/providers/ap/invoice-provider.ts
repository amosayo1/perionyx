/**
 * Phase 22.4 — AP Evidence Providers: Invoice
 *
 * The central entity provider. Contributes the invoice's identity, financial
 * context, line-item detail, and the three-way match result. Reads via the
 * canonical load keys so the Decision Workspace can seed pre-loaded data and
 * the engine never re-fetches what the caller already has.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS, resolveCurrency, invoiceAge } from "./helpers";
import { loadInvoice, loadVendor, loadLineItems, loadMatch } from "./loaders";
import { bandFromScore } from "@/modules/decision-workspace/recommendation";
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent } from "@/modules/decision-workspace/format";
import type { InvoiceLineItem, ThreeWayMatch, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class InvoiceProvider implements IEvidenceProvider {
  readonly id = "ap.invoice";
  readonly name = "AP Invoice";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [
    {
      id: "invoice.record",
      sectionId: "identity",
      label: "Invoice record",
      reason: "No decision can be made without the invoice record itself.",
      blocking: true,
      satisfiedBy: ["inv.amount"],
    },
    {
      id: "invoice.exposure",
      sectionId: "financial-context",
      label: "Invoiced exposure",
      reason: "The amount at risk must be known before any approval.",
      blocking: true,
      satisfiedBy: ["inv.balance"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return this.missingInvoice(context);

    const vendor = await loadVendor(context, invoice);
    const currency = resolveCurrency(invoice, vendor?.currency);

    const identity = section("identity", [
      item({
        id: "inv.dates",
        sectionId: "identity",
        groupId: "invoice",
        title: "Invoice / due / received",
        summary: `${formatDate(invoice.invoiceDate)} · ${formatDate(invoice.dueDate)} · ${formatDate(invoice.receivedDate)}`,
        reason: "Due date drives payment timing and SLA risk.",
        source: apSource("VendorInvoice", invoice.id, invoice.invoiceDate),
        timestamp: invoice.receivedDate,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [invoice.invoiceNumber],
        related: [invoice.id],
        order: 0,
      }),
      item({
        id: "inv.age",
        sectionId: "identity",
        groupId: "invoice",
        title: "Invoice age",
        summary: invoiceAge(invoice, context.request.now),
        reason: "Aging invoices can breach payment terms or supplier expectations.",
        source: apSource("VendorInvoice", invoice.id, invoice.receivedDate),
        timestamp: invoice.receivedDate,
        importance: "medium",
        status: invoice.status === "PARTIALLY_PAID" || invoice.status === "PAID" ? "neutral" : "pending",
        confidence: "high",
        confidenceBasis: "Computed from recorded received date",
        evidence: [invoice.receivedDate],
        related: [invoice.id],
        order: 1,
      }),
      item({
        id: "inv.terms",
        sectionId: "identity",
        groupId: "invoice",
        title: "Payment terms / source",
        summary: `${invoice.paymentTerms ?? "—"} · ${invoice.source}`,
        reason: "Terms determine the discount and late-payment exposure.",
        source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
        timestamp: null,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [invoice.invoiceNumber],
        related: [invoice.id],
        order: 2,
      }),
    ]);

    const financial = section("financial-context", [
      item({
        id: "inv.amount",
        sectionId: "financial-context",
        groupId: "invoice",
        title: "Total with tax",
        summary: formatCurrency(invoice.totalWithTax, currency),
        reason: "The exposure this decision commits the company to.",
        source: apSource("VendorInvoice", invoice.id, invoice.invoiceDate),
        timestamp: invoice.invoiceDate,
        importance: "high",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [invoice.invoiceNumber],
        related: [invoice.id],
        order: 0,
      }),
      item({
        id: "inv.balance",
        sectionId: "financial-context",
        groupId: "invoice",
        title: "Balance due",
        summary: formatCurrency(invoice.netBalance ?? invoice.balanceDue, currency),
        reason: "What remains payable after payments and credits applied.",
        source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
        timestamp: invoice.updatedAt,
        importance: "high",
        status: invoice.netBalance > 0 ? "pending" : "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [invoice.invoiceNumber],
        related: [invoice.id],
        order: 1,
      }),
      item({
        id: "inv.subtotal",
        sectionId: "financial-context",
        groupId: "invoice",
        title: "Subtotal / tax",
        summary: `${formatCurrency(invoice.subtotal, currency)} / ${formatCurrency(invoice.taxAmount, currency)}`,
        reason: "Confirms tax was separated and matches the supplier statement.",
        source: apSource("VendorInvoice", invoice.id, invoice.invoiceDate),
        timestamp: invoice.invoiceDate,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [invoice.invoiceNumber],
        related: [invoice.id],
        order: 2,
      }),
      item({
        id: "inv.gl",
        sectionId: "financial-context",
        groupId: "invoice",
        title: "GL coding",
        summary: invoice.glAccountId ? "Assigned" : "Not assigned",
        reason: "Uncoded invoices stall the close and trip GL exception rules.",
        source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
        timestamp: invoice.updatedAt,
        importance: "medium",
        status: invoice.glAccountId ? "positive" : "pending",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: invoice.glAccountId ? [invoice.glAccountId] : [],
        related: [invoice.id],
        order: 3,
      }),
    ]);

    const lineItems = await loadLineItems(context, invoice);
    const match = await loadMatch(context, invoice);

    const business = section("business-context", [
      ...this.lineItemItems(lineItems, invoice, currency),
      ...this.matchItems(match, invoice, currency),
    ]);

    return contribution(this.id, [identity, financial, business], [], this.sourceSystems);
  }

  private lineItemItems(lines: InvoiceLineItem[], invoice: VendorInvoice, currency: string): EvidenceItem[] {
    if (lines.length === 0) {
      return [
        item({
          id: "line.none",
          sectionId: "business-context",
          groupId: "line-items",
          title: "Line items",
          summary: "None recorded",
          reason: "An invoice with no lines cannot be matched or audited line-by-line.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "medium",
          status: "pending",
          confidence: "none",
          confidenceBasis: "No line items present in the repository",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      ];
    }
    const matched = lines.filter((l) => l.matchStatus === "MATCHED").length;
    const variance = lines.filter((l) => l.matchStatus === "VARIANCE").length;
    const unmatched = lines.filter((l) => l.matchStatus === "UNMATCHED").length;
    const items: EvidenceItem[] = [
      item({
        id: "line.summary",
        sectionId: "business-context",
        groupId: "line-items",
        title: `${lines.length} lines`,
        summary: `${matched} matched · ${variance} variance · ${unmatched} unmatched`,
        reason: "Line-level match status is the granular truth behind the match score.",
        source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
        timestamp: invoice.updatedAt,
        importance: "medium",
        status: variance + unmatched === 0 ? "positive" : "pending",
        confidence: "high",
        confidenceBasis: "Counted from recorded line match status",
        evidence: [`${lines.length} lines`],
        related: [invoice.id],
        expandable: true,
        order: 0,
      }),
    ];
    lines
      .filter((l) => l.matchStatus && l.matchStatus !== "MATCHED")
      .slice(0, 4)
      .forEach((l, index) => {
        items.push(
          item({
            id: `line.${l.lineNumber}`,
            sectionId: "business-context",
            groupId: "line-items",
            title: `Line ${l.lineNumber} — ${l.description.slice(0, 48)}`,
            summary: `${formatNumber(l.quantity)} × ${formatCurrency(l.unitPrice, currency)} = ${formatCurrency(l.netLineTotal, currency)}`,
            reason: "Unmatched/variance lines are what break a clean three-way match.",
            source: apSource("VendorInvoice", invoice.id, l.updatedAt),
            timestamp: l.updatedAt,
            importance: "medium",
            status: l.matchStatus === "UNMATCHED" ? "negative" : "pending",
            confidence: "high",
            confidenceBasis: RECORDED_BASIS,
            evidence: [`${l.matchStatus ?? "no match status"} · variance ${formatCurrency(l.matchVariance, currency)}`],
            related: [invoice.id, l.poReferenceLineItemId ?? undefined].filter(Boolean) as string[],
            expandable: true,
            order: index + 1,
          }),
        );
      });
    return items;
  }

  private matchItems(match: ThreeWayMatch | null, invoice: VendorInvoice, currency: string): EvidenceItem[] {
    if (!match) {
      return [
        item({
          id: "match.none",
          sectionId: "business-context",
          groupId: "matching",
          title: "Three-way match",
          summary: "Not run",
          reason: "Without a match there is no measured basis for approval.",
          source: apSource("ThreeWayMatch", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "high",
          status: "pending",
          confidence: "none",
          confidenceBasis: "No match record exists for this invoice",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      ];
    }
    const band = bandFromScore(match.overallConfidence);
    return [
      item({
        id: "match.result",
        sectionId: "business-context",
        groupId: "matching",
        title: "Match result",
        summary: match.matchResult.replace(/_/g, " "),
        reason: "The core acceptance signal for approval.",
        source: apSource("ThreeWayMatch", match.id, match.matchedAt),
        timestamp: match.matchedAt,
        importance: "high",
        status: match.matchResult === "FULL_MATCH" ? "positive" : "pending",
        confidence: band,
        confidenceBasis: `Overall confidence ${match.overallConfidence.toFixed(2)} measured across the match`,
        evidence: [match.id, `matched ${formatDateTime(match.matchedAt)}`],
        related: [invoice.id, match.poReferenceId, match.grnReferenceId],
        order: 0,
      }),
      item({
        id: "match.variance",
        sectionId: "business-context",
        groupId: "matching",
        title: "Variance",
        summary: `${formatCurrency(match.totalVariance, currency)} (${formatPercent(match.variancePercent, 2)})`,
        reason: "Variance above tolerance is the trigger for exception workflows.",
        source: apSource("ThreeWayMatch", match.id, match.matchedAt),
        timestamp: match.matchedAt,
        importance: "medium",
        status: match.totalVariance === 0 ? "positive" : "pending",
        confidence: band,
        confidenceBasis: "Summed from line-level price and quantity variances",
        evidence: [`price ${formatCurrency(match.priceVarianceTotal, currency)} · qty ${formatCurrency(match.quantityVarianceTotal, currency)}`],
        related: [invoice.id],
        order: 1,
      }),
      item({
        id: "match.auto",
        sectionId: "business-context",
        groupId: "matching",
        title: "Auto-approval",
        summary: match.autoApproved ? "Auto-approved" : "Manual approval",
        reason: "Tells you whether a machine already cleared this invoice.",
        source: apSource("ThreeWayMatch", match.id, match.matchedAt),
        timestamp: match.matchedAt,
        importance: "medium",
        status: match.autoApproved ? "positive" : "pending",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [`threshold ${formatCurrency(match.approvalThreshold, currency)}`],
        related: [invoice.id],
        order: 2,
      }),
    ];
  }

  private missingInvoice(context: EvidenceAssemblyContext): EvidenceContribution {
    const now = context.request.now ?? new Date().toISOString();
    const items: EvidenceItem[] = [
      item({
        id: "invoice.none",
        sectionId: "identity",
        groupId: "invoice",
        title: "Invoice record",
        summary: "Not found",
        reason: "No invoice record exists for this entity id — nothing can be decided.",
        source: apSource("VendorInvoice", context.request.entityId, now),
        timestamp: now,
        importance: "high",
        status: "negative",
        confidence: "none",
        confidenceBasis: "No invoice record exists for this entity id",
        evidence: [],
        related: [],
        order: 0,
      }),
    ];
    return contribution(this.id, [section("identity", items)], [], this.sourceSystems);
  }
}

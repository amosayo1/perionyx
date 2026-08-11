/**
 * Phase 22.4 — AP Evidence Providers: Vendor
 *
 * Supplier identity, risk, and same-supplier behavior history. Contributes to
 * the relationships and risk sections; the recent-invoices surface projects to
 * the workspace's "similar cases" group.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice, loadVendor, loadRecentInvoices } from "./loaders";
import { toWorkQueueStatusLabel } from "@/modules/work-queue/status";
import { formatCurrency, formatCompact, formatDate } from "@/modules/decision-workspace/format";
import type { Vendor, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class VendorProvider implements IEvidenceProvider {
  readonly id = "ap.vendor";
  readonly name = "AP Vendor";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [
    {
      id: "vendor.identity",
      sectionId: "relationships",
      label: "Supplier identity",
      reason: "You cannot pay a supplier you cannot identify.",
      blocking: true,
      satisfiedBy: ["vendor.identity"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    const vendor = await loadVendor(context, invoice);
    const currency = invoice?.currency || vendor?.currency || "USD";

    if (!vendor) {
      return this.missingVendor(context, invoice);
    }

    const relationships: EvidenceItem[] = [
      item({
        id: "vendor.identity",
        sectionId: "relationships",
        groupId: "vendor",
        title: "Supplier",
        summary: `${vendor.name} (${vendor.vendorCode})`,
        reason: "Identity confirms you are paying the right legal entity.",
        source: apSource("Vendor", vendor.id, vendor.createdAt),
        timestamp: vendor.createdAt,
        importance: "high",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [vendor.category, vendor.contactEmail ?? undefined].filter(Boolean) as string[],
        related: [invoice?.id ?? "", vendor.id].filter(Boolean),
        order: 3,
      }),
      item({
        id: "vendor.activity",
        sectionId: "relationships",
        groupId: "vendor",
        title: "Spend / orders / avg payment days",
        summary: `${formatCompact(vendor.totalSpend)} ${currency} · ${vendor.totalOrders} orders · ${vendor.avgPaymentDays} days`,
        reason: "Payment behavior and volume calibrate trust in the supplier.",
        source: apSource("Vendor", vendor.id, vendor.updatedAt),
        timestamp: vendor.updatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [],
        related: [invoice?.id ?? "", vendor.id].filter(Boolean),
        order: 2,
      }),
    ];

    const risk: EvidenceItem[] = [
      item({
        id: "vendor.risk",
        sectionId: "risk",
        groupId: "vendor",
        title: "Risk level",
        summary: `${vendor.riskLevel} · score ${vendor.riskScore.toFixed(1)}`,
        reason: "Supplier risk affects approval authority and payment terms.",
        source: apSource("Vendor", vendor.id, vendor.updatedAt),
        timestamp: vendor.updatedAt,
        importance: "high",
        status: vendor.riskLevel === "LOW" ? "positive" : vendor.riskLevel === "MEDIUM" ? "pending" : "negative",
        confidence: "high",
        confidenceBasis: "Risk score computed by vendor risk assessment",
        evidence: [],
        related: [invoice?.id ?? "", vendor.id].filter(Boolean),
        order: 0,
      }),
    ];
    if (vendor.isBlocked) {
      risk.push(
        item({
          id: "vendor.blocked",
          sectionId: "risk",
          groupId: "vendor",
          title: "Vendor blocked",
          summary: vendor.blockReason ?? "Blocked",
          reason: "Paying a blocked vendor violates the payment blacklist.",
          source: apSource("Vendor", vendor.id, vendor.updatedAt),
          timestamp: vendor.updatedAt,
          importance: "high",
          status: "negative",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice?.id ?? "", vendor.id].filter(Boolean),
          order: 1,
        }),
      );
    }

    const similar = this.similarItems(await loadRecentInvoices(context, invoice), invoice, currency);

    return contribution(this.id, [section("relationships", relationships), section("risk", risk), section("history", similar)], [], this.sourceSystems);
  }

  private similarItems(recent: VendorInvoice[], invoice: VendorInvoice | null, currency: string): EvidenceItem[] {
    if (recent.length === 0) {
      return [
        item({
          id: "similar.none",
          sectionId: "history",
          groupId: "similar-cases",
          title: "Similar cases",
          summary: "None on record",
          reason: "Without precedent, first-time supplier invoices warrant closer review.",
          source: apSource("VendorInvoice", invoice?.id ?? "", invoice?.updatedAt ?? null),
          timestamp: null,
          importance: "low",
          status: "neutral",
          confidence: "none",
          confidenceBasis: "No other invoices found for this supplier",
          evidence: [],
          related: invoice ? [invoice.id] : [],
          order: 0,
        }),
      ];
    }
    return recent.slice(0, 5).map((ri, index) =>
      item({
        id: `similar.${ri.id}`,
        sectionId: "history",
        groupId: "similar-cases",
        title: ri.invoiceNumber,
        summary: `${formatCurrency(ri.totalWithTax, ri.currency || currency)} · ${toWorkQueueStatusLabel(ri.status)}`,
        reason: "Same-supplier history reveals repeated patterns (late deliveries, disputes).",
        source: apSource("VendorInvoice", ri.id, ri.invoiceDate),
        timestamp: ri.invoiceDate,
        importance: "low",
        status: ri.status === "PAID" ? "positive" : ri.status === "REJECTED" ? "negative" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [formatDate(ri.invoiceDate), ri.invoiceDate === invoice?.invoiceDate ? "same date as this invoice" : undefined].filter(Boolean) as string[],
        related: [ri.id, invoice?.id ?? undefined].filter(Boolean) as string[],
        order: index + 1,
      }),
    );
  }

  private missingVendor(context: EvidenceAssemblyContext, invoice: VendorInvoice | null): EvidenceContribution {
    const now = context.request.now ?? new Date().toISOString();
    const items: EvidenceItem[] = [
      item({
        id: "vendor.missing",
        sectionId: "relationships",
        groupId: "vendor",
        title: "Supplier",
        summary: "Not found",
        reason: "An invoice without a supplier cannot be paid or reconciled.",
        source: apSource("Vendor", invoice?.vendorId ?? context.request.entityId, now),
        timestamp: null,
        importance: "high",
        status: "negative",
        confidence: "none",
        confidenceBasis: "No vendor record exists for this invoice's vendorId",
        evidence: [],
        related: invoice ? [invoice.id] : [],
        order: 0,
      }),
    ];
    return contribution(this.id, [section("relationships", items)], [], this.sourceSystems);
  }
}

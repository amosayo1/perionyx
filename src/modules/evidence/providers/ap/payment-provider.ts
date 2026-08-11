/**
 * Phase 22.4 — AP Evidence Providers: Payment
 *
 * Disbursement history for the invoice (payments) plus open vendor credit
 * notes. Payments project to the workspace's "transaction history" group;
 * open credits are engine-level history evidence.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice, loadPayments, loadOpenCredits } from "./loaders";
import { formatCurrency, formatDate } from "@/modules/decision-workspace/format";
import type { PaymentRecord, VendorCredit, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class PaymentProvider implements IEvidenceProvider {
  readonly id = "ap.payment";
  readonly name = "AP Payment";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const payments = await loadPayments(context, invoice);
    const credits = await loadOpenCredits(context, invoice);
    const currency = invoice.currency || "USD";

    return contribution(this.id, [
      section("history", [...this.paymentItems(payments, invoice, currency), ...this.creditItems(credits, invoice, currency)]),
    ], [], this.sourceSystems);
  }

  private paymentItems(payments: PaymentRecord[], invoice: VendorInvoice, currency: string): EvidenceItem[] {
    if (payments.length === 0) {
      return [
        item({
          id: "tx.none",
          sectionId: "history",
          groupId: "transaction-history",
          title: "Payment history",
          summary: "No payments recorded",
          reason: "First payment on the invoice — nothing has been disbursed yet.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "medium",
          status: "neutral",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      ];
    }
    return payments.slice(0, 5).map((p, index) =>
      item({
        id: `tx.${p.id}`,
        sectionId: "history",
        groupId: "transaction-history",
        title: p.paymentNumber,
        summary: `${formatCurrency(p.netPayment, p.currency || currency)} · ${p.status}`,
        reason: "Payment records reconcile the invoice to cash out.",
        source: apSource("PaymentRecord", p.id, p.paymentDate),
        timestamp: p.paymentDate,
        importance: "medium",
        status:
          p.status === "PROCESSED" || p.status === "CLEARED" ? "positive" : p.status === "FAILED" || p.status === "REVERSED" || p.status === "VOIDED" ? "negative" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [formatDate(p.paymentDate), p.transactionReference ?? undefined].filter(Boolean) as string[],
        related: [invoice.id, p.paymentBatchId],
        order: index + 1,
      }),
    );
  }

  private creditItems(credits: VendorCredit[], invoice: VendorInvoice, currency: string): EvidenceItem[] {
    if (credits.length === 0) return [];
    const remaining = credits.reduce((sum, c) => sum + (c.creditAmount - c.appliedAmount), 0);
    return [
      item({
        id: "credit.open",
        sectionId: "history",
        groupId: "credits",
        title: "Open credit notes",
        summary: `${credits.length} open credit(s) totalling ${formatCurrency(remaining, currency)}`,
        reason: "Unapplied supplier credits reduce the amount actually owed.",
        source: apSource("VendorCredit", credits[0].id, credits[0].updatedAt),
        timestamp: credits[0].updatedAt,
        importance: "medium",
        status: "pending",
        confidence: "high",
        confidenceBasis: "Summed from open vendor credit records",
        evidence: credits.slice(0, 3).map((c) => `${c.creditNumber} · ${c.status}`),
        related: [invoice.id],
        expandable: true,
        order: 0,
      }),
    ];
  }
}

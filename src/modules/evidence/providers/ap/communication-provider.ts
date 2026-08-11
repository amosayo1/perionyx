/**
 * Phase 22.4 — AP Evidence Providers: Communication
 *
 * Vendor and internal memos attached to the invoice — context from the two
 * sides of the exchange. Contributes to the communications section.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice } from "./loaders";
import type { VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class CommunicationProvider implements IEvidenceProvider {
  readonly id = "ap.communication";
  readonly name = "AP Communication";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const items: EvidenceItem[] = [];
    if (!invoice.vendorMemo && !invoice.internalMemo) {
      items.push(
        item({
          id: "comm.none",
          sectionId: "communications",
          groupId: "communications",
          title: "Communications",
          summary: "No notes on record",
          reason: "Absence of context increases ambiguity for the approver.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "low",
          status: "neutral",
          confidence: "none",
          confidenceBasis: "No vendor or internal memo present",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      );
    }
    if (invoice.vendorMemo) {
      items.push(
        item({
          id: "comm.vendor",
          sectionId: "communications",
          groupId: "communications",
          title: "Vendor memo",
          summary: invoice.vendorMemo,
          reason: "What the supplier says about this invoice.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: invoice.updatedAt,
          importance: "medium",
          status: "neutral",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice.id],
          expandable: true,
          order: 1,
        }),
      );
    }
    if (invoice.internalMemo) {
      items.push(
        item({
          id: "comm.internal",
          sectionId: "communications",
          groupId: "communications",
          title: "Internal memo",
          summary: invoice.internalMemo,
          reason: "What your team has already concluded about this invoice.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: invoice.updatedAt,
          importance: "medium",
          status: "neutral",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice.id],
          expandable: true,
          order: 2,
        }),
      );
    }

    return contribution(this.id, items.length > 0 ? [section("communications", items)] : [], [], this.sourceSystems);
  }
}

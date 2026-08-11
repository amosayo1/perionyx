/**
 * Phase 22.4 — AP Evidence Providers: Document
 *
 * Source documents attached to the invoice — the primary evidence behind the
 * recorded numbers. Contributes to the supporting-documents section.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource } from "./helpers";
import { loadInvoice, loadAttachments } from "./loaders";
import { formatBytes } from "@/modules/decision-workspace/format";
import type { InvoiceAttachment, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class DocumentProvider implements IEvidenceProvider {
  readonly id = "ap.document";
  readonly name = "AP Document";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const attachments = await loadAttachments(context, invoice);
    const items = this.items(attachments, invoice);

    return contribution(this.id, items.length > 0 ? [section("supporting-documents", items)] : [], [], this.sourceSystems);
  }

  private items(attachments: InvoiceAttachment[], invoice: VendorInvoice): EvidenceItem[] {
    if (attachments.length === 0) {
      return [
        item({
          id: "docs.none",
          sectionId: "supporting-documents",
          groupId: "supporting-documents",
          title: "Supporting documents",
          summary: "None attached",
          reason: "Missing source documents weaken the audit trail.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "medium",
          status: "neutral",
          confidence: "none",
          confidenceBasis: "No attachments recorded",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      ];
    }
    return attachments.slice(0, 8).map((a, index) =>
      item({
        id: `doc.${a.id}`,
        sectionId: "supporting-documents",
        groupId: "supporting-documents",
        title: a.fileName,
        summary: `${a.category.replace(/_/g, " ")} · ${a.fileType} · ${formatBytes(a.fileSize)}`,
        reason: "The document is the primary evidence behind the recorded numbers.",
        source: apSource("InvoiceAttachment", a.id, a.createdAt),
        timestamp: a.createdAt,
        importance: "medium",
        status: "neutral",
        confidence: a.ocrExtracted ? "high" : "medium",
        confidenceBasis: a.ocrExtracted ? "OCR extracted" : "Document present, OCR not extracted",
        evidence: [a.storageUrl],
        related: [invoice.id],
        order: index,
      }),
    );
  }
}

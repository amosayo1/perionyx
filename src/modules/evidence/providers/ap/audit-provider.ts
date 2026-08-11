/**
 * Phase 22.4 — AP Evidence Providers: Audit
 *
 * The append-only audit trail for the invoice — a tamper-evident record of
 * every state change. Engine-level evidence (workspace projects its own
 * timeline separately); the load cache shares the audit fetch with the
 * Timeline provider so the record is read once per assembly.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice, loadAudit } from "./loaders";
import { formatDateTime } from "@/modules/decision-workspace/format";
import type { APAuditRecord, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class AuditProvider implements IEvidenceProvider {
  readonly id = "ap.audit";
  readonly name = "AP Audit";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const audit = await loadAudit(context, invoice);
    if (audit.length === 0) return contribution(this.id, [], [], this.sourceSystems);

    const items = audit.slice(0, 12).map((record, index) =>
      item({
        id: `audit.${record.id}`,
        sectionId: "history",
        groupId: "audit",
        title: record.action.replace(/_/g, " "),
        summary: this.describe(record),
        reason: "The audit trail is the tamper-evident record of this invoice's lifecycle.",
        source: apSource("APAuditRecord", record.id, record.createdAt),
        timestamp: record.createdAt,
        importance: "low",
        status: record.action === "VOIDED" || record.action === "REJECTED" ? "negative" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [formatDateTime(record.createdAt), `by ${record.userRole} (${record.userId.slice(0, 8)})`],
        related: [invoice.id],
        expandable: true,
        order: index,
      }),
    );

    return contribution(this.id, [section("history", items)], [], this.sourceSystems);
  }

  private describe(record: APAuditRecord): string {
    if (record.field && record.newValue != null) {
      return `${record.field}: ${record.oldValue ?? "—"} → ${record.newValue}`;
    }
    return record.description || record.action.replace(/_/g, " ");
  }
}

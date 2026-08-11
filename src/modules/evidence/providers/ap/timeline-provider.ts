/**
 * Phase 22.4 — AP Evidence Providers: Timeline
 *
 * The chronological event stream for the decision, sourced from the audit
 * trail and the approval chain. Engine-level evidence; shares the audit fetch
 * with the Audit provider through the load cache.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice, loadAudit, loadApprovals } from "./loaders";
import { formatDateTime } from "@/modules/decision-workspace/format";
import type { APAuditRecord, ApprovalRecord, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class TimelineProvider implements IEvidenceProvider {
  readonly id = "ap.timeline";
  readonly name = "AP Timeline";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const audit = await loadAudit(context, invoice);
    const approvals = await loadApprovals(context, invoice);

    const events: EvidenceItem[] = [];
    for (const record of audit.slice(0, 8)) {
      events.push(this.fromAudit(record, invoice));
    }
    for (const approval of approvals.slice(0, 5)) {
      events.push(this.fromApproval(approval, invoice));
    }
    events.sort((a, b) => (a.timestamp ?? "").localeCompare(b.timestamp ?? ""));

    return contribution(this.id, events.length > 0 ? [section("timeline", events)] : [], [], this.sourceSystems);
  }

  private fromAudit(record: APAuditRecord, invoice: VendorInvoice): EvidenceItem {
    return item({
      id: `timeline.audit.${record.id}`,
      sectionId: "timeline",
      groupId: "timeline",
      title: record.action.replace(/_/g, " "),
      summary: record.description || `${record.action.replace(/_/g, " ")} — ${record.userRole}`,
      reason: "Ordering events chronologically shows the sequence behind the current state.",
      source: apSource("APAuditRecord", record.id, record.createdAt),
      timestamp: record.createdAt,
      importance: "low",
      status: "neutral",
      confidence: "high",
      confidenceBasis: RECORDED_BASIS,
      evidence: [`by ${record.userId.slice(0, 8)}`, formatDateTime(record.createdAt)],
      related: [invoice.id],
      order: 0,
    });
  }

  private fromApproval(approval: ApprovalRecord, invoice: VendorInvoice): EvidenceItem {
    const decided = approval.decisionAt ?? approval.createdAt;
    return item({
      id: `timeline.approval.${approval.id}`,
      sectionId: "timeline",
      groupId: "timeline",
      title: `${approval.decision ?? approval.status} — ${approval.approvalLevelName}`,
      summary: approval.decisionComment ?? `Approval level ${approval.approvalLevel} ${approval.status.toLowerCase()}`,
      reason: "Approval acts are decision events an auditor can trace.",
      source: apSource("ApprovalRecord", approval.id, decided),
      timestamp: decided,
      importance: "medium",
      status: approval.decision === "APPROVE" ? "positive" : approval.decision === "REJECT" ? "negative" : "neutral",
      confidence: "high",
      confidenceBasis: RECORDED_BASIS,
      evidence: [approval.decisionBy ?? "system"],
      related: [invoice.id],
      order: 0,
    });
  }
}

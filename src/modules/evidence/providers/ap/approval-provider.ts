/**
 * Phase 22.4 — AP Evidence Providers: Approval
 *
 * The approval chain on this invoice — named, timestamped acts that an auditor
 * can trace. Contributes to the history section.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS } from "./helpers";
import { loadInvoice, loadApprovals } from "./loaders";
import type { ApprovalRecord, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class ApprovalProvider implements IEvidenceProvider {
  readonly id = "ap.approval";
  readonly name = "AP Approval";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [
    {
      id: "approval.history",
      sectionId: "history",
      label: "Approval decisions",
      reason: "Named, timestamped approval acts are required for audit.",
      blocking: false,
      satisfiedBy: ["prev.id"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const approvals = await loadApprovals(context, invoice);
    return contribution(this.id, [section("history", this.items(approvals, invoice))], [], this.sourceSystems);
  }

  private items(approvals: ApprovalRecord[], invoice: VendorInvoice): EvidenceItem[] {
    if (approvals.length === 0) {
      return [
        item({
          id: "prev.none",
          sectionId: "history",
          groupId: "previous-decisions",
          title: "Approval chain",
          summary: "No decisions recorded",
          reason: "An approval-chain history is required for audit reconstruction.",
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
    return approvals.map((a, index) =>
      item({
        id: `prev.${a.id}`,
        sectionId: "history",
        groupId: "previous-decisions",
        title: `${a.approvalLevelName} (level ${a.approvalLevel})`,
        summary: a.decision ?? "No decision",
        reason: "Each decision is a named, timestamped act that an auditor can trace.",
        source: apSource("ApprovalRecord", a.id, a.decisionAt ?? a.createdAt),
        timestamp: a.decisionAt ?? a.createdAt,
        importance: "medium",
        status:
          a.decision === "APPROVE" ? "positive" : a.decision === "REJECT" ? "negative" : a.status === "PENDING" ? "pending" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [
          a.decisionBy ?? undefined,
          a.decisionComment ?? undefined,
          a.status === "DELEGATED" ? `delegated to ${a.delegatedTo ?? "?"}` : undefined,
        ].filter(Boolean) as string[],
        related: [invoice.id],
        expandable: true,
        order: index + 1,
      }),
    );
  }
}

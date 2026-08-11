/**
 * Phase 22.4 — AP Evidence Providers: Policy
 *
 * Governing approval-matrix rules for this decision — the applicable level,
 * required roles, and whether human sign-off is required. Contributes to the
 * policy section.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS, applicableLevel } from "./helpers";
import { loadInvoice, loadApprovalLevels } from "./loaders";
import { formatCurrency } from "@/modules/decision-workspace/format";
import type { VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class PolicyProvider implements IEvidenceProvider {
  readonly id = "ap.policy";
  readonly name = "AP Policy";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [
    {
      id: "policy.matrix",
      sectionId: "policy",
      label: "Approval matrix",
      reason: "Without a matrix entry, approval authority is undefined.",
      blocking: false,
      satisfiedBy: ["policy.level"],
    },
    {
      id: "policy.requirement",
      sectionId: "policy",
      label: "Approval requirement",
      reason: "It must be known whether human sign-off is required.",
      blocking: true,
      satisfiedBy: ["policy.required"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const levels = await loadApprovalLevels(context);
    const currency = invoice.currency || "USD";
    const amount = invoice.netBalance ?? invoice.totalWithTax;
    const level = applicableLevel(levels, amount);

    const items: EvidenceItem[] = [];
    if (level) {
      items.push(
        item({
          id: "policy.level",
          sectionId: "policy",
          groupId: "policy-checks",
          title: "Applicable approval level",
          summary: `${level.levelName} (level ${level.levelNumber})`,
          reason: "Identifies the authority whose approval this invoice requires.",
          source: apSource("ApprovalLevel", `level-${level.levelNumber}`, invoice.updatedAt),
          timestamp: null,
          importance: "high",
          status: "neutral",
          confidence: "high",
          confidenceBasis: "Matched against recorded approval matrix ranges",
          evidence: [`range ${formatCurrency(level.minAmount, currency)}${level.maxAmount != null ? ` – ${formatCurrency(level.maxAmount, currency)}` : "+"}`],
          related: [invoice.id],
          order: 0,
        }),
      );
      items.push(
        item({
          id: "policy.roles",
          sectionId: "policy",
          groupId: "policy-checks",
          title: "Required roles",
          summary: level.requiredRoles.join(", ") || "—",
          reason: "Approvals by non-required roles fail audit (so-d segregation).",
          source: apSource("ApprovalLevel", `level-${level.levelNumber}`, invoice.updatedAt),
          timestamp: null,
          importance: "medium",
          status: "neutral",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice.id],
          order: 1,
        }),
      );
    } else {
      items.push(
        item({
          id: "policy.none",
          sectionId: "policy",
          groupId: "policy-checks",
          title: "Approval matrix",
          summary: "No matching entry",
          reason: "Without a matrix entry, approval authority is undefined.",
          source: apSource("ApprovalLevel", "none", invoice.updatedAt),
          timestamp: null,
          importance: "high",
          status: "pending",
          confidence: "none",
          confidenceBasis: "No approval level range covers this amount",
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      );
    }
    items.push(
      item({
        id: "policy.required",
        sectionId: "policy",
        groupId: "policy-checks",
        title: "Approval required",
        summary: invoice.approvalRequired ? "Yes" : "No",
        reason: "Determines whether payment can proceed without human sign-off.",
        source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
        timestamp: invoice.updatedAt,
        importance: "high",
        status: invoice.approvalRequired ? "pending" : "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        evidence: [],
        related: [invoice.id],
        order: 2,
      }),
    );

    return contribution(this.id, [section("policy", items)], [], this.sourceSystems);
  }
}

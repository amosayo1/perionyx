/**
 * Phase 22.4 — AP Evidence Providers: Risk
 *
 * Exception work and duplicate suspicion — the risk surface of the decision.
 * Contributes to the risk section (exceptions + duplicate detection groups);
 * also declares the three-way match result as required evidence.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "../../types";
import { item, section, contribution, apSource, RECORDED_BASIS, exceptionWhy } from "./helpers";
import { loadInvoice, loadExceptions, loadMatch } from "./loaders";
import { bandFromScore } from "@/modules/decision-workspace/recommendation";
import type { InvoiceException, VendorInvoice } from "@/server/procurement/ap-repositories/types";

export class RiskProvider implements IEvidenceProvider {
  readonly id = "ap.risk";
  readonly name = "AP Risk";
  readonly entityTypes = ["ap.invoice"];
  readonly sourceSystems = ["ap.repository"];

  readonly required: RequiredEvidence[] = [
    {
      id: "match.result",
      sectionId: "business-context",
      label: "Three-way match result",
      reason: "Without a match there is no measured basis for approval.",
      blocking: true,
      satisfiedBy: ["match.result"],
    },
    {
      id: "risk.exceptions",
      sectionId: "risk",
      label: "Open exceptions",
      reason: "Unresolved exceptions must be handled before payment.",
      blocking: false,
      satisfiedBy: ["exc.clean"],
    },
    {
      id: "risk.duplicate",
      sectionId: "risk",
      label: "Duplicate check",
      reason: "A missed duplicate is a double payment.",
      blocking: false,
      satisfiedBy: ["dup.suspicion"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const invoice = await loadInvoice(context);
    if (!invoice) return contribution(this.id, [], [], this.sourceSystems);

    const exceptions = await loadExceptions(context, invoice);
    await loadMatch(context, invoice);

    return contribution(this.id, [section("risk", [...this.exceptionItems(exceptions, invoice), ...this.duplicateItems(exceptions, invoice)])], [], this.sourceSystems);
  }

  private exceptionItems(exceptions: InvoiceException[], invoice: VendorInvoice): EvidenceItem[] {
    const items: EvidenceItem[] = [];
    if (exceptions.length === 0) {
      items.push(
        item({
          id: "exc.clean",
          sectionId: "risk",
          groupId: "exceptions",
          title: "Exceptions",
          summary: "None recorded",
          reason: "A clean exception state is required before approval.",
          source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
          timestamp: null,
          importance: "high",
          status: "positive",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [],
          related: [invoice.id],
          order: 0,
        }),
      );
    }
    exceptions.forEach((e, index) => {
      const unresolved = e.status === "OPEN" || e.status === "IN_REVIEW" || e.status === "ESCALATED";
      items.push(
        item({
          id: `exc.${e.id}`,
          sectionId: "risk",
          groupId: "exceptions",
          title: `${e.exceptionType.replace(/_/g, " ")} — ${e.severity}`,
          summary: e.description,
          reason: exceptionWhy(e.exceptionType),
          source: apSource("InvoiceException", e.id, e.resolvedAt ?? e.updatedAt),
          timestamp: e.resolvedAt ?? e.updatedAt,
          importance: unresolved && (e.severity === "HIGH" || e.severity === "CRITICAL") ? "high" : "medium",
          status: unresolved ? (e.severity === "HIGH" || e.severity === "CRITICAL" ? "negative" : "pending") : "positive",
          confidence: "high",
          confidenceBasis: RECORDED_BASIS,
          evidence: [`status ${e.status}${e.assignedTo ? ` · assigned ${e.assignedTo}` : ""}${e.resolution ? ` · ${e.resolution}` : ""}`],
          related: [invoice.id, e.relatedEntityId ?? undefined].filter(Boolean) as string[],
          expandable: true,
          order: index + 1,
        }),
      );
    });
    return items;
  }

  private duplicateItems(exceptions: InvoiceException[], invoice: VendorInvoice): EvidenceItem[] {
    const band = bandFromScore(invoice.duplicateConfidence);
    const items: EvidenceItem[] = [
      item({
        id: "dup.suspicion",
        sectionId: "risk",
        groupId: "duplicate-detection",
        title: "Duplicate suspicion",
        summary: invoice.isDuplicateSuspicion ? "Flagged" : "Not flagged",
        reason: "A missed duplicate is a double payment — the highest-frequency AP fraud.",
        source: apSource("VendorInvoice", invoice.id, invoice.updatedAt),
        timestamp: invoice.updatedAt,
        importance: "high",
        status: invoice.isDuplicateSuspicion ? (band === "high" || band === "medium" ? "negative" : "pending") : "positive",
        confidence: band,
        confidenceBasis: `Duplicate confidence ${invoice.duplicateConfidence.toFixed(2)} measured at capture`,
        evidence: invoice.duplicateOfInvoiceId ? [`matches ${invoice.duplicateOfInvoiceId.slice(0, 8)}`] : [],
        related: [invoice.id, invoice.duplicateOfInvoiceId ?? undefined].filter(Boolean) as string[],
        order: 0,
      }),
    ];
    exceptions
      .filter((e) => e.exceptionType === "DUPLICATE")
      .forEach((e, index) => {
        items.push(
          item({
            id: `dup.exc.${e.id}`,
            sectionId: "risk",
            groupId: "duplicate-detection",
            title: "Duplicate exception",
            summary: e.description,
            reason: "A formal duplicate exception must be resolved before payment.",
            source: apSource("InvoiceException", e.id, e.updatedAt),
            timestamp: e.updatedAt,
            importance: "high",
            status: e.status === "RESOLVED" || e.status === "WAIVED" ? "positive" : "negative",
            confidence: "high",
            confidenceBasis: RECORDED_BASIS,
            evidence: [`status ${e.status}`],
            related: [invoice.id],
            order: index + 1,
          }),
        );
      });
    return items;
  }
}

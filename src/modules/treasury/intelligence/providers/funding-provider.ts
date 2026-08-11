/**
 * Program 1 — Treasury Intelligence Platform: Intercompany Funding Evidence Provider
 *
 * Evidence surface for an intercompany funding request awaiting approval.
 * Identity, business context, financial context, policy and risk sections.
 * Serves the canonical decision type `treasury.funding`.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "@/modules/evidence/types";
import { amountLabel, contribution, item, RECORDED_BASIS, section, treasurySource } from "./helpers";
import { loadFunding } from "./loaders";
import type { TreasuryFundingRecord } from "../types";

export class TreasuryFundingProvider implements IEvidenceProvider {
  readonly id = "treasury.funding";
  readonly name = "Treasury Intercompany Funding";
  readonly entityTypes = ["treasury.funding"];
  readonly sourceSystems = ["treasury.prisma"];

  readonly required: RequiredEvidence[] = [
    {
      id: "funding.identity",
      sectionId: "identity",
      label: "Funding identity",
      reason: "A funding request must name its source and target entities.",
      blocking: true,
      satisfiedBy: ["fund.identity"],
    },
    {
      id: "funding.amount",
      sectionId: "financial-context",
      label: "Funding amount",
      reason: "The measured amount drives the approval decision.",
      blocking: true,
      satisfiedBy: ["fund.amount"],
    },
    {
      id: "funding.agreement",
      sectionId: "supporting-documents",
      label: "Intercompany agreement",
      reason: "Intercompany funding should reference the governing agreement.",
      blocking: false,
      satisfiedBy: ["fund.agreement"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const funding = await loadFunding(context);
    if (!funding) {
      return contribution(
        this.id,
        [section("identity", [this.missingEntityItem(context)])],
        [
          {
            id: "funding.record",
            sectionId: "identity",
            label: "Funding record",
            reason: "No treasury funding request was found for this entity id.",
            impact: "blocking",
            canProceed: false,
            sourceSystem: "treasury.prisma",
          },
        ],
        this.sourceSystems,
      );
    }
    return contribution(
      this.id,
      [
        section("identity", this.identityItems(funding)),
        section("status", this.statusItems(funding)),
        section("business-context", this.contextItems(funding)),
        section("financial-context", this.financialItems(funding)),
        section("supporting-documents", this.documentsItems(funding)),
        section("risk", this.riskItems(funding)),
      ],
      [],
      this.sourceSystems,
    );
  }

  private missingEntityItem(context: EvidenceAssemblyContext): EvidenceItem {
    return item({
      id: "fund.identity",
      sectionId: "identity",
      groupId: "identity",
      title: "Funding identity",
      summary: "Funding record not found",
      reason: "The requested funding entity does not exist in the treasury platform.",
      source: treasurySource("TreasuryFunding", context.request.entityId, null),
      timestamp: null,
      importance: "high",
      status: "negative",
      confidence: "none",
      confidenceBasis: "no record found",
      order: 0,
    });
  }

  private identityItems(funding: TreasuryFundingRecord): EvidenceItem[] {
    return [
      item({
        id: "fund.identity",
        sectionId: "identity",
        groupId: "identity",
        title: "Intercompany funding",
        summary: `${funding.sourceEntityId} → ${funding.targetEntityId}`,
        reason: "The exact cash path across legal entities being approved.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        related: [funding.entityId],
        order: 0,
      }),
      item({
        id: "fund.purpose",
        sectionId: "identity",
        groupId: "identity",
        title: "Purpose",
        summary: funding.purpose,
        reason: "The stated business purpose is part of the audit record.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
    ];
  }

  private statusItems(funding: TreasuryFundingRecord): EvidenceItem[] {
    return [
      item({
        id: "fund.status",
        sectionId: "status",
        groupId: "status",
        title: "Funding status",
        summary: funding.status.replace("-", " "),
        reason: "Only a funding request awaiting approval is a pending decision.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "high",
        status: funding.status === "pending-approval" ? "pending" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private contextItems(funding: TreasuryFundingRecord): EvidenceItem[] {
    return [
      item({
        id: "fund.currency",
        sectionId: "business-context",
        groupId: "context",
        title: "Currency",
        summary: funding.currency,
        reason: "Cross-currency funding carries FX settlement considerations.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private financialItems(funding: TreasuryFundingRecord): EvidenceItem[] {
    return [
      item({
        id: "fund.amount",
        sectionId: "financial-context",
        groupId: "amount",
        title: "Funding amount",
        summary: amountLabel(funding.amount, funding.currency),
        reason: "The measured amount drives the approval decision and risk assessment.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private documentsItems(funding: TreasuryFundingRecord): EvidenceItem[] {
    const hasAgreement = Boolean(funding.intercompanyAgreementRef);
    return [
      item({
        id: "fund.agreement",
        sectionId: "supporting-documents",
        groupId: "documents",
        title: "Intercompany agreement",
        summary: hasAgreement ? funding.intercompanyAgreementRef! : "Not referenced",
        reason: "Intercompany funding without a governing agreement is a control gap.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "medium",
        status: hasAgreement ? "positive" : "pending",
        confidence: hasAgreement ? "high" : "none",
        confidenceBasis: hasAgreement ? RECORDED_BASIS : "agreement reference not recorded",
        order: 0,
      }),
    ];
  }

  private riskItems(funding: TreasuryFundingRecord): EvidenceItem[] {
    return [
      item({
        id: "fund.risk",
        sectionId: "risk",
        groupId: "risk",
        title: "Funding risk",
        summary: "Intercompany",
        reason: "Intercompany funding without agreement reference warrants review.",
        source: treasurySource("TreasuryFunding", funding.id, funding.requestedAt),
        timestamp: funding.requestedAt,
        importance: "medium",
        status: funding.intercompanyAgreementRef ? "positive" : "pending",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }
}

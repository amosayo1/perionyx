/**
 * Program 1 — Treasury Intelligence Platform: Transfer Evidence Provider
 *
 * Evidence surface for an intra-entity treasury transfer awaiting approval.
 * Identity, business context, financial context, policy and risk sections.
 * Serves the canonical decision type `treasury.transfer`.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "@/modules/evidence/types";
import { amountLabel, contribution, item, RECORDED_BASIS, section, treasurySource } from "./helpers";
import { loadTransfer } from "./loaders";
import type { TreasuryTransferRecord } from "../types";

export class TreasuryTransferProvider implements IEvidenceProvider {
  readonly id = "treasury.transfer";
  readonly name = "Treasury Transfer";
  readonly entityTypes = ["treasury.transfer"];
  readonly sourceSystems = ["treasury.prisma"];

  readonly required: RequiredEvidence[] = [
    {
      id: "transfer.identity",
      sectionId: "identity",
      label: "Transfer identity",
      reason: "A transfer must name its source and target accounts.",
      blocking: true,
      satisfiedBy: ["trf.identity"],
    },
    {
      id: "transfer.amount",
      sectionId: "financial-context",
      label: "Transfer amount",
      reason: "The measured amount drives the approval decision.",
      blocking: true,
      satisfiedBy: ["trf.amount"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const transfer = await loadTransfer(context);
    if (!transfer) {
      return contribution(
        this.id,
        [section("identity", [this.missingEntityItem(context)])],
        [
          {
            id: "transfer.record",
            sectionId: "identity",
            label: "Transfer record",
            reason: "No treasury transfer record was found for this entity id.",
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
        section("identity", this.identityItems(transfer)),
        section("status", this.statusItems(transfer)),
        section("business-context", this.contextItems(transfer)),
        section("financial-context", this.financialItems(transfer)),
        section("policy", this.policyItems(transfer)),
        section("risk", this.riskItems(transfer)),
      ],
      [],
      this.sourceSystems,
    );
  }

  private missingEntityItem(context: EvidenceAssemblyContext): EvidenceItem {
    return item({
      id: "trf.identity",
      sectionId: "identity",
      groupId: "identity",
      title: "Transfer identity",
      summary: "Transfer record not found",
      reason: "The requested transfer entity does not exist in the treasury platform.",
      source: treasurySource("TreasuryTransfer", context.request.entityId, null),
      timestamp: null,
      importance: "high",
      status: "negative",
      confidence: "none",
      confidenceBasis: "no record found",
      order: 0,
    });
  }

  private identityItems(transfer: TreasuryTransferRecord): EvidenceItem[] {
    return [
      item({
        id: "trf.identity",
        sectionId: "identity",
        groupId: "identity",
        title: "Transfer",
        summary: `${transfer.sourceAccountId} → ${transfer.targetAccountId}`,
        reason: "The exact cash path being approved.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        related: [transfer.entityId],
        order: 0,
      }),
      item({
        id: "trf.reason",
        sectionId: "identity",
        groupId: "identity",
        title: "Purpose",
        summary: transfer.reason,
        reason: "The stated business purpose is part of the audit record.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
    ];
  }

  private statusItems(transfer: TreasuryTransferRecord): EvidenceItem[] {
    return [
      item({
        id: "trf.status",
        sectionId: "status",
        groupId: "status",
        title: "Transfer status",
        summary: transfer.status.replace("-", " "),
        reason: "Only a transfer awaiting approval is a pending decision.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "high",
        status: transfer.status === "pending-approval" ? "pending" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private contextItems(transfer: TreasuryTransferRecord): EvidenceItem[] {
    return [
      item({
        id: "trf.type",
        sectionId: "business-context",
        groupId: "context",
        title: "Funding type",
        summary: transfer.fundingType,
        reason: "The funding type determines which control policies apply.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private financialItems(transfer: TreasuryTransferRecord): EvidenceItem[] {
    return [
      item({
        id: "trf.amount",
        sectionId: "financial-context",
        groupId: "amount",
        title: "Transfer amount",
        summary: amountLabel(transfer.amount, transfer.currency),
        reason: "The measured amount drives the approval matrix and risk assessment.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private policyItems(transfer: TreasuryTransferRecord): EvidenceItem[] {
    return [
      item({
        id: "trf.approval-required",
        sectionId: "policy",
        groupId: "controls",
        title: "Approval required",
        summary: transfer.approvalRequired ? "Yes" : "No",
        reason: "Transfers flagged as approval-required are routed through the approval workflow.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "high",
        status: transfer.approvalRequired ? "pending" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private riskItems(transfer: TreasuryTransferRecord): EvidenceItem[] {
    return [
      item({
        id: "trf.risk",
        sectionId: "risk",
        groupId: "risk",
        title: "Transfer risk",
        summary: transfer.approvalRequired ? "Requires control" : "Standard",
        reason: "Higher-value or approval-required transfers warrant a higher authority.",
        source: treasurySource("TreasuryTransfer", transfer.id, transfer.requestedAt),
        timestamp: transfer.requestedAt,
        importance: "medium",
        status: transfer.approvalRequired ? "pending" : "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }
}

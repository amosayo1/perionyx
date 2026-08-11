/**
 * Program 1 — Treasury Intelligence Platform: Payment Evidence Provider
 *
 * The evidence surface for a treasury payment awaiting release — the full
 * eight explainability fields per item, absence always disclosed. Contributes
 * identity, status, business context, financial context, policy and risk
 * sections. Serves the canonical decision type `treasury.payment`.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "@/modules/evidence/types";
import { amountLabel, contribution, item, RECORDED_BASIS, section, treasurySource } from "./helpers";
import { loadPayment } from "./loaders";
import type { TreasuryPaymentRecord } from "../types";

export class TreasuryPaymentProvider implements IEvidenceProvider {
  readonly id = "treasury.payment";
  readonly name = "Treasury Payment";
  readonly entityTypes = ["treasury.payment"];
  readonly sourceSystems = ["treasury.prisma"];

  readonly required: RequiredEvidence[] = [
    {
      id: "payment.identity",
      sectionId: "identity",
      label: "Beneficiary identity",
      reason: "A release payment must name a traceable beneficiary.",
      blocking: true,
      satisfiedBy: ["pay.identity"],
    },
    {
      id: "payment.amount",
      sectionId: "financial-context",
      label: "Payment amount",
      reason: "The amount is the measured input to the approval decision.",
      blocking: true,
      satisfiedBy: ["pay.amount"],
    },
    {
      id: "payment.mandate",
      sectionId: "policy",
      label: "Beneficiary mandate verification",
      reason: "The beneficiary's bank details must be mandate-verified before release.",
      blocking: false,
      satisfiedBy: ["pay.mandate"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const payment = await loadPayment(context);
    if (!payment) {
      return contribution(
        this.id,
        [section("identity", [this.missingEntityItem(context)])],
        [
          {
            id: "payment.record",
            sectionId: "identity",
            label: "Payment record",
            reason: "No treasury payment record was found for this entity id.",
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
        section("identity", this.identityItems(payment)),
        section("status", this.statusItems(payment)),
        section("business-context", this.contextItems(payment)),
        section("financial-context", this.financialItems(payment)),
        section("policy", this.policyItems(payment)),
        section("risk", this.riskItems(payment)),
      ],
      [],
      this.sourceSystems,
    );
  }

  private missingEntityItem(context: EvidenceAssemblyContext): EvidenceItem {
    return item({
      id: "pay.identity",
      sectionId: "identity",
      groupId: "identity",
      title: "Beneficiary identity",
      summary: "Payment record not found",
      reason: "The requested payment entity does not exist in the treasury platform.",
      source: treasurySource("TreasuryPayment", context.request.entityId, null),
      timestamp: null,
      importance: "high",
      status: "negative",
      confidence: "none",
      confidenceBasis: "no record found",
      order: 0,
    });
  }

  private identityItems(payment: TreasuryPaymentRecord): EvidenceItem[] {
    return [
      item({
        id: "pay.identity",
        sectionId: "identity",
        groupId: "identity",
        title: "Beneficiary",
        summary: payment.beneficiaryName,
        reason: "The named party receiving the funds.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        related: [payment.entityId],
        order: 0,
      }),
      item({
        id: "pay.reference",
        sectionId: "identity",
        groupId: "identity",
        title: "Payment reference",
        summary: payment.reference ?? "—",
        reason: "The reference is the traceable anchor for reconciliation.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "low",
        status: payment.reference ? "positive" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
    ];
  }

  private statusItems(payment: TreasuryPaymentRecord): EvidenceItem[] {
    return [
      item({
        id: "pay.status",
        sectionId: "status",
        groupId: "status",
        title: "Payment status",
        summary: payment.status.replace("-", " "),
        reason: "Only a payment awaiting approval is a pending decision.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "high",
        status: payment.status === "pending-approval" ? "pending" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private contextItems(payment: TreasuryPaymentRecord): EvidenceItem[] {
    return [
      item({
        id: "pay.method",
        sectionId: "business-context",
        groupId: "context",
        title: "Payment method",
        summary: payment.method,
        reason: "The rail determines settlement timing and control requirements.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
      item({
        id: "pay.scheduled",
        sectionId: "business-context",
        groupId: "context",
        title: "Scheduled for",
        summary: payment.scheduledDate,
        reason: "Proximity to the scheduled date determines urgency.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
      item({
        id: "pay.initiator",
        sectionId: "business-context",
        groupId: "context",
        title: "Initiated by",
        summary: payment.initiatorId,
        reason: "The requester is accountable for the payment request.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 2,
      }),
    ];
  }

  private financialItems(payment: TreasuryPaymentRecord): EvidenceItem[] {
    return [
      item({
        id: "pay.amount",
        sectionId: "financial-context",
        groupId: "amount",
        title: "Payment amount",
        summary: amountLabel(payment.amount, payment.currency),
        reason: "The measured amount drives the approval matrix and risk assessment.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private policyItems(payment: TreasuryPaymentRecord): EvidenceItem[] {
    const mandatePending = !payment.mandateVerified;
    return [
      item({
        id: "pay.mandate",
        sectionId: "policy",
        groupId: "controls",
        title: "Beneficiary mandate",
        summary: mandatePending ? "Not verified" : "Verified",
        reason: "A mandate-verified beneficiary is a fraud-control prerequisite for release.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "high",
        status: mandatePending ? "pending" : "positive",
        confidence: mandatePending ? "none" : "high",
        confidenceBasis: mandatePending ? "verification not recorded" : RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private riskItems(payment: TreasuryPaymentRecord): EvidenceItem[] {
    return [
      item({
        id: "pay.risk",
        sectionId: "risk",
        groupId: "risk",
        title: "Beneficiary risk",
        summary: payment.beneficiaryRiskLevel,
        reason: "Higher beneficiary risk warrants a higher authority reviewing the release.",
        source: treasurySource("TreasuryPayment", payment.id, payment.updatedAt),
        timestamp: payment.updatedAt,
        importance: "medium",
        status: payment.beneficiaryRiskLevel === "high" || payment.beneficiaryRiskLevel === "critical" ? "pending" : "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }
}

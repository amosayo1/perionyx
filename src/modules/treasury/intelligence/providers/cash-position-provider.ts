/**
 * Program 1 — Treasury Intelligence Platform: Cash Position Evidence Provider
 *
 * Evidence surface for a recorded cash position (a bank account balance
 * snapshot within a legal entity). Identity, status (freshness), business
 * context, financial context, policy and risk sections. Pure projection —
 * the provider surfaces what is recorded; it never computes an opinion.
 * Serves the canonical entity type `treasury.cash-position`.
 */

import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  IEvidenceProvider,
  RequiredEvidence,
} from "@/modules/evidence/types";
import { TREASURY_BALANCE_STALE_DAYS } from "../constants";
import { amountLabel, contribution, item, RECORDED_BASIS, section, treasurySource } from "./helpers";
import { loadCashPosition } from "./loaders";
import type { CashPositionRecord } from "../types";

export class TreasuryCashPositionProvider implements IEvidenceProvider {
  readonly id = "treasury.cash-position";
  readonly name = "Treasury Cash Position";
  readonly entityTypes = ["treasury.cash-position"];
  readonly sourceSystems = ["treasury.prisma"];

  readonly required: RequiredEvidence[] = [
    {
      id: "cash.identity",
      sectionId: "identity",
      label: "Cash position identity",
      reason: "A cash position must name the entity, region and bank it describes.",
      blocking: true,
      satisfiedBy: ["cash.identity"],
    },
    {
      id: "cash.balance",
      sectionId: "financial-context",
      label: "Recorded balance",
      reason: "The recorded balance is the measured input to every treasury read.",
      blocking: true,
      satisfiedBy: ["cash.balance"],
    },
    {
      id: "cash.freshness",
      sectionId: "status",
      label: "Balance freshness",
      reason: "A stale balance cannot be trusted for a decision — staleness is surfaced.",
      blocking: false,
      satisfiedBy: ["cash.freshness"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const position = await loadCashPosition(context);
    if (!position) {
      return contribution(
        this.id,
        [section("identity", [this.missingEntityItem(context)])],
        [
          {
            id: "cash.record",
            sectionId: "identity",
            label: "Cash position record",
            reason: "No treasury cash position was found for this entity id.",
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
        section("identity", this.identityItems(position)),
        section("status", this.statusItems(position)),
        section("business-context", this.contextItems(position)),
        section("financial-context", this.financialItems(position)),
        section("risk", this.riskItems(position)),
      ],
      [],
      this.sourceSystems,
    );
  }

  private missingEntityItem(context: EvidenceAssemblyContext): EvidenceItem {
    return item({
      id: "cash.identity",
      sectionId: "identity",
      groupId: "identity",
      title: "Cash position identity",
      summary: "Cash position record not found",
      reason: "The requested cash position entity does not exist in the treasury platform.",
      source: treasurySource("TreasuryCashPosition", context.request.entityId, null),
      timestamp: null,
      importance: "high",
      status: "negative",
      confidence: "none",
      confidenceBasis: "no record found",
      order: 0,
    });
  }

  private identityItems(position: CashPositionRecord): EvidenceItem[] {
    return [
      item({
        id: "cash.identity",
        sectionId: "identity",
        groupId: "identity",
        title: "Cash position",
        summary: position.institutionName || position.bankAccountId,
        reason: "The exact bank balance snapshot being read.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.recordedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        related: [position.bankAccountId, position.entityId],
        order: 0,
      }),
      item({
        id: "cash.region",
        sectionId: "identity",
        groupId: "identity",
        title: "Region",
        summary: position.region,
        reason: "Regional grouping supports concentration and FX oversight.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.recordedAt,
        importance: "low",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
    ];
  }

  private statusItems(position: CashPositionRecord): EvidenceItem[] {
    const stale = isStale(position.lastSyncedAt, position.recordedAt);
    return [
      item({
        id: "cash.freshness",
        sectionId: "status",
        groupId: "status",
        title: "Balance freshness",
        summary: position.lastSyncedAt ?? "Never synced",
        reason: `A balance older than ${TREASURY_BALANCE_STALE_DAYS} day(s) is stale and cannot be trusted for a decision.`,
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.lastSyncedAt ?? position.recordedAt,
        importance: "high",
        status: stale ? "pending" : "positive",
        confidence: stale ? "none" : "high",
        confidenceBasis: stale ? "balance older than staleness threshold" : RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private contextItems(position: CashPositionRecord): EvidenceItem[] {
    return [
      item({
        id: "cash.classification",
        sectionId: "business-context",
        groupId: "context",
        title: "Classification",
        summary: position.classification,
        reason: "Classification (operating, reserve, restricted) determines how the balance may be used.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.recordedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private financialItems(position: CashPositionRecord): EvidenceItem[] {
    return [
      item({
        id: "cash.balance",
        sectionId: "financial-context",
        groupId: "balance",
        title: "Total balance",
        summary: amountLabel(position.totalBalance, position.currency),
        reason: "The measured total balance of the account snapshot.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.recordedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
      item({
        id: "cash.available",
        sectionId: "financial-context",
        groupId: "balance",
        title: "Available balance",
        summary: amountLabel(position.availableBalance, position.currency),
        reason: "The amount available for immediate deployment.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.recordedAt,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
      item({
        id: "cash.ledger",
        sectionId: "financial-context",
        groupId: "balance",
        title: "Ledger balance",
        summary: amountLabel(position.ledgerBalance, position.currency),
        reason: "The accounting balance as recorded in the ledger.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.recordedAt,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 2,
      }),
    ];
  }

  private riskItems(position: CashPositionRecord): EvidenceItem[] {
    const stale = isStale(position.lastSyncedAt, position.recordedAt);
    return [
      item({
        id: "cash.risk",
        sectionId: "risk",
        groupId: "risk",
        title: "Staleness risk",
        summary: stale ? "Balance is stale" : "Balance is fresh",
        reason: "Stale balances undermine any treasury read — the state is surfaced, never hidden.",
        source: treasurySource("TreasuryCashPosition", position.id, position.recordedAt),
        timestamp: position.lastSyncedAt ?? position.recordedAt,
        importance: "medium",
        status: stale ? "pending" : "positive",
        confidence: stale ? "none" : "high",
        confidenceBasis: stale ? "balance older than staleness threshold" : RECORDED_BASIS,
        order: 0,
      }),
    ];
  }
}

function isStale(lastSyncedAt: string | null, recordedAt: string): boolean {
  if (!lastSyncedAt) return true;
  const ageDays = (new Date(recordedAt).getTime() - new Date(lastSyncedAt).getTime()) / 86_400_000;
  return ageDays > TREASURY_BALANCE_STALE_DAYS;
}

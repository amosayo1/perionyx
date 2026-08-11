/**
 * Program 1 — Treasury Intelligence Platform: Bank Account Evidence Provider
 *
 * Evidence surface for a treasury bank account. Identity, status (active /
 * sync freshness), business context (currency, country) and financial context
 * (recorded balance). Pure projection — the provider surfaces what is
 * recorded; it never computes an opinion. Serves the canonical entity type
 * `treasury.bank-account`.
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
import { loadBankAccount } from "./loaders";
import type { BankAccountRecord } from "../types";

export class TreasuryBankAccountProvider implements IEvidenceProvider {
  readonly id = "treasury.bank-account";
  readonly name = "Treasury Bank Account";
  readonly entityTypes = ["treasury.bank-account"];
  readonly sourceSystems = ["treasury.prisma"];

  readonly required: RequiredEvidence[] = [
    {
      id: "bank.identity",
      sectionId: "identity",
      label: "Bank account identity",
      reason: "An account must name its bank and number for traceability.",
      blocking: true,
      satisfiedBy: ["bank.identity"],
    },
    {
      id: "bank.balance",
      sectionId: "financial-context",
      label: "Recorded balance",
      reason: "The recorded balance is the measured input to every treasury read.",
      blocking: true,
      satisfiedBy: ["bank.balance"],
    },
  ];

  async provide(context: EvidenceAssemblyContext): Promise<EvidenceContribution> {
    const account = await loadBankAccount(context);
    if (!account) {
      return contribution(
        this.id,
        [section("identity", [this.missingEntityItem(context)])],
        [
          {
            id: "bank.record",
            sectionId: "identity",
            label: "Bank account record",
            reason: "No treasury bank account was found for this entity id.",
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
        section("identity", this.identityItems(account)),
        section("status", this.statusItems(account)),
        section("business-context", this.contextItems(account)),
        section("financial-context", this.financialItems(account)),
        section("risk", this.riskItems(account)),
      ],
      [],
      this.sourceSystems,
    );
  }

  private missingEntityItem(context: EvidenceAssemblyContext): EvidenceItem {
    return item({
      id: "bank.identity",
      sectionId: "identity",
      groupId: "identity",
      title: "Bank account identity",
      summary: "Bank account record not found",
      reason: "The requested bank account entity does not exist in the treasury platform.",
      source: treasurySource("TreasuryAccount", context.request.entityId, null),
      timestamp: null,
      importance: "high",
      status: "negative",
      confidence: "none",
      confidenceBasis: "no record found",
      order: 0,
    });
  }

  private identityItems(account: BankAccountRecord): EvidenceItem[] {
    return [
      item({
        id: "bank.identity",
        sectionId: "identity",
        groupId: "identity",
        title: "Bank account",
        summary: `${account.name} · ${account.accountNumber ?? "—"}`,
        reason: "The exact account being read.",
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        related: [account.entityId],
        order: 0,
      }),
      item({
        id: "bank.name",
        sectionId: "identity",
        groupId: "identity",
        title: "Bank",
        summary: account.bankName,
        reason: "The banking relationship named for concentration oversight.",
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "low",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 1,
      }),
    ];
  }

  private statusItems(account: BankAccountRecord): EvidenceItem[] {
    return [
      item({
        id: "bank.active",
        sectionId: "status",
        groupId: "status",
        title: "Account status",
        summary: account.isActive ? "Active" : "Inactive",
        reason: "Only active accounts should be considered in treasury operations.",
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "high",
        status: account.isActive ? "positive" : "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
      item({
        id: "bank.freshness",
        sectionId: "status",
        groupId: "status",
        title: "Sync freshness",
        summary: account.lastSyncedAt ?? "Never synced",
        reason: `A balance older than ${TREASURY_BALANCE_STALE_DAYS} day(s) is stale and cannot be trusted for a decision.`,
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "medium",
        status: isStale(account.lastSyncedAt) ? "pending" : "positive",
        confidence: isStale(account.lastSyncedAt) ? "none" : "high",
        confidenceBasis: isStale(account.lastSyncedAt)
          ? "balance older than staleness threshold"
          : RECORDED_BASIS,
        order: 1,
      }),
    ];
  }

  private contextItems(account: BankAccountRecord): EvidenceItem[] {
    return [
      item({
        id: "bank.currency",
        sectionId: "business-context",
        groupId: "context",
        title: "Currency",
        summary: account.currency,
        reason: "The account currency determines FX exposure treatment.",
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "medium",
        status: "neutral",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private financialItems(account: BankAccountRecord): EvidenceItem[] {
    return [
      item({
        id: "bank.balance",
        sectionId: "financial-context",
        groupId: "balance",
        title: "Recorded balance",
        summary: amountLabel(account.balance, account.currency),
        reason: "The measured account balance.",
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "high",
        status: "positive",
        confidence: "high",
        confidenceBasis: RECORDED_BASIS,
        order: 0,
      }),
    ];
  }

  private riskItems(account: BankAccountRecord): EvidenceItem[] {
    const stale = isStale(account.lastSyncedAt);
    return [
      item({
        id: "bank.risk",
        sectionId: "risk",
        groupId: "risk",
        title: "Staleness risk",
        summary: stale ? "Balance is stale" : "Balance is fresh",
        reason: "Stale balances undermine any treasury read — the state is surfaced, never hidden.",
        source: treasurySource("TreasuryAccount", account.id, account.lastSyncedAt),
        timestamp: account.lastSyncedAt ?? null,
        importance: "medium",
        status: stale ? "pending" : "positive",
        confidence: stale ? "none" : "high",
        confidenceBasis: stale ? "balance older than staleness threshold" : RECORDED_BASIS,
        order: 0,
      }),
    ];
  }
}

function isStale(lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt) return true;
  const ageDays = (new Date().getTime() - new Date(lastSyncedAt).getTime()) / 86_400_000;
  return ageDays > TREASURY_BALANCE_STALE_DAYS;
}

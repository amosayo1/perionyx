/**
 * Program 1 — Treasury Intelligence Platform: Treasury Decision Service
 *
 * The canonical path for a treasury decision: assemble the Evidence Package
 * (Phase 22.4) → project it through the Decision Intelligence adapter
 * (Phase 22.5) with the measured facts this service computes from the record →
 * evaluate the deterministic recommendation. The engine explains but never
 * decides — the operator renders the decision.
 *
 * Deterministic: `now` is injectable and every derived fact is a measured
 * number/boolean/string — never formatted money.
 */

import { assembleEvidenceFor } from "@/modules/evidence/assembler";
import { fromEvidencePackage } from "@/modules/decision-engine/adapters/from-evidence";
import { DecisionIntelligenceEngine } from "@/modules/decision-engine/engine";
import type { Decision, DecisionEvidence, FactValue } from "@/modules/decision-engine/types";
import { getTreasuryDataSource, type TreasuryDataSource } from "../data-source";
import { TREASURY_HIGH_VALUE_AMOUNT, TREASURY_IMMINENT_DAYS } from "../constants";
import type {
  TreasuryEntityType,
  TreasuryFundingRecord,
  TreasuryPaymentRecord,
  TreasuryTransferRecord,
} from "../types";

export interface TreasuryDecisionInput {
  entityType: TreasuryEntityType;
  entityId: string;
  tenantId: string;
  /** Injectable evaluation time — keeps results time-stable in tests. */
  now?: string;
  /** Pre-loaded records seeded into the Evidence Assembly context. */
  seed?: Record<string, unknown>;
}

const TERMINAL_PAYMENT_STATUSES = [
  "approved",
  "rejected",
  "released",
  "processing",
  "failed",
  "returned",
  "cancelled",
];

const TERMINAL_MOVEMENT_STATUSES = [
  "approved",
  "rejected",
  "executed",
  "failed",
  "cancelled",
];

export class TreasuryDecisionService {
  private readonly engine: DecisionIntelligenceEngine;
  private readonly source: TreasuryDataSource;

  constructor(
    engine: DecisionIntelligenceEngine = new DecisionIntelligenceEngine(),
    source: TreasuryDataSource = getTreasuryDataSource(),
  ) {
    this.engine = engine;
    this.source = source;
  }

  /** Full decision artifact for a treasury entity. */
  async evaluateEntity(input: TreasuryDecisionInput): Promise<Decision> {
    const now = input.now ?? new Date().toISOString();
    const pkg = await assembleEvidenceFor({
      entityType: input.entityType,
      entityId: input.entityId,
      tenantId: input.tenantId,
      now,
      seed: input.seed,
    });

    const evidence = await this.buildEvidence(input, now);
    return this.engine.evaluateDecision(evidence);
  }

  /** Deterministic recommendation category for a treasury entity. */
  async recommend(input: TreasuryDecisionInput): Promise<Decision["recommendation"]> {
    const decision = await this.evaluateEntity(input);
    return decision.recommendation;
  }

  private async buildEvidence(input: TreasuryDecisionInput, now: string): Promise<DecisionEvidence> {
    const pkg = await assembleEvidenceFor({
      entityType: input.entityType,
      entityId: input.entityId,
      tenantId: input.tenantId,
      now,
      seed: input.seed,
    });

    const { facts, state, statusLabel } = await this.deriveFacts(input, now);

    return fromEvidencePackage(pkg, {
      state,
      statusLabel,
      facts,
    });
  }

  private async deriveFacts(
    input: TreasuryDecisionInput,
    now: string,
  ): Promise<{ facts: Record<string, FactValue>; state: "actionable" | "terminal"; statusLabel: string | undefined }> {
    const tenantId = input.tenantId;
    switch (input.entityType) {
      case "treasury.payment": {
        const all = await this.source.getPayments(tenantId);
        const record = all.find((p) => p.id === input.entityId);
        if (!record) return { facts: {}, state: "actionable", statusLabel: "not-found" };
        const amount = Number(record.amount);
        const terminal = TERMINAL_PAYMENT_STATUSES.includes(record.status);
        return {
          facts: {
            paymentStatus: record.status,
            amount,
            highValue: amount > TREASURY_HIGH_VALUE_AMOUNT,
            imminent: daysUntil(record.scheduledDate, now) <= TREASURY_IMMINENT_DAYS,
            mandateVerified: record.mandateVerified,
            beneficiaryRiskLevel: record.beneficiaryRiskLevel,
            terminal,
          },
          state: terminal ? "terminal" : "actionable",
          statusLabel: record.status,
        };
      }
      case "treasury.transfer": {
        const all = await this.source.getTransfers(tenantId);
        const record = all.find((t) => t.id === input.entityId);
        if (!record) return { facts: {}, state: "actionable", statusLabel: "not-found" };
        const amount = Number(record.amount);
        const terminal = TERMINAL_MOVEMENT_STATUSES.includes(record.status);
        return {
          facts: {
            amount,
            highValue: amount > TREASURY_HIGH_VALUE_AMOUNT,
            approvalRequired: record.approvalRequired,
            terminal,
          },
          state: terminal ? "terminal" : "actionable",
          statusLabel: record.status,
        };
      }
      case "treasury.funding": {
        const all = await this.source.getFundingRequests(tenantId);
        const record = all.find((f) => f.id === input.entityId);
        if (!record) return { facts: {}, state: "actionable", statusLabel: "not-found" };
        const amount = Number(record.amount);
        const terminal = TERMINAL_MOVEMENT_STATUSES.includes(record.status);
        return {
          facts: {
            amount,
            highValue: amount > TREASURY_HIGH_VALUE_AMOUNT,
            agreementPresent: Boolean(record.intercompanyAgreementRef),
            terminal,
          },
          state: terminal ? "terminal" : "actionable",
          statusLabel: record.status,
        };
      }
      default:
        return { facts: {}, state: "actionable", statusLabel: undefined };
    }
  }
}

/** Whole days from `from` to `target`, floored at 0. Deterministic with `now`. */
function daysUntil(targetIso: string, fromIso: string): number {
  const target = new Date(targetIso).getTime();
  const from = new Date(fromIso).getTime();
  if (!Number.isFinite(target) || !Number.isFinite(from)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((target - from) / 86_400_000));
}

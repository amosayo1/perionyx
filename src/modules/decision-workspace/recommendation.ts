/**
 * Phase 22.3 — Decision Workspace: Recommendation derivation
 *
 * Deterministic, evidence-derived recommendation. Strongest signal wins
 * (Decision priority). Never invents confidence: every band carries a basis
 * that names the measured data behind it. The stub AI service is NOT used;
 * `recommendation.ai` is reserved for a real DI implementation.
 *
 * Decision priority:
 *   1. REJECT  — high-confidence duplicate
 *   2. REVIEW  — unresolved exceptions, no/partial match, low match confidence
 *   3. APPROVE — full match, no unresolved exceptions, confidence band high/medium
 *   4. NO-SIGNAL — terminal/informational status (decision already made)
 */

import type { VendorInvoice, ThreeWayMatch, InvoiceException } from "@/server/procurement/ap-repositories/types";
import type {
  EvidenceConfidence,
  Recommendation,
  RecommendationCategory,
  RiskFactor,
} from "./types";
import { HIGH_VALUE_THRESHOLD } from "@/modules/work-queue/constants";

const UNRESOLVED_EXCEPTION_STATUSES = new Set(["OPEN", "IN_REVIEW", "ESCALATED"]);
const TERMINAL_STATUSES = new Set([
  "APPROVED",
  "REJECTED",
  "VOIDED",
  "PAID",
  "PARTIALLY_PAID",
]);

/** Map a measured 0..1 score to a categorical band. */
export function bandFromScore(score: number): EvidenceConfidence {
  if (!Number.isFinite(score)) return "none";
  if (score >= 0.8) return "high";
  if (score >= 0.6) return "medium";
  if (score >= 0.3) return "low";
  return "none";
}

function exceptionSeverityRisk(severity: InvoiceException["severity"]): RiskFactor["severity"] {
  switch (severity) {
    case "CRITICAL":
      return "high";
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    default:
      return "low";
  }
}

function todayISO(): string {
  return new Date().toISOString();
}

export interface RecommendationInput {
  invoice: VendorInvoice;
  match: ThreeWayMatch | null;
  exceptions: InvoiceException[];
  hasPo: boolean;
  hasGrn: boolean;
  payments: { length: number };
  recentInvoices: { length: number };
  hasCommunications: boolean;
  attachments: { length: number };
  policyApplies: boolean;
}

export function deriveRecommendation(input: RecommendationInput): Recommendation {
  const { invoice } = input;
  const derivedAt = todayISO();
  const statusLabel = invoice.status.replace(/_/g, " ").toLowerCase();

  // ── Decision priority 4: terminal / informational ─────────────────────
  if (TERMINAL_STATUSES.has(invoice.status)) {
    return {
      category: "no-signal",
      confidence: "none",
      basis: `This invoice is already ${statusLabel}. No decision is pending on this surface.`,
      supportingEvidence: [],
      evidenceGaps: [],
      riskFactors: [],
      alternatives: ["No action is available on a terminal invoice."],
      suggestedAction: null,
      derivedAt,
      ai: null,
    };
  }

  // ── Decision priority 1: high-confidence duplicate ─────────────────────
  if (invoice.isDuplicateSuspicion && invoice.duplicateConfidence >= 0.8) {
    const related = invoice.duplicateOfInvoiceId
      ? ` matching invoice ${invoice.duplicateOfInvoiceId.slice(0, 8)}`
      : "";
    return {
      category: "reject",
      confidence: bandFromScore(invoice.duplicateConfidence),
      basis: `Duplicate suspicion is high (measured duplicate confidence ${invoice.duplicateConfidence.toFixed(2)}${related}). Rejecting prevents a double payment.`,
      supportingEvidence: ["dup.suspicion"],
      evidenceGaps: [],
      riskFactors: [{ severity: "high", label: "Suspected duplicate invoice" }],
      alternatives: [
        "Why not approve: approving risks paying a duplicate invoice twice.",
        "Confirm the duplicate match against the referenced invoice before rejecting.",
      ],
      suggestedAction: "Confirm the duplicate and reject",
      derivedAt,
      ai: null,
    };
  }

  // ── Decision priority 2: unresolved exceptions ─────────────────────────
  const unresolved = input.exceptions.filter((e) => UNRESOLVED_EXCEPTION_STATUSES.has(e.status));
  if (unresolved.length > 0) {
    const types = Array.from(new Set(unresolved.map((e) => e.exceptionType.replace(/_/g, " ").toLowerCase())));
    const severities = unresolved.map((e) => exceptionSeverityRisk(e.severity));
    const worst: RiskFactor["severity"] = severities.includes("high") ? "high" : severities.includes("medium") ? "medium" : "low";
    return {
      category: "review",
      confidence: worst === "high" ? "low" : "medium",
      basis: `${unresolved.length} unresolved exception${unresolved.length > 1 ? "s" : ""}: ${types.join(", ")}. Resolve before deciding.`,
      supportingEvidence: ["exc.list"],
      evidenceGaps: [],
      riskFactors: [
        ...unresolved.map((e) => ({
          severity: exceptionSeverityRisk(e.severity),
          label: `${e.exceptionType.replace(/_/g, " ")} — ${e.description}`,
        })),
      ],
      alternatives: [
        "Why not approve: open exceptions mean the invoice does not yet meet acceptance criteria.",
        "Why not reject: no terminal blocker is proven; the exception may be resolvable.",
      ],
      suggestedAction: `Resolve ${unresolved.length} exception${unresolved.length > 1 ? "s" : ""} first`,
      derivedAt,
      ai: null,
    };
  }

  // ── Decision priority 3a: no match available ───────────────────────────
  if (!input.match) {
    return {
      category: "review",
      confidence: "none",
      basis: "No three-way match result is available for this invoice.",
      supportingEvidence: [],
      evidenceGaps: ["No three-way match result"],
      riskFactors: input.hasPo ? [] : [{ severity: "medium", label: "No purchase order attached" }],
      alternatives: [
        "Why not approve: without a match there is no measured basis for approval.",
        "Run a three-way match against the referenced PO/GRN first.",
      ],
      suggestedAction: "Run three-way match",
      derivedAt,
      ai: null,
    };
  }

  // ── Decision priority 3b: partial / failed match ───────────────────────
  if (input.match.matchResult !== "FULL_MATCH") {
    return {
      category: "review",
      confidence: bandFromScore(input.match.overallConfidence),
      basis: `Three-way match is ${input.match.matchResult.replace(/_/g, " ").toLowerCase()} (variance ${input.match.variancePercent.toFixed(2)}%, total variance ${input.match.totalVariance.toFixed(2)} ${input.invoice.currency}).`,
      supportingEvidence: ["match.result"],
      evidenceGaps: [],
      riskFactors: [{ severity: "medium", label: `Match ${input.match.matchResult.replace(/_/g, " ").toLowerCase()}` }],
      alternatives: [
        "Why not approve: the match does not reconcile invoice, PO, and GRN.",
        "Resolve the variance or document a waiver before approving.",
      ],
      suggestedAction: "Resolve match variance",
      derivedAt,
      ai: null,
    };
  }

  // ── Decision priority 3c: full match, low confidence ───────────────────
  if (input.match.overallConfidence < 0.6) {
    return {
      category: "review",
      confidence: bandFromScore(input.match.overallConfidence),
      basis: `Three-way match is full but measured confidence is ${input.match.overallConfidence.toFixed(2)} — below the 0.6 approval band.`,
      supportingEvidence: ["match.result"],
      evidenceGaps: [],
      riskFactors: [{ severity: "low", label: "Match confidence below approval band" }],
      alternatives: ["Why not approve: confidence is below the measured approval band."],
      suggestedAction: "Review match lines before approving",
      derivedAt,
      ai: null,
    };
  }

  // ── Decision priority 3d: full match, high/medium confidence ───────────
  const risks: RiskFactor[] = [];
  if (!input.hasPo) risks.push({ severity: "medium", label: "No purchase order attached" });
  if (!input.hasGrn) risks.push({ severity: "low", label: "No goods receipt attached" });
  if (invoice.netBalance >= HIGH_VALUE_THRESHOLD) risks.push({ severity: "medium", label: "High-value invoice" });
  if (input.payments.length === 0) risks.push({ severity: "low", label: "No payment history for this invoice" });

  return {
    category: "approve",
    confidence: bandFromScore(input.match.overallConfidence),
    basis: `Full three-way match with measured confidence ${input.match.overallConfidence.toFixed(2)} (${bandFromScore(input.match.overallConfidence)} band) and no unresolved exceptions.`,
    supportingEvidence: ["match.result", "exc.clean", "po.status", "grn.status"],
    evidenceGaps: buildGaps(input),
    riskFactors: risks,
    alternatives: [
      "Why not review: the match is full, confidence is at or above the approval band, and no exception is open.",
      "Why not reject: no high-confidence duplicate or terminal blocker is present.",
    ],
    suggestedAction: "Approve invoice",
    derivedAt,
    ai: null,
  };
}

function buildGaps(input: RecommendationInput): string[] {
  const gaps: string[] = [];
  if (!input.hasPo) gaps.push("No purchase order attached");
  if (!input.hasGrn) gaps.push("No goods receipt attached");
  if (input.payments.length === 0) gaps.push("No payment history for this invoice");
  if (input.recentInvoices.length === 0) gaps.push("No similar cases on record");
  if (!input.hasCommunications) gaps.push("No communications or notes on record");
  if (input.attachments.length === 0) gaps.push("No supporting documents attached");
  if (!input.policyApplies) gaps.push("No applicable approval matrix entry");
  return gaps;
}

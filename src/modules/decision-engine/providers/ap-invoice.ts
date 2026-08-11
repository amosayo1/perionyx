/**
 * Phase 22.5 — Decision Intelligence: AP Invoice reference decision type
 *
 * The first decision type registered on the generic engine — the AP invoice
 * approval decision (Product System 05 — Procurement, 06 — Decision
 * Intelligence). Entirely declarative: rules, policies, risk factors, and
 * confidence factors are data, evaluated by the engine.
 *
 * The rule conditions reference the canonical AP evidence item ids emitted by
 * the Phase 22.4 evidence providers (match.result, dup.suspicion,
 * vendor.blocked, …) and the measured facts the Decision Workspace computes
 * from its loaded records (netBalance, highValue, vendorRiskLevel, …). No
 * free-text rules, no LLM — the explanation text is fixed per rule.
 *
 * Registering a new decision domain = registering a DecisionTypeConfig here or
 * in an equivalent module; the engine is never modified (Law 3 — capability
 * contracts).
 */

import type { DecisionTypeConfig } from "../types";
import { getDecisionTypeRegistry } from "../registry";

/**
 * Measured facts the AP workspace adapter must provide. Keys are the contract
 * between the workspace and this decision type — keep them stable.
 */
export const AP_DECISION_FACT_KEYS = [
  "netBalance",
  "totalWithTax",
  "highValue",
  "overdue",
  "overdueDays",
  "openExceptions",
  "exceptionCount",
  "matchConfidence",
  "matchStatus",
  "vendorRiskLevel",
  "vendorBlocked",
  "vendorIsNew",
  "hasPo",
  "hasGrn",
  "approved",
  "policyApplies",
  "terminal",
] as const;

export const AP_INVOICE_DECISION_TYPE: DecisionTypeConfig = {
  entityType: "ap.invoice",
  label: "AP Invoice Approval",

  rules: [
    {
      id: "inv.duplicate",
      label: "Confirmed duplicate invoice",
      level: "block",
      conditions: [
        { kind: "evidence", itemId: "dup.suspicion", status: ["negative"], confidence: ["high", "medium"] },
      ],
      explanation: "The duplicate check flagged this invoice as a likely duplicate. Paying it risks a double payment.",
      evidenceIds: ["dup.suspicion"],
    },
    {
      id: "inv.duplicate-exception",
      label: "Unresolved duplicate exception",
      level: "block",
      conditions: [{ kind: "evidence", itemId: "dup.exc.*", status: ["negative"] }],
      explanation: "A formal duplicate exception is open. It must be resolved before payment.",
      evidenceIds: ["dup.exc.*"],
    },
    {
      id: "inv.blocked-vendor",
      label: "Vendor is blocked",
      level: "block",
      conditions: [{ kind: "evidence", itemId: "vendor.blocked", status: ["negative"] }],
      explanation: "This supplier is on the payment blacklist. Payment would violate the blocked-vendor control.",
      evidenceIds: ["vendor.blocked"],
    },
    {
      id: "inv.authority-escalation",
      label: "High value beyond matrix authority",
      level: "escalate",
      conditions: [
        { kind: "evidence", itemId: "policy.none", status: ["pending"] },
        { kind: "fact", key: "highValue", op: "eq", value: true },
      ],
      explanation: "The invoice is high value and no approval matrix entry covers it — authority is undefined.",
      evidenceIds: ["policy.none"],
    },
    {
      id: "inv.vendor-risk-escalation",
      label: "High or critical supplier risk",
      level: "escalate",
      conditions: [{ kind: "fact", key: "vendorRiskLevel", op: "in", value: ["HIGH", "CRITICAL"] }],
      explanation: "The supplier carries high or critical risk — a higher authority should review this decision.",
    },
    {
      id: "inv.match-review",
      label: "Partial or unverified three-way match",
      level: "review",
      conditions: [{ kind: "evidence", itemId: "match.result", status: ["pending"] }],
      explanation: "The three-way match is not a full match. The variance must be explained before approval.",
      evidenceIds: ["match.result"],
    },
    {
      id: "inv.exception-review",
      label: "Open exception on the invoice",
      level: "review",
      conditions: [{ kind: "evidence", itemId: "exc.*", status: ["negative", "pending"] }],
      explanation: "An exception is unresolved. It must be handled before this invoice is approved.",
      evidenceIds: ["exc.*"],
    },
    {
      id: "inv.policy-gap",
      label: "No approval matrix entry",
      level: "review",
      conditions: [{ kind: "evidence", itemId: "policy.none", status: ["pending"] }],
      explanation: "No approval matrix entry covers this amount — approval authority is undefined.",
      evidenceIds: ["policy.none"],
    },
    {
      id: "inv.stale-evidence",
      label: "Evidence is stale",
      level: "review",
      conditions: [{ kind: "metadata", stale: true }],
      explanation: "The evidence package is older than the staleness threshold — re-verify before deciding.",
    },
    {
      id: "inv.overdue-warning",
      label: "Invoice is overdue",
      level: "warning",
      conditions: [{ kind: "fact", key: "overdue", op: "eq", value: true }],
      explanation: "The invoice is past due — approval proceeds with a late-payment warning.",
    },
    {
      id: "inv.first-supplier-warning",
      label: "First-time supplier",
      level: "warning",
      conditions: [{ kind: "evidence", itemId: "similar.none", status: ["neutral"] }],
      explanation: "No same-supplier history exists — first-time suppliers warrant closer review.",
      evidenceIds: ["similar.none"],
    },
    {
      id: "inv.open-credit-warning",
      label: "Open supplier credits unapplied",
      level: "warning",
      conditions: [{ kind: "evidence", itemId: "credit.open", status: ["pending"] }],
      explanation: "Open credits against this supplier reduce the amount actually owed.",
      evidenceIds: ["credit.open"],
    },
  ],

  policies: [
    {
      id: "pol.three-way-match",
      name: "Three-way match completed clean",
      category: "internal-control",
      appliesWhen: [{ kind: "evidence", itemId: "match.result" }],
      satisfiedWhen: [
        { kind: "evidence", itemId: "match.result", status: ["positive"], confidence: ["high", "medium"] },
        { kind: "evidence", itemId: "match.variance", status: ["positive"] },
      ],
      explanation: "The invoice is only payable on a clean full match with zero variance.",
    },
    {
      id: "pol.approval-authority",
      name: "Approval authority defined",
      category: "approval-matrix",
      appliesWhen: [{ kind: "evidence", itemId: "policy.level" }],
      satisfiedWhen: [{ kind: "evidence", itemId: "policy.level", status: ["neutral"] }],
      explanation: "An approval matrix entry must cover the invoice amount.",
    },
    {
      id: "pol.blocked-vendor",
      name: "Vendor not blocked",
      category: "internal-control",
      appliesWhen: [{ kind: "evidence", itemId: "vendor.blocked", status: ["negative"] }],
      satisfiedWhen: [{ kind: "evidence", itemId: "vendor.blocked", status: ["positive"] }],
      explanation: "A blocked vendor must never be paid.",
    },
    {
      id: "pol.duplicate-control",
      name: "Duplicate exception resolved",
      category: "fraud-control",
      appliesWhen: [{ kind: "evidence", itemId: "dup.exc.*", status: ["negative"] }],
      satisfiedWhen: [{ kind: "evidence", itemId: "dup.exc.*", status: ["positive"] }],
      explanation: "A formal duplicate exception must be resolved before payment.",
    },
  ],

  riskFactors: [
    {
      id: "risk.blocked-vendor",
      label: "Vendor is on the payment blacklist",
      category: "fraud",
      severity: "critical",
      conditions: [{ kind: "evidence", itemId: "vendor.blocked", status: ["negative"] }],
      evidenceIds: ["vendor.blocked"],
    },
    {
      id: "risk.duplicate",
      label: "Duplicate invoice risk",
      category: "duplicate",
      severity: "high",
      conditions: [{ kind: "evidence", itemId: "dup.suspicion", status: ["negative"] }],
      anyConditions: [
        [{ kind: "evidence", itemId: "dup.exc.*", status: ["negative"] }],
      ],
      evidenceIds: ["dup.suspicion", "dup.exc.*"],
    },
    {
      id: "risk.vendor-risk-high",
      label: "High or critical supplier risk",
      category: "supplier",
      severity: "high",
      conditions: [{ kind: "fact", key: "vendorRiskLevel", op: "in", value: ["HIGH", "CRITICAL"] }],
    },
    {
      id: "risk.no-match",
      label: "No clean three-way match",
      category: "operational",
      severity: "medium",
      conditions: [{ kind: "evidence", itemId: "match.result", status: ["pending"] }],
      evidenceIds: ["match.result"],
    },
    {
      id: "risk.unresolved-exception",
      label: "Unresolved exception",
      category: "operational",
      severity: "medium",
      conditions: [{ kind: "evidence", itemId: "exc.*", status: ["negative", "pending"] }],
      evidenceIds: ["exc.*"],
    },
    {
      id: "risk.high-value",
      label: "High-value invoice",
      category: "financial",
      severity: "medium",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
    },
    {
      id: "risk.overdue",
      label: "Invoice is overdue",
      category: "timeline",
      severity: "low",
      conditions: [{ kind: "fact", key: "overdue", op: "eq", value: true }],
    },
    {
      id: "risk.first-supplier",
      label: "First-time supplier",
      category: "supplier",
      severity: "low",
      conditions: [{ kind: "evidence", itemId: "similar.none", status: ["neutral"] }],
      evidenceIds: ["similar.none"],
    },
  ],

  confidenceFactors: [
    { id: "conf.match-strong", label: "clean full match", direction: "positive", weight: 0.2, conditions: [{ kind: "evidence", itemId: "match.result", status: ["positive"], confidence: ["high"] }] },
    { id: "conf.exceptions-clean", label: "no open exceptions", direction: "positive", weight: 0.15, conditions: [{ kind: "evidence", itemId: "exc.clean", status: ["positive"] }] },
    { id: "conf.audit-present", label: "audit trail present", direction: "positive", weight: 0.15, conditions: [{ kind: "evidence", itemId: "audit.*" }] },
    { id: "conf.vendor-known", label: "established supplier", direction: "positive", weight: 0.1, conditions: [{ kind: "evidence", itemId: "vendor.activity" }] },
    { id: "conf.policy-known", label: "approval authority defined", direction: "positive", weight: 0.1, conditions: [{ kind: "evidence", itemId: "policy.level" }] },
    { id: "conf.duplicate-clear", label: "duplicate check clear", direction: "positive", weight: 0.1, conditions: [{ kind: "evidence", itemId: "dup.suspicion", status: ["positive"] }] },
    { id: "conf.match-missing", label: "match not verified", direction: "negative", weight: 0.05, conditions: [{ kind: "evidence", itemId: "match.result", status: ["pending"] }] },
    { id: "conf.open-exceptions", label: "open exceptions present", direction: "negative", weight: 0.03, conditions: [{ kind: "evidence", itemId: "exc.*", status: ["negative", "pending"] }] },
    { id: "conf.vendor-first", label: "first-time supplier", direction: "negative", weight: 0.03, conditions: [{ kind: "evidence", itemId: "similar.none", status: ["neutral"] }] },
    { id: "conf.policy-gap", label: "approval authority undefined", direction: "negative", weight: 0.03, conditions: [{ kind: "evidence", itemId: "policy.none", status: ["pending"] }] },
    { id: "conf.duplicate-flagged", label: "duplicate flagged", direction: "negative", weight: 0.03, conditions: [{ kind: "evidence", itemId: "dup.suspicion", status: ["negative"] }] },
  ],
};

export function registerAPDecisionProviders(): void {
  const registry = getDecisionTypeRegistry();
  if (!registry.has(AP_INVOICE_DECISION_TYPE.entityType)) {
    registry.register(AP_INVOICE_DECISION_TYPE);
  }
}

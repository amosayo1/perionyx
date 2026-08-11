/**
 * Program 1 — Treasury Intelligence Platform: Treasury Decision Types
 *
 * Declarative DecisionTypeConfigs registered on the canonical Decision
 * Intelligence engine (Phase 22.5). Rules, policies, risk and confidence
 * factors reference the treasury evidence item ids emitted by the evidence
 * providers and the measured facts the treasury decision service computes.
 *
 * The engine stays generic — this module only registers configuration
 * (Law 3 — capability contracts). No treasury logic is embedded in the engine.
 */

import type { DecisionTypeConfig } from "@/modules/decision-engine/types";
import { TREASURY_HIGH_VALUE_AMOUNT } from "../constants";

// ──────────────────────────────────────────────────────────────────────────────
// Measured fact keys (contract between the treasury decision service and the
// decision types — keep stable).
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_PAYMENT_FACT_KEYS = [
  "paymentStatus",
  "amount",
  "highValue",
  "imminent",
  "mandateVerified",
  "beneficiaryRiskLevel",
  "terminal",
] as const;

export const TREASURY_TRANSFER_FACT_KEYS = [
  "amount",
  "highValue",
  "approvalRequired",
  "terminal",
] as const;

export const TREASURY_FUNDING_FACT_KEYS = [
  "amount",
  "highValue",
  "agreementPresent",
  "terminal",
] as const;

// ──────────────────────────────────────────────────────────────────────────────
// treasury.payment — payment release decision
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_PAYMENT_DECISION_TYPE: DecisionTypeConfig = {
  entityType: "treasury.payment",
  label: "Treasury Payment Release",

  rules: [
    {
      id: "pay.high-value",
      label: "High-value payment",
      level: "escalate",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
      explanation: `The payment exceeds ${TREASURY_HIGH_VALUE_AMOUNT.toLocaleString()} — the next approval authority must review this release.`,
    },
    {
      id: "pay.beneficiary-risk",
      label: "High-risk beneficiary",
      level: "escalate",
      conditions: [{ kind: "fact", key: "beneficiaryRiskLevel", op: "in", value: ["high", "critical"] }],
      explanation: "The beneficiary carries high or critical risk — a higher authority should review this release.",
    },
    {
      id: "pay.mandate-unverified",
      label: "Beneficiary mandate not verified",
      level: "review",
      conditions: [{ kind: "evidence", itemId: "pay.mandate", status: ["pending"] }],
      explanation: "The beneficiary's bank mandate is not verified — confirm the payee details before release.",
      evidenceIds: ["pay.mandate"],
    },
    {
      id: "pay.stale",
      label: "Evidence is stale",
      level: "review",
      conditions: [{ kind: "metadata", stale: true }],
      explanation: "The payment evidence is older than the staleness threshold — re-verify before release.",
    },
    {
      id: "pay.imminent",
      label: "Payment scheduled imminently",
      level: "warning",
      conditions: [{ kind: "fact", key: "imminent", op: "eq", value: true }],
      explanation: "The payment is scheduled within days — approval proceeds with an urgency warning.",
    },
  ],

  policies: [
    {
      id: "pol.mandate-verified",
      name: "Beneficiary mandate verified",
      category: "internal-control",
      appliesWhen: [{ kind: "evidence", itemId: "pay.mandate" }],
      satisfiedWhen: [{ kind: "evidence", itemId: "pay.mandate", status: ["positive"] }],
      explanation: "A release payment requires a mandate-verified beneficiary.",
    },
    {
      id: "pol.release-integrity",
      name: "Release amount recorded",
      category: "internal-control",
      appliesWhen: [{ kind: "evidence", itemId: "pay.amount" }],
      satisfiedWhen: [{ kind: "evidence", itemId: "pay.amount", status: ["positive"] }],
      explanation: "The release decision requires a recorded payment amount.",
    },
  ],

  riskFactors: [
    {
      id: "risk.high-beneficiary",
      label: "High-risk beneficiary",
      category: "fraud",
      severity: "high",
      conditions: [{ kind: "fact", key: "beneficiaryRiskLevel", op: "in", value: ["high", "critical"] }],
    },
    {
      id: "risk.high-value",
      label: "High-value payment",
      category: "financial",
      severity: "medium",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
    },
    {
      id: "risk.mandate-unverified",
      label: "Unverified beneficiary mandate",
      category: "fraud",
      severity: "low",
      conditions: [{ kind: "evidence", itemId: "pay.mandate", status: ["pending"] }],
      evidenceIds: ["pay.mandate"],
    },
    {
      id: "risk.imminent",
      label: "Payment scheduled imminently",
      category: "timeline",
      severity: "low",
      conditions: [{ kind: "fact", key: "imminent", op: "eq", value: true }],
    },
  ],

  confidenceFactors: [
    { id: "conf.mandate-verified", label: "beneficiary mandate verified", direction: "positive", weight: 0.25, conditions: [{ kind: "evidence", itemId: "pay.mandate", status: ["positive"] }] },
    { id: "conf.beneficiary-known", label: "beneficiary risk assessed", direction: "positive", weight: 0.15, conditions: [{ kind: "evidence", itemId: "pay.risk", status: ["positive"] }] },
    { id: "conf.amount-recorded", label: "release amount recorded", direction: "positive", weight: 0.1, conditions: [{ kind: "evidence", itemId: "pay.amount", status: ["positive"] }] },
    { id: "conf.mandate-pending", label: "beneficiary mandate pending", direction: "negative", weight: 0.1, conditions: [{ kind: "evidence", itemId: "pay.mandate", status: ["pending"] }] },
    { id: "conf.beneficiary-risky", label: "high-risk beneficiary", direction: "negative", weight: 0.05, conditions: [{ kind: "evidence", itemId: "pay.risk", status: ["pending"] }] },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// treasury.transfer — intra-entity transfer decision
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_TRANSFER_DECISION_TYPE: DecisionTypeConfig = {
  entityType: "treasury.transfer",
  label: "Treasury Transfer Approval",

  rules: [
    {
      id: "trf.high-value",
      label: "High-value transfer",
      level: "escalate",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
      explanation: `The transfer exceeds ${TREASURY_HIGH_VALUE_AMOUNT.toLocaleString()} — the next approval authority must review this movement.`,
    },
    {
      id: "trf.approval-required",
      label: "Approval-required transfer",
      level: "review",
      conditions: [{ kind: "evidence", itemId: "trf.approval-required", status: ["pending"] }],
      explanation: "This transfer is flagged as approval-required — confirm the movement before execution.",
      evidenceIds: ["trf.approval-required"],
    },
    {
      id: "trf.stale",
      label: "Evidence is stale",
      level: "review",
      conditions: [{ kind: "metadata", stale: true }],
      explanation: "The transfer evidence is older than the staleness threshold — re-verify before execution.",
    },
  ],

  policies: [
    {
      id: "pol.approval-control",
      name: "Approval control satisfied",
      category: "internal-control",
      appliesWhen: [{ kind: "evidence", itemId: "trf.approval-required" }],
      satisfiedWhen: [{ kind: "evidence", itemId: "trf.approval-required", status: ["neutral"] }],
      explanation: "Approval-required transfers must clear the approval control before execution.",
    },
  ],

  riskFactors: [
    {
      id: "risk.high-value",
      label: "High-value transfer",
      category: "financial",
      severity: "medium",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
    },
    {
      id: "risk.approval-gap",
      label: "Approval control not cleared",
      category: "policy",
      severity: "low",
      conditions: [{ kind: "evidence", itemId: "trf.approval-required", status: ["pending"] }],
      evidenceIds: ["trf.approval-required"],
    },
  ],

  confidenceFactors: [
    { id: "conf.amount-recorded", label: "transfer amount recorded", direction: "positive", weight: 0.2, conditions: [{ kind: "evidence", itemId: "trf.amount", status: ["positive"] }] },
    { id: "conf.approval-clear", label: "no approval control pending", direction: "positive", weight: 0.15, conditions: [{ kind: "evidence", itemId: "trf.approval-required", status: ["neutral"] }] },
    { id: "conf.approval-needed", label: "approval control pending", direction: "negative", weight: 0.1, conditions: [{ kind: "evidence", itemId: "trf.approval-required", status: ["pending"] }] },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// treasury.funding — intercompany funding decision
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_FUNDING_DECISION_TYPE: DecisionTypeConfig = {
  entityType: "treasury.funding",
  label: "Intercompany Funding Approval",

  rules: [
    {
      id: "fund.high-value",
      label: "High-value funding",
      level: "escalate",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
      explanation: `The funding request exceeds ${TREASURY_HIGH_VALUE_AMOUNT.toLocaleString()} — the next approval authority must review this intercompany movement.`,
    },
    {
      id: "fund.agreement-missing",
      label: "No intercompany agreement referenced",
      level: "review",
      conditions: [{ kind: "evidence", itemId: "fund.agreement", status: ["pending"] }],
      explanation: "Intercompany funding without a governing agreement is a control gap — confirm the agreement before execution.",
      evidenceIds: ["fund.agreement"],
    },
    {
      id: "fund.stale",
      label: "Evidence is stale",
      level: "review",
      conditions: [{ kind: "metadata", stale: true }],
      explanation: "The funding evidence is older than the staleness threshold — re-verify before execution.",
    },
  ],

  policies: [
    {
      id: "pol.intercompany-agreement",
      name: "Intercompany agreement referenced",
      category: "internal-control",
      appliesWhen: [{ kind: "evidence", itemId: "fund.agreement" }],
      satisfiedWhen: [{ kind: "evidence", itemId: "fund.agreement", status: ["positive"] }],
      explanation: "Intercompany funding must reference the governing agreement.",
    },
  ],

  riskFactors: [
    {
      id: "risk.high-value",
      label: "High-value funding",
      category: "financial",
      severity: "medium",
      conditions: [{ kind: "fact", key: "highValue", op: "eq", value: true }],
    },
    {
      id: "risk.agreement-gap",
      label: "Intercompany agreement missing",
      category: "policy",
      severity: "low",
      conditions: [{ kind: "evidence", itemId: "fund.agreement", status: ["pending"] }],
      evidenceIds: ["fund.agreement"],
    },
  ],

  confidenceFactors: [
    { id: "conf.amount-recorded", label: "funding amount recorded", direction: "positive", weight: 0.2, conditions: [{ kind: "evidence", itemId: "fund.amount", status: ["positive"] }] },
    { id: "conf.agreement-present", label: "intercompany agreement referenced", direction: "positive", weight: 0.15, conditions: [{ kind: "evidence", itemId: "fund.agreement", status: ["positive"] }] },
    { id: "conf.agreement-missing", label: "intercompany agreement missing", direction: "negative", weight: 0.1, conditions: [{ kind: "evidence", itemId: "fund.agreement", status: ["pending"] }] },
  ],
};

/**
 * Program 1 — Treasury Intelligence Platform: Constants
 *
 * Canonical ids shared by the evidence providers, decision types, workflows
 * and command center. A single source of truth for the treasury contract —
 * entity types, workflow ids, escalation ids and evidence load keys.
 */

import type { TreasuryEntityType } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Evidence load keys — consumers seed the Evidence Assembly context with these
// keys so providers never re-fetch records the caller already holds.
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_LOAD_KEYS = {
  payment: "treasury.payment",
  transfer: "treasury.transfer",
  funding: "treasury.funding",
  cashPosition: "treasury.cash-position",
  forecast: "treasury.forecast",
  bankAccount: "treasury.bank-account",
  liquidity: "treasury.liquidity",
  fxExposure: "treasury.fx-exposure",
  alerts: "treasury.alerts",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Workflow ids
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_WORKFLOW_IDS = {
  paymentApproval: "workflow.treasury-payment-approval",
  transferApproval: "workflow.treasury-transfer-approval",
  fundingApproval: "workflow.treasury-funding-approval",
} as const;

export const TREASURY_ESCALATION_IDS = {
  payment: "escalation.treasury-payment",
  transfer: "escalation.treasury-transfer",
  funding: "escalation.treasury-funding",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Decision entity types — mirror the canonical treasury entity types.
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_ENTITY_IDS: Record<"payment" | "transfer" | "funding" | "cashPosition" | "forecast" | "bankAccount", TreasuryEntityType> = {
  payment: "treasury.payment",
  transfer: "treasury.transfer",
  funding: "treasury.funding",
  cashPosition: "treasury.cash-position",
  forecast: "treasury.forecast",
  bankAccount: "treasury.bank-account",
};

// ──────────────────────────────────────────────────────────────────────────────
// Roles / queues referenced by treasury workflows
// ──────────────────────────────────────────────────────────────────────────────

export const TREASURY_ROLES = {
  approver: "treasury-approver",
  manager: "treasury-manager",
} as const;

export const TREASURY_QUEUES = {
  decision: "treasury.decision-queue",
  exception: "treasury.exception-queue",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Financial thresholds (measured facts, not formatted values)
// ──────────────────────────────────────────────────────────────────────────────

/** Above this value a treasury payment requires the high-value approval path. */
export const TREASURY_HIGH_VALUE_AMOUNT = 250_000;

/** Payments scheduled within this many calendar days are "imminent". */
export const TREASURY_IMMINENT_DAYS = 3;

/** Bank balance older than this many days is "stale". */
export const TREASURY_BALANCE_STALE_DAYS = 1;

/** Proportion of total cash at one bank above this triggers concentration risk. */
export const TREASURY_CONCENTRATION_THRESHOLD = 0.5;

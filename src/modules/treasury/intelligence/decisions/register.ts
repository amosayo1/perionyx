/**
 * Program 1 — Treasury Intelligence Platform: Decision Type Registration
 *
 * Registers the treasury decision types on the canonical Decision Intelligence
 * registry (Phase 22.5). Idempotent.
 */

import { getDecisionTypeRegistry } from "@/modules/decision-engine/registry";
import {
  TREASURY_FUNDING_DECISION_TYPE,
  TREASURY_PAYMENT_DECISION_TYPE,
  TREASURY_TRANSFER_DECISION_TYPE,
} from "./types";

/** Register all treasury decision types. Safe to call repeatedly. */
export function registerTreasuryDecisionTypes(): void {
  const registry = getDecisionTypeRegistry();
  for (const config of [
    TREASURY_PAYMENT_DECISION_TYPE,
    TREASURY_TRANSFER_DECISION_TYPE,
    TREASURY_FUNDING_DECISION_TYPE,
  ]) {
    if (!registry.has(config.entityType)) {
      registry.register(config);
    }
  }
}

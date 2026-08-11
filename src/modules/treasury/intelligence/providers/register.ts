/**
 * Program 1 — Treasury Intelligence Platform: Evidence Provider Registration
 *
 * Registers the treasury evidence providers on the canonical Evidence Registry
 * (Phase 22.4). Idempotent — the registry skips already-registered provider ids.
 * Registration order fixes the cross-provider item order within shared sections.
 */

import { registerEvidenceProviders } from "@/modules/evidence/registry";
import { TreasuryPaymentProvider } from "./payment-provider";
import { TreasuryTransferProvider } from "./transfer-provider";
import { TreasuryFundingProvider } from "./funding-provider";
import { TreasuryCashPositionProvider } from "./cash-position-provider";
import { TreasuryForecastProvider } from "./forecast-provider";
import { TreasuryBankAccountProvider } from "./bank-account-provider";

/** Register all treasury evidence providers. Safe to call repeatedly. */
export function registerTreasuryEvidenceProviders(): void {
  registerEvidenceProviders([
    new TreasuryPaymentProvider(),
    new TreasuryTransferProvider(),
    new TreasuryFundingProvider(),
    new TreasuryCashPositionProvider(),
    new TreasuryForecastProvider(),
    new TreasuryBankAccountProvider(),
  ]);
}

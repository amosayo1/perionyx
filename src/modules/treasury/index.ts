export {
  TreasuryService,
  type TreasuryAccountSummary,
  type AccountControlData,
  type InternalTransferSummary,
} from "./treasury.service";

export { ExternalBankingService } from "./external-banking.service";

export type { NormalizedLiquiditySummary, NormalizedErpPosition } from "@/modules/financial-mapping";

// ──────────────────────────────────────────────────────────────────────────────
// Program 1 — Treasury Intelligence Platform (additive)
// The intelligence layer lives at the deep path below; these re-exports expose
// the canonical facade (constants, data-source boundary, analysis modules,
// evidence providers, decision types, services, workflow definitions) without
// colliding with the legacy treasury API.
// ──────────────────────────────────────────────────────────────────────────────

export * from "./intelligence";

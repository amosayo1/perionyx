/**
 * Program 1 — Treasury Intelligence Platform
 *
 * The intelligence layer of the Treasury platform. Everything is consumed
 * through the `TreasuryDataSource` boundary — the engines, evidence providers
 * and dashboard surface never import Prisma directly (Law 1). It produces
 * measured facts and deterministic recommendations; it never decides.
 *
 * Register the treasury capability on the platform registries with:
 *   registerTreasuryEvidenceProviders()   // Evidence Engine (Phase 22.4)
 *   registerTreasuryDecisionTypes()       // Decision Intelligence (Phase 22.5)
 *   registerTreasuryWorkflows(registry)   // Enterprise Workflow (Phase 23)
 */

export * from "./types";
export * from "./constants";

export {
  getTreasuryDataSource,
  setTreasuryDataSource,
  resetTreasuryDataSource,
  type TreasuryDataSource,
} from "./data-source";
export { PrismaTreasuryDataSource } from "./prisma-data-source";

export * from "./analysis/cash-position";
export * from "./analysis/liquidity";
export * from "./analysis/forecast";

export {
  item,
  section,
  contribution,
  treasurySource,
  amountLabel,
  RECORDED_BASIS,
  type TreasuryItemSeed,
} from "./providers/helpers";
export {
  loadPayment,
  loadTransfer,
  loadFunding,
  loadCashPositions,
  loadCashPosition,
  loadForecast,
  loadBankAccount,
  loadLiquidity,
  loadFxExposure,
  loadAlerts,
} from "./providers/loaders";
export { registerTreasuryEvidenceProviders } from "./providers/register";
export { TreasuryPaymentProvider } from "./providers/payment-provider";
export { TreasuryTransferProvider } from "./providers/transfer-provider";
export { TreasuryFundingProvider } from "./providers/funding-provider";
export { TreasuryCashPositionProvider } from "./providers/cash-position-provider";
export { TreasuryForecastProvider } from "./providers/forecast-provider";
export { TreasuryBankAccountProvider } from "./providers/bank-account-provider";

export {
  TREASURY_PAYMENT_DECISION_TYPE,
  TREASURY_TRANSFER_DECISION_TYPE,
  TREASURY_FUNDING_DECISION_TYPE,
  TREASURY_PAYMENT_FACT_KEYS,
  TREASURY_TRANSFER_FACT_KEYS,
  TREASURY_FUNDING_FACT_KEYS,
} from "./decisions/types";
export { registerTreasuryDecisionTypes } from "./decisions/register";

export {
  TreasuryDecisionService,
  type TreasuryDecisionInput,
} from "./services/treasury-decision-service";
export {
  TreasuryWorkflowService,
  type TreasuryWorkflowInput,
} from "./services/treasury-workflow-service";
export {
  TreasuryCommandCenterService,
  type TreasuryCommandCenter,
  type TreasuryMovementTally,
  type TreasuryFxSummary,
} from "./services/treasury-command-center";

export {
  treasuryPaymentApprovalDefinition,
  treasuryTransferApprovalDefinition,
  treasuryFundingApprovalDefinition,
  registerTreasuryWorkflows,
} from "./workflows/definitions";

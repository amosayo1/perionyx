export { BankProviderRegistry, bankProviderRegistry } from "./registry/engine";
export type { IBankProvider } from "./interface";
export type {
  ProviderInitConfig,
  ConnectionLinkParams,
  ConnectionLinkResult,
  AuthenticateConnectionParams,
  AuthenticationResult,
  SyncOptions,
  SyncProgress,
  SyncResult,
  TransactionImportResult,
  BalanceSyncResult,
  BalanceImportResult,
  StatementResult,
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentStatusResult,
  WebhookSubscriptionResult,
  WebhookEvent,
} from "./interface";

export { BankingRoutingEngine, bankingRoutingEngine } from "./routing/engine";
export type { RoutingRequest, RoutingResult } from "./routing/types";

export { ProviderRankingEngine, providerRankingEngine } from "./ranking/engine";
export type { RankingScore, RankingRequest, RankingResult } from "./ranking/types";

export { CapabilityMatrix, capabilityMatrix } from "./capabilities/matrix";
export type { CapabilityMatrixEntry, CapabilityMatch, CapabilityQuery } from "./capabilities/types";

export { ProviderSelector, providerSelector } from "./selection/engine";
export type { ProviderSelectionCriteria, ProviderSelectionResult } from "./selection/types";

export { BANKING_REGION_REGISTRY } from "./regions/registry";

export { PROVIDER_DEFINITIONS, PROVIDER_DEFINITION_MAP, PROVIDER_KINDS, getProviderDefinition, getProvidersByRegion, getProvidersByCountry, getProvidersByCapability, getProvidersByCurrency } from "./definitions/provider-definitions";
export type { ProviderDefinition, RegionCoverage } from "./definitions/types";

export { EnterpriseProviderConfigManager, enterpriseProviderConfig } from "./config/enterprise-config";
export type { EnterpriseProviderConfig, RegionalOverride } from "./config/enterprise-config";

export { ProviderDiagnosticsService, providerDiagnostics } from "./diagnostics/service";
export type { ProviderHealthStatus, DiagnosticsReport } from "./diagnostics/types";

export { APIPlatform, apiPlatform } from "./api-platform";
export { APIService, apiService } from "./api-service";
export { getApiRegistryReport, discoverEndpoints, getVersionInfo, getApiSummary } from "./api-registry";
export { registerRoute, getRoute, getAllRoutes, getRoutesByVersion, getRoutesByTag, getRouteCount } from "./route-registry";
export {
  registerEndpoint,
  getEndpoint,
  getEndpointsByVersion,
  getAllEndpoints,
  getEndpointsByTag,
  searchEndpoints,
  createEndpointBuilder,
  getEndpointCount,
} from "./endpoint-metadata";
export { getApiConfig, updateApiConfig, getRateLimitConfig, getPageSize } from "./api-configuration";
export {
  registerVersion,
  getVersion,
  getAllVersions,
  getCurrentVersion,
  resolveVersion,
  negotiateVersion,
  isVersionCompatible,
  deprecateVersion,
  sunsetVersion,
  addBreakingChange,
  addChangelogEntry,
  setMigrationPath,
} from "./api-version-manager";
export {
  createRequestContext,
  enrichRequestContext,
  getRequestDuration,
  extractPaginationParams,
  extractFilterParams,
  extractSortParams,
  extractFieldSelection,
  applyFieldSelection,
  validatePagination,
  parseVersionFromPath,
  parseVersionFromHeader,
  buildResponseHeaders,
} from "./request-pipeline";
export {
  createResponseContext,
  toNextResponse,
  jsonResponse,
  paginatedResponse,
  errorResponse,
  noContentResponse,
  createdResponse,
} from "./response-pipeline";

// Auth & Authorization
export {
  checkScope,
  authorize,
  enforceTenantAccess,
  checkResourceOwnership,
  buildScopeFromPermission,
  buildPermissionFromScope,
  getLeastPrivilegeScopes,
} from "./auth/api-authorization";
export type { AuthorizationResult } from "./auth/api-authorization";

export {
  registerApiKey,
  getApiKey,
  getApiKeyByHash,
  getApiKeysByTenant,
  revokeApiKey,
  validateApiKey,
  registerServiceAccount,
  getServiceAccount,
  getServiceAccountByClientId,
  getServiceAccountsByTenant,
  revokeServiceAccount,
  validateServiceAccount,
  registerPersonalAccessToken,
  getPersonalAccessToken,
  getPersonalAccessTokensByUser,
  revokePersonalAccessToken,
  validatePersonalAccessToken,
  registerScopedToken,
  getScopedToken,
  validateScopedToken,
  consumeScopedToken,
  revokeScopedToken,
  introspectToken,
  resolveAuthStrategy,
  authenticate,
  generateApiKeyValue,
  generatePatValue,
  generateScopedTokenValue,
  generateClientSecret,
} from "./auth";

// Webhooks
export {
  createSubscription,
  getSubscription,
  getSubscriptionsByTenant,
  getSubscriptionsByEvent,
  updateSubscription,
  deleteSubscription,
  pauseSubscription,
  activateSubscription,
  getAllSubscriptions,
  getActiveSubscriptions,
  matchSubscriptions,
  createDelivery,
  getDelivery,
  getDeliveriesBySubscription,
  getRecentDeliveries,
  updateDeliveryStatus,
  logEvent,
  getRecentEvents,
  deliverWebhook,
  getWebhookHealth,
  generateSignature,
  verifySignature,
  getDeadLetterDeliveries,
  retryDeadLetter,
  getWebhookStats,
  generateWebhookSecret,
} from "./webhooks";

// OpenAPI
export { generateOpenApiSpec, generateOpenApiJson, getOpenApiSpecMetadata } from "./openapi";

// Observability
export {
  recordApiMetric,
  getApiMetrics,
  getRequestVolume,
  getAverageLatency,
  getErrorRate,
  getEndpointUsage,
  getAuthMetrics,
  getWebhookMetrics,
  getApiObservabilitySummary,
  getRateLimitEvents,
  getSdkUsageMetrics,
} from "./observability";

// SDK
export { SDK_LANGUAGES, SDK_MODELS, BASE_CLIENT_TYPESCRIPT, WEBHOOK_HELPER_TYPESCRIPT, getSdkPackage, getSdkEndpoints } from "./sdk";
export type { SdkPackage, SdkModel } from "./sdk";

// Examples
export {
  SAMPLE_LIST_WALLETS,
  SAMPLE_AUTHENTICATION,
  SAMPLE_API_CLIENT,
  SAMPLE_WEBHOOK_RECEIVER,
  SAMPLE_SYNCHRONIZATION,
  SAMPLE_PAGINATION,
  SAMPLE_FILTERING,
  SAMPLE_ERROR_HANDLING,
  SAMPLE_IDEMPOTENCY,
  SAMPLE_APP_INDEX,
  getSampleCategories,
} from "./examples";

export type * from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type ApiVersion = "v1" | "v2";

export type VersionStatus = "current" | "beta" | "deprecated" | "sunset";

export type ApiProtocol = "rest" | "graphql" | "websocket" | "webhook";

export type RateLimitTier = "free" | "basic" | "enterprise" | "internal";

export type AuthStrategy =
  | "oauth2"
  | "bearer-token"
  | "api-key"
  | "service-account"
  | "personal-access-token"
  | "jwt"
  | "scoped-token"
  | "none";

export type ScopeCategory =
  | "workflow"
  | "treasury"
  | "approvals"
  | "wallets"
  | "connectors"
  | "reconciliation"
  | "audit"
  | "administration"
  | "security"
  | "risk"
  | "analytics"
  | "reporting"
  | "automation"
  | "onboarding"
  | "accounting"
  | "tax"
  | "compliance"
  | "identity"
  | "developer";

export interface EndpointParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  type: string;
  description: string;
  example?: string;
  schema?: Record<string, unknown>;
  deprecated?: boolean;
}

export interface EndpointResponse {
  status: number;
  description: string;
  contentType?: string;
  schema?: Record<string, unknown>;
  example?: unknown;
}

export interface EndpointMetadata {
  id: string;
  method: HttpMethod;
  path: string;
  version: ApiVersion;
  operationId: string;
  summary: string;
  description?: string;
  tags: string[];
  auth: AuthStrategy[];
  requiredScopes: string[];
  rateLimitTier: RateLimitTier;
  deprecated: boolean;
  deprecationMessage?: string;
  parameters: EndpointParameter[];
  requestBody?: {
    contentType: string;
    description: string;
    schema: Record<string, unknown>;
    example?: unknown;
  };
  responses: EndpointResponse[];
  internal: boolean;
  tenantAware: boolean;
  auditLogged: boolean;
  addedAt: Date;
  updatedAt: Date;
}

export interface VersionInfo {
  version: ApiVersion;
  status: VersionStatus;
  releaseDate: Date;
  sunsetDate?: Date;
  deprecationDate?: Date;
  breakingChanges: string[];
  migrationGuide?: string;
  changelog: string[];
}

export interface ApiPlatformConfig {
  baseUrl: string;
  versions: ApiVersion[];
  defaultVersion: ApiVersion;
  rateLimits: Record<RateLimitTier, { requests: number; windowMs: number }>;
  maxPageSize: number;
  defaultPageSize: number;
  requestTimeoutMs: number;
  compressionEnabled: boolean;
  correlationHeader: string;
  auditEnabled: boolean;
  openApiPath: string;
  developerPortalPath: string;
}

export interface RequestContext {
  requestId: string;
  correlationId: string;
  version: ApiVersion;
  method: HttpMethod;
  path: string;
  startTime: number;
  tenantId?: string;
  userId?: string;
  authStrategy?: AuthStrategy;
  scopes: string[];
  rateLimitTier: RateLimitTier;
  ip: string;
  userAgent?: string;
}

export interface ResponseContext {
  statusCode: number;
  headers: Record<string, string>;
  body?: unknown;
  durationMs: number;
  compressed: boolean;
  cached: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  documentationUrl?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: string;
    nextCursor?: string;
  };
}

export interface FilterParams {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "nin" | "between";
  value: unknown;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
  priority?: number;
}

export interface FieldSelectionParams {
  fields: string[];
  include?: string[];
  exclude?: string[];
}

export interface WebhookSubscriptionConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  filters?: Record<string, unknown>;
  secret: string;
  signingAlgorithm: "hmac-sha256";
  headers?: Record<string, string>;
  retryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    backoffMultiplier: number;
    maxDelayMs: number;
  };
  rateLimit: {
    maxPerMinute: number;
  };
  status: "active" | "paused" | "disabled";
  version: ApiVersion;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: string;
  payload: unknown;
  status: "pending" | "delivering" | "delivered" | "failed" | "dead-letter";
  attempt: number;
  maxRetries: number;
  responseStatusCode?: number;
  responseBody?: string;
  durationMs?: number;
  error?: string;
  scheduledAt: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  version: ApiVersion;
  tenantId: string;
  source: string;
  subject?: string;
  data: unknown;
  timestamp: Date;
  correlationId: string;
}

export interface SdkClientConfig {
  baseUrl: string;
  apiKey?: string;
  accessToken?: string;
  oauth2?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scopes: string[];
  };
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    initialDelayMs: number;
    backoffMultiplier: number;
  };
  headers?: Record<string, string>;
}

export interface SdkEndpoint {
  method: HttpMethod;
  path: string;
  operationId: string;
  summary: string;
  parameters: EndpointParameter[];
  requestBodySchema?: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  isPaginated: boolean;
  requiredScopes: string[];
}

export interface DeveloperPortalPage {
  slug: string;
  title: string;
  description: string;
  category: "overview" | "guide" | "reference" | "explorer" | "resources";
  order: number;
  content: string;
  lastUpdated: Date;
  version: ApiVersion;
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  tenantId: string;
  userId: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  status: "active" | "expired" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceAccountConfig {
  id: string;
  name: string;
  clientId: string;
  clientSecretHash: string;
  scopes: string[];
  tenantId: string;
  rateLimitTier: RateLimitTier;
  allowedIps?: string[];
  expiresAt?: Date;
  status: "active" | "expired" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalAccessTokenConfig {
  id: string;
  name: string;
  tokenPrefix: string;
  tokenHash: string;
  scopes: string[];
  userId: string;
  tenantId: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  status: "active" | "expired" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

export interface ScopedTokenConfig {
  id: string;
  token: string;
  scopes: string[];
  tenantId: string;
  userId: string;
  resourceId?: string;
  expiresAt: Date;
  oneTimeUse: boolean;
  used: boolean;
  status: "active" | "expired" | "consumed" | "revoked";
  createdAt: Date;
}

export interface TokenIntrospectionResult {
  active: boolean;
  scopes: string[];
  clientId?: string;
  userId?: string;
  tenantId?: string;
  exp?: number;
  iat?: number;
  tokenType: string;
}

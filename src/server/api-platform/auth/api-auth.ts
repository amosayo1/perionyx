import type {
  ApiKeyConfig,
  ServiceAccountConfig,
  PersonalAccessTokenConfig,
  ScopedTokenConfig,
  TokenIntrospectionResult,
  AuthStrategy,
} from "../types";

// ──────────────────────────────────────────────────────────
// In-memory stores (non-persistent)
// ──────────────────────────────────────────────────────────

const apiKeys = new Map<string, ApiKeyConfig>();
const serviceAccounts = new Map<string, ServiceAccountConfig>();
const personalAccessTokens = new Map<string, PersonalAccessTokenConfig>();
const scopedTokens = new Map<string, ScopedTokenConfig>();

// ──────────────────────────────────────────────────────────
// API Keys
// ──────────────────────────────────────────────────────────

export function registerApiKey(key: ApiKeyConfig): void {
  apiKeys.set(key.id, key);
}

export function getApiKey(id: string): ApiKeyConfig | undefined {
  return apiKeys.get(id);
}

export function getApiKeyByHash(hash: string): ApiKeyConfig | undefined {
  return [...apiKeys.values()].find((k) => k.keyHash === hash && k.status === "active");
}

export function getApiKeysByTenant(tenantId: string): ApiKeyConfig[] {
  return [...apiKeys.values()].filter((k) => k.tenantId === tenantId);
}

export function revokeApiKey(id: string): boolean {
  const key = apiKeys.get(id);
  if (!key) return false;
  key.status = "revoked";
  key.updatedAt = new Date();
  return true;
}

export function validateApiKey(apiKey: string): { valid: boolean; config?: ApiKeyConfig; reason?: string } {
  const hash = simpleHash(apiKey);
  const config = getApiKeyByHash(hash);
  if (!config) return { valid: false, reason: "Invalid API key" };
  if (config.status !== "active") return { valid: false, reason: "API key is not active" };
  if (config.expiresAt && config.expiresAt < new Date()) return { valid: false, reason: "API key has expired" };
  config.lastUsedAt = new Date();
  return { valid: true, config };
}

// ──────────────────────────────────────────────────────────
// Service Accounts
// ──────────────────────────────────────────────────────────

export function registerServiceAccount(account: ServiceAccountConfig): void {
  serviceAccounts.set(account.id, account);
}

export function getServiceAccount(id: string): ServiceAccountConfig | undefined {
  return serviceAccounts.get(id);
}

export function getServiceAccountByClientId(clientId: string): ServiceAccountConfig | undefined {
  return [...serviceAccounts.values()].find((a) => a.clientId === clientId && a.status === "active");
}

export function getServiceAccountsByTenant(tenantId: string): ServiceAccountConfig[] {
  return [...serviceAccounts.values()].filter((a) => a.tenantId === tenantId);
}

export function revokeServiceAccount(id: string): boolean {
  const account = serviceAccounts.get(id);
  if (!account) return false;
  account.status = "revoked";
  account.updatedAt = new Date();
  return true;
}

export function validateServiceAccount(clientId: string, clientSecret: string): { valid: boolean; account?: ServiceAccountConfig; reason?: string } {
  const account = getServiceAccountByClientId(clientId);
  if (!account) return { valid: false, reason: "Invalid client credentials" };
  if (account.status !== "active") return { valid: false, reason: "Service account is not active" };
  if (account.expiresAt && account.expiresAt < new Date()) return { valid: false, reason: "Service account has expired" };
  if (account.allowedIps && account.allowedIps.length > 0) {
    // IP validation would happen at a higher level
  }
  const secretHash = simpleHash(clientSecret);
  if (account.clientSecretHash !== secretHash) return { valid: false, reason: "Invalid client secret" };
  return { valid: true, account };
}

// ──────────────────────────────────────────────────────────
// Personal Access Tokens
// ──────────────────────────────────────────────────────────

export function registerPersonalAccessToken(token: PersonalAccessTokenConfig): void {
  personalAccessTokens.set(token.id, token);
}

export function getPersonalAccessToken(id: string): PersonalAccessTokenConfig | undefined {
  return personalAccessTokens.get(id);
}

export function getPersonalAccessTokensByUser(userId: string): PersonalAccessTokenConfig[] {
  return [...personalAccessTokens.values()].filter((t) => t.userId === userId);
}

export function revokePersonalAccessToken(id: string): boolean {
  const token = personalAccessTokens.get(id);
  if (!token) return false;
  token.status = "revoked";
  token.updatedAt = new Date();
  return true;
}

export function validatePersonalAccessToken(token: string): { valid: boolean; config?: PersonalAccessTokenConfig; reason?: string } {
  const hash = simpleHash(token);
  const config = [...personalAccessTokens.values()].find(
    (t) => t.tokenHash === hash && t.status === "active",
  );
  if (!config) return { valid: false, reason: "Invalid personal access token" };
  if (config.expiresAt && config.expiresAt < new Date()) return { valid: false, reason: "Token has expired" };
  config.lastUsedAt = new Date();
  return { valid: true, config };
}

// ──────────────────────────────────────────────────────────
// Scoped Tokens
// ──────────────────────────────────────────────────────────

export function registerScopedToken(token: ScopedTokenConfig): void {
  scopedTokens.set(token.id, token);
}

export function getScopedToken(id: string): ScopedTokenConfig | undefined {
  return scopedTokens.get(id);
}

export function validateScopedToken(token: string): { valid: boolean; config?: ScopedTokenConfig; reason?: string } {
  const hash = simpleHash(token);
  const config = [...scopedTokens.values()].find(
    (t) => simpleHash(t.token) === hash && t.status === "active",
  );
  if (!config) return { valid: false, reason: "Invalid scoped token" };
  if (config.expiresAt < new Date()) return { valid: false, reason: "Token has expired" };
  if (config.oneTimeUse && config.used) return { valid: false, reason: "Token has already been consumed" };
  return { valid: true, config };
}

export function consumeScopedToken(id: string): boolean {
  const token = scopedTokens.get(id);
  if (!token || !token.oneTimeUse) return false;
  token.used = true;
  token.status = "consumed";
  return true;
}

export function revokeScopedToken(id: string): boolean {
  const token = scopedTokens.get(id);
  if (!token) return false;
  token.status = "revoked";
  return true;
}

// ──────────────────────────────────────────────────────────
// Token Introspection
// ──────────────────────────────────────────────────────────

export function introspectToken(token: string): TokenIntrospectionResult {
  const apiKeyResult = validateApiKey(token);
  if (apiKeyResult.valid && apiKeyResult.config) {
    return {
      active: true,
      scopes: apiKeyResult.config.scopes,
      userId: apiKeyResult.config.userId,
      tenantId: apiKeyResult.config.tenantId,
      tokenType: "api-key",
    };
  }

  const patResult = validatePersonalAccessToken(token);
  if (patResult.valid && patResult.config) {
    return {
      active: true,
      scopes: patResult.config.scopes,
      userId: patResult.config.userId,
      tenantId: patResult.config.tenantId,
      tokenType: "personal-access-token",
    };
  }

  return { active: false, scopes: [], tokenType: "unknown" };
}

// ──────────────────────────────────────────────────────────
// Auth Strategy Router
// ──────────────────────────────────────────────────────────

export function resolveAuthStrategy(authorization?: string): { strategy: AuthStrategy; credentials?: string } {
  if (!authorization) return { strategy: "none" };

  if (authorization.startsWith("Bearer ")) {
    return { strategy: "bearer-token", credentials: authorization.slice(7) };
  }
  if (authorization.startsWith("Basic ")) {
    return { strategy: "service-account", credentials: authorization.slice(6) };
  }

  return { strategy: "api-key", credentials: authorization };
}

export function authenticate(strategy: AuthStrategy, credentials: string) {
  switch (strategy) {
    case "api-key":
      return validateApiKey(credentials);
    case "bearer-token":
      return validatePersonalAccessToken(credentials);
    case "personal-access-token":
      return validatePersonalAccessToken(credentials);
    case "service-account": {
      const decoded = Buffer.from(credentials, "base64").toString("utf-8");
      const [clientId, clientSecret] = decoded.split(":");
      return validateServiceAccount(clientId, clientSecret);
    }
    case "scoped-token":
      return validateScopedToken(credentials);
    default:
      return { valid: false, reason: `Unsupported auth strategy: ${strategy}` };
  }
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function simpleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

export function generateApiKeyValue(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `va_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function generatePatValue(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `pat_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function generateScopedTokenValue(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `st_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function generateClientSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `cs_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

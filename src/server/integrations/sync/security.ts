import type { SyncSession, SyncOptions } from "./types";

export interface SecurityValidation {
  valid: boolean;
  tenantIsolated: boolean;
  permissionsValid: boolean;
  credentialsValid: boolean;
  errors: string[];
}

export function validateTenantIsolation(
  session: SyncSession,
  companyId: string,
): boolean {
  return session.companyId === companyId;
}

export function validatePermission(
  session: SyncSession,
  requiredPermissions: string[],
  userPermissions: Set<string>,
): boolean {
  return requiredPermissions.every((p) => userPermissions.has(p));
}

export function validateSyncScope(
  session: SyncSession,
  allowedEntityTypes: Set<string>,
): string[] {
  const errors: string[] = [];
  const scope = session.options.scope;

  if (scope?.entityTypes) {
    for (const entityType of scope.entityTypes) {
      if (!allowedEntityTypes.has(entityType)) {
        errors.push(`Entity type "${entityType}" not allowed for provider ${session.providerId}`);
      }
    }
  }

  return errors;
}

export function sanitizeCheckpointData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveFields = new Set([
    "token", "accessToken", "refreshToken", "secret", "apiKey",
    "password", "clientSecret", "privateKey",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeCheckpointData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function validateSyncOptions(options: SyncOptions): string[] {
  const errors: string[] = [];

  if (!options.mode) errors.push("Sync mode is required");
  if (!options.direction) errors.push("Sync direction is required");

  if (options.batchSize !== undefined) {
    if (options.batchSize < 1) errors.push("Batch size must be at least 1");
    if (options.batchSize > 10000) errors.push("Batch size must not exceed 10000");
  }

  if (options.concurrency !== undefined) {
    if (options.concurrency < 1) errors.push("Concurrency must be at least 1");
    if (options.concurrency > 20) errors.push("Concurrency must not exceed 20");
  }

  if (options.timeoutMs !== undefined && options.timeoutMs < 1000) {
    errors.push("Timeout must be at least 1000ms");
  }

  return errors;
}

export function performSecurityValidation(
  session: SyncSession,
  context: {
    companyId: string;
    userPermissions: Set<string>;
    allowedEntityTypes: Set<string>;
    requiredPermissions: string[];
  },
): SecurityValidation {
  const errors: string[] = [];

  const tenantIsolated = validateTenantIsolation(session, context.companyId);
  if (!tenantIsolated) errors.push("Tenant isolation check failed");

  const permissionsValid = validatePermission(session, context.requiredPermissions, context.userPermissions);
  if (!permissionsValid) errors.push("Permission check failed");

  const scopeErrors = validateSyncScope(session, context.allowedEntityTypes);
  errors.push(...scopeErrors);

  return {
    valid: errors.length === 0,
    tenantIsolated,
    permissionsValid,
    credentialsValid: true,
    errors,
  };
}

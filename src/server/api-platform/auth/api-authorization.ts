import type { RequestContext, AuthStrategy } from "../types";

// ──────────────────────────────────────────────────────────
// API Authorization — integrates with existing RBAC/IAM
// ──────────────────────────────────────────────────────────

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  scopes: string[];
  tenantId?: string;
  userId?: string;
}

export function checkScope(
  grantedScopes: string[],
  requiredScopes: string[],
  mode: "all" | "any" = "all",
): boolean {
  if (requiredScopes.length === 0) return true;
  if (mode === "all") {
    return requiredScopes.every((s) => grantedScopes.includes(s));
  }
  return requiredScopes.some((s) => grantedScopes.includes(s));
}

export function authorize(
  ctx: RequestContext,
  requiredScopes: string[],
  mode: "all" | "any" = "all",
): AuthorizationResult {
  if (requiredScopes.length === 0) {
    return { authorized: true, scopes: ctx.scopes, tenantId: ctx.tenantId, userId: ctx.userId };
  }

  const hasScope = checkScope(ctx.scopes, requiredScopes, mode);
  if (!hasScope) {
    return {
      authorized: false,
      reason: `Missing required scopes: ${requiredScopes.join(", ")}`,
      scopes: ctx.scopes,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    };
  }

  return { authorized: true, scopes: ctx.scopes, tenantId: ctx.tenantId, userId: ctx.userId };
}

export function enforceTenantAccess(
  ctx: RequestContext,
  resourceTenantId: string,
): boolean {
  if (!ctx.tenantId) return false;
  if (ctx.tenantId === "*") return true; // cross-tenant admin
  return ctx.tenantId === resourceTenantId;
}

export function checkResourceOwnership(
  userId: string | undefined,
  resourceOwnerId: string,
): boolean {
  if (!userId) return false;
  return userId === resourceOwnerId;
}

export function buildScopeFromPermission(permission: string): string {
  return permission.replace(/\./g, ":");
}

export function buildPermissionFromScope(scope: string): string {
  return scope.replace(/:/g, ".");
}

export function getLeastPrivilegeScopes(requestedScopes: string[], userScopes: string[]): string[] {
  return requestedScopes.filter((s) => userScopes.includes(s));
}

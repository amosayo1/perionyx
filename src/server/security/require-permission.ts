import { requireRuntimeContext, type RuntimeContext } from "@/runtime/context";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
}

/**
 * Require a specific permission for the current request.
 *
 * Primary path: reads from RuntimeContext (set by withRuntimeContext).
 * Fallback: API key validation when proxy headers are absent.
 */
export async function requirePermission(
  request: Request,
  permission: string,
): Promise<AuthContext> {
  const runtimeCtx = requireRuntimeContext();

  if (runtimeCtx.tenant) {
    await rbacService.ensurePermission(
      runtimeCtx.tenant.userId,
      runtimeCtx.tenant.companyId,
      permission,
    );
    return runtimeCtx.tenant;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const { ApiKeyService } = await import("@/modules/api-keys/api-keys.service");
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");
    const ctx = { userId: apiKeyResult.keyId, companyId: apiKeyResult.companyId, role: "ADMIN" };
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, permission);
    return ctx;
  }

  throw new UnauthorizedError("Authentication required");
}

/**
 * Require authentication for the current request.
 *
 * Primary path: reads from RuntimeContext (set by withRuntimeContext).
 * Fallback: API key validation when proxy headers are absent.
 */
export async function requireAuth(
  request: Request,
): Promise<AuthContext> {
  const runtimeCtx = requireRuntimeContext();

  if (runtimeCtx.tenant) {
    return runtimeCtx.tenant;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const { ApiKeyService } = await import("@/modules/api-keys/api-keys.service");
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");
    return { userId: apiKeyResult.keyId, companyId: apiKeyResult.companyId, role: "ADMIN" };
  }

  throw new UnauthorizedError("Authentication required");
}

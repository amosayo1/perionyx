import { requireRuntimeContext } from "@/runtime/context";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";
import { PermissionRegistry } from "@/server/iam/permissions";
import type { GranularPermission } from "@/server/iam/types";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
}

/**
 * MFA verification window (Phase 28.1 H-01).
 *
 * A user who has enrolled MFA must have verified a TOTP/recovery code within
 * this window for actions whose permission is flagged requiresMfa. Mirrors
 * the 8-12h max session lifetimes defined for MFA-required roles in
 * src/server/iam/roles.ts.
 */
const MFA_VERIFICATION_WINDOW_MS = 12 * 60 * 60 * 1000;

/**
 * Enforce MFA for permissions flagged requiresMfa (Phase 28.1 H-01).
 *
 * Enforcement policy:
 * - If the user has MFA enrolled, a successful TOTP/recovery verification
 *   (mfaLastVerifiedAt) must be present and fresh — otherwise the action is
 *   rejected with ForbiddenError. This closes the "MFA enrolled but never
 *   enforced" gap.
 * - Users without MFA enrolled are not blocked (forced enrollment is a
 *   product policy decision, tracked as an accepted risk).
 * - API-key callers are machine credentials without a human MFA step.
 */
async function enforceMfa(
  userId: string,
  companyId: string,
  permission: string,
): Promise<void> {
  const requiresMfa = PermissionRegistry.requiresMfa(permission as GranularPermission);
  if (!requiresMfa) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true, mfaLastVerifiedAt: true },
  });

  if (!user?.mfaEnabled) return;

  const fresh =
    user.mfaLastVerifiedAt !== null &&
    Date.now() - user.mfaLastVerifiedAt.getTime() <= MFA_VERIFICATION_WINDOW_MS;

  if (!fresh) {
    logger.warn({ userId, companyId, permission }, "MFA verification required — rejected");
    throw new ForbiddenError(
      "This action requires recent MFA verification. Re-authenticate with your authenticator app.",
    );
  }
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
    await enforceMfa(runtimeCtx.tenant.userId, runtimeCtx.tenant.companyId, permission);
    return runtimeCtx.tenant;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const { ApiKeyService, roleFromApiKeyScopes } = await import("@/modules/api-keys/api-keys.service");
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");
    const ctx = {
      userId: apiKeyResult.keyId,
      companyId: apiKeyResult.companyId,
      role: roleFromApiKeyScopes(apiKeyResult.scopes),
    };
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
    const { ApiKeyService, roleFromApiKeyScopes } = await import("@/modules/api-keys/api-keys.service");
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");
    return {
      userId: apiKeyResult.keyId,
      companyId: apiKeyResult.companyId,
      role: roleFromApiKeyScopes(apiKeyResult.scopes),
    };
  }

  throw new UnauthorizedError("Authentication required");
}

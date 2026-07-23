import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
}

export async function requirePermission(
  request: Request,
  permission: string,
): Promise<AuthContext> {
  const session = await auth();
  if (!session?.user?.id) {
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

  const ctx = requireTenantContext(
    session.user.id,
    session.user.activeCompanyId,
    session.user.companyRole as string | undefined,
  );

  await rbacService.ensurePermission(ctx.userId, ctx.companyId, permission);
  return ctx;
}

export async function requireAuth(
  request: Request,
): Promise<AuthContext> {
  const session = await auth();
  if (!session?.user?.id) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { ApiKeyService } = await import("@/modules/api-keys/api-keys.service");
      const apiKeyResult = await ApiKeyService.validate(authHeader);
      if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");
      return { userId: apiKeyResult.keyId, companyId: apiKeyResult.companyId, role: "ADMIN" };
    }
    throw new UnauthorizedError("Authentication required");
  }

  return requireTenantContext(
    session.user.id,
    session.user.activeCompanyId,
    session.user.companyRole as string | undefined,
  );
}

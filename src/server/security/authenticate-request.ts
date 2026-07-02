import { auth } from "@/server/auth/auth";
import { requireTenantContext, type TenantContext } from "@/server/context/tenant-context";
import { ApiKeyService } from "@/modules/api-keys/api-keys.service";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors/app-error";

const SCOPE_MAP: Record<string, string[]> = {
  "read:accounts": ["GET"],
  "write:transfers": ["POST", "PUT", "PATCH"],
  "admin:all": ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

export async function authenticateRequest(
  request: Request,
  requiredScope?: string,
): Promise<TenantContext> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");

    if (requiredScope && !apiKeyResult.scopes.includes(requiredScope)) {
      throw new ForbiddenError(`API key does not have scope: ${requiredScope}`);
    }

    return { userId: apiKeyResult.keyId, companyId: apiKeyResult.companyId, role: "ADMIN" };
  }

  const session = await auth();
  return requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
}

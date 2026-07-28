import { requireRuntimeContext } from "@/runtime/context";
import { ApiKeyService } from "@/modules/api-keys/api-keys.service";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors/app-error";

const SCOPE_MAP: Record<string, string[]> = {
  "read:accounts": ["GET"],
  "write:transfers": ["POST", "PUT", "PATCH"],
  "admin:all": ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

/**
 * Authenticate a request and return the tenant context.
 *
 * Primary path: reads from RuntimeContext (set by withRuntimeContext).
 * Fallback: API key validation when proxy headers are absent.
 */
export async function authenticateRequest(
  request: Request,
  requiredScope?: string,
) {
  const runtimeCtx = requireRuntimeContext();

  if (runtimeCtx.tenant) {
    return runtimeCtx.tenant;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    if (!apiKeyResult) throw new UnauthorizedError("Invalid API key");

    if (requiredScope && !apiKeyResult.scopes.includes(requiredScope)) {
      throw new ForbiddenError(`API key does not have scope: ${requiredScope}`);
    }

    return { userId: apiKeyResult.keyId, companyId: apiKeyResult.companyId, role: "ADMIN" as const };
  }

  throw new UnauthorizedError("Authentication required");
}

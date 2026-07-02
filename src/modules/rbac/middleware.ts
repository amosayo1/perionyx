import { NextRequest } from "next/server";
import { rbacService, RBACService } from "./rbac.service";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function requirePermission(
  req: NextRequest,
  permission: string
) {
  // Expect middleware to have set `companyId` and `userId` on request headers or cookies
  const companyId = req.headers.get("x-company-id") || undefined;
  const userId = req.headers.get("x-user-id") || undefined;

  if (!companyId || !userId) {
    throw new ForbiddenError("Missing authentication/company context");
  }

  const ok = await rbacService.userHasPermission(userId, companyId, permission);
  if (!ok) throw new ForbiddenError(`Missing permission: ${permission}`);

  return true;
}

export function requirePermissionMiddleware(permission: string) {
  return async (req: NextRequest) => {
    await requirePermission(req, permission);
  };
}

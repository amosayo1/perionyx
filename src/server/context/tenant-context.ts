import type { CompanyRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

export function requireTenantContext(
  userId: string | undefined,
  companyId: string | null | undefined,
  role: CompanyRole | string | null | undefined,
): TenantContext {
  if (!userId) {
    throw new UnauthorizedError("Authentication required.");
  }
  if (!companyId || !role) {
    throw new ForbiddenError("No active company on the session.");
  }

  // License enforcement: if LICENSE_COMPANY_ID is set, only that company is allowed
  const licensedCompanyId = process.env.LICENSE_COMPANY_ID;
  if (licensedCompanyId && companyId !== licensedCompanyId) {
    throw new ForbiddenError("This instance is licensed for a different company. Access denied.");
  }

  return { userId, companyId, role: role as CompanyRole };
}

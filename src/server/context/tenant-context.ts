import type { CompanyRole } from "@prisma/client";

/**
 * Tenant context — the canonical shape for tenant identity in all code.
 *
 * Used by 242+ module files. Do not delete or restructure.
 * The validation function that was here (requireTenantContext) has been
 * replaced by withRuntimeContext (src/server/http/init-runtime-context.ts).
 */
export type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

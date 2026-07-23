import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { PlaidService } from "@/modules/integrations/plaid";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.read');
    const accounts = await PlaidService.getLinkedAccounts(ctx);
    return NextResponse.json({ items: accounts });
  } catch (error) {
    return handleRouteError(error);
  }
}

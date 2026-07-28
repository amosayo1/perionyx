import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { PlaidService } from "@/modules/integrations/plaid";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
      const accounts = await PlaidService.getLinkedAccounts(ctx.tenant);
      return NextResponse.json({ items: accounts });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

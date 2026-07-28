import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PlaidService } from "@/modules/integrations/plaid";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.sync');
      const body = await parseJsonBody<{ accountId: string; type: "transactions" | "balance" }>(request);
  
      if (body.type === "balance") {
        const result = await PlaidService.syncBalance(ctx.tenant, body.accountId);
        return NextResponse.json(result);
      }
  
      const result = await PlaidService.syncTransactions(ctx.tenant, body.accountId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

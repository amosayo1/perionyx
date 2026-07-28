import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { TreasuryService } from "@/modules/treasury";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ accountId: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { accountId } = await context.params;
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
      const result = await TreasuryService.getAccountHistory(ctx.tenant, accountId, limit);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

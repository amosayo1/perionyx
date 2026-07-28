import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasuryService } from "@/modules/treasury";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ accountId: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.manage');
      const { accountId } = await context.params;
      const body = await parseJsonBody<unknown>(request);
      const result = await TreasuryService.addControl(ctx.tenant, accountId, body as any);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasuryService } from "@/modules/treasury";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const items = await TreasuryService.listAccounts(ctx.tenant);
      return NextResponse.json({ items }, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<unknown>(request);
      const result = await TreasuryService.createAccount(ctx.tenant, body as any);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

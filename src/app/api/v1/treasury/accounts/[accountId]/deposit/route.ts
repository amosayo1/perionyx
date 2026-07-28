import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasuryService } from "@/modules/treasury";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request, { params }: { params: Promise<{ accountId: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.credit');
      const { accountId } = await params;
      const body = await parseJsonBody<{ amount: number; currency?: string; reference?: string; description?: string }>(request);
      const result = await TreasuryService.deposit(ctx.tenant, { ...body, accountId });
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

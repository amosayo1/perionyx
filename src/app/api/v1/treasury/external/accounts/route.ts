import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ExternalBankingService } from "@/modules/treasury/external-banking.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const items = await ExternalBankingService.listConnectedInstitutions(ctx.tenant);
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

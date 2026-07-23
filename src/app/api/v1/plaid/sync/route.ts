import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PlaidService } from "@/modules/integrations/plaid";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.sync');
    const body = await parseJsonBody<{ accountId: string; type: "transactions" | "balance" }>(request);

    if (body.type === "balance") {
      const result = await PlaidService.syncBalance(ctx, body.accountId);
      return NextResponse.json(result);
    }

    const result = await PlaidService.syncTransactions(ctx, body.accountId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

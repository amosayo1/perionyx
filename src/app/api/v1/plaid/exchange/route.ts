import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PlaidService } from "@/modules/integrations/plaid";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ publicToken: string; accountId: string }>(request);
    const result = await PlaidService.exchangePublicToken(ctx, body.publicToken, body.accountId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

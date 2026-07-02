import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { TreasuryService } from "@/modules/treasury";

type RouteContext = { params: Promise<{ accountId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { accountId } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const result = await TreasuryService.getAccountHistory(ctx, accountId, limit);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

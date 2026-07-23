import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { getAnalyticsSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = getAnalyticsSchema.safeParse(params);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await FinanceCollaborationService.getAnalytics(ctx, parsed.data);
    return NextResponse.json(data, { headers: cacheHeaders(60) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

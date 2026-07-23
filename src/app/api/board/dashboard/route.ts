import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { handleRouteError, zodErrorResponse, cacheHeaders } from "@/server/http/handle-route";
import { boardDashboardQuerySchema } from "@/lib/validations/board-governance";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = boardDashboardQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const result = await BoardGovernanceFacade.getDashboard(ctx, queryResult.data.boardId);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

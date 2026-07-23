import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse } from "@/server/procurement/api/errors";
import { cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, 'ap.reports.view');
    const response = NextResponse.json({ data: { events: [], pagination: { total: 0, page: 1, limit: 25 } } }, { status: 200, headers: cacheHeaders(30) });
    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

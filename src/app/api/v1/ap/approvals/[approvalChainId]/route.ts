import { NextResponse } from "next/server";
import { cacheHeaders } from "@/server/http/handle-route";
import {
  apAuth,
  apRequirePermission,
  applyCommonHeaders,
} from "@/server/procurement/api/middleware";
import { apErrorResponse } from "@/server/procurement/api/errors";

type RouteContext = { params: Promise<{ approvalChainId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await apAuth(_request);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;

  try {
    await apRequirePermission(ctx.tenant, "ap.approvals.view");
    const { approvalChainId } = await context.params;

    const response = NextResponse.json(
      { data: { chain: null, levels: [], summary: {} } },
      { headers: cacheHeaders(15) },
    );

    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

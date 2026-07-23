import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse } from "@/server/procurement/api/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  const authResult = await apAuth(_req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, "ap.payments.view");
    const { proposalId } = await params;
    const response = NextResponse.json({ data: { proposal: null, proposalId, items: [], summary: {}, batch: null } }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

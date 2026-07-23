import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse } from "@/server/procurement/api/errors";

export async function GET(req: Request, { params }: { params: Promise<{ reconciliationId: string }> }) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, 'ap.reconciliation.view');
    const { reconciliationId } = await params;
    const response = NextResponse.json({ data: { reconciliation: { id: reconciliationId, status: 'pending', vendorName: '', statementDate: '', totalAmount: '0', matchedAmount: '0', unmatchedAmount: '0', matchRate: 0, lineItems: [] } } }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

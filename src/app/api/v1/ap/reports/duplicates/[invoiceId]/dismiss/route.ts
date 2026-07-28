import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse } from "@/server/procurement/api/errors";
import { duplicateDetectionService } from "@/server/procurement/application/duplicate-detection.service";

type RouteContext = { params: Promise<{ invoiceId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, "ap.reports.view");
    const { invoiceId } = await context.params;
    const dismissed = await duplicateDetectionService.dismissFalsePositive(invoiceId, ctx.tenant.companyId);
    if (!dismissed) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    const response = NextResponse.json({ data: { dismissed: true } }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

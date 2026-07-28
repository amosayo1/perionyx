import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse } from "@/server/procurement/api/errors";
import { duplicateDetectionService } from "@/server/procurement/application/duplicate-detection.service";

export async function POST(req: Request) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, "ap.reports.view");
    const result = await duplicateDetectionService.scanForDuplicates(ctx.tenant.companyId);
    const response = NextResponse.json({ data: result }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

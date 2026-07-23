import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, toCommandContext, handleIdempotentRequest, cacheIdempotentResponse, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError } from "@/server/procurement/api/errors";
import { idempotencyKey } from "@/server/procurement/api/idempotency";
import { importVendorStatementSchema } from "@/lib/validations/ap";
import { parseJsonBody } from "@/server/http/handle-route";

export async function POST(req: Request) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, 'ap.reconciliation.execute');
    const idKey = idempotencyKey(req);
    const cached = handleIdempotentRequest(req, idKey, ctx.tenant.companyId);
    if (cached) return cached;
    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = importVendorStatementSchema.safeParse(body);
    if (!parsed.success) return apValidationError(parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message, code: i.code })), ctx.correlationId);
    const response = NextResponse.json({ data: { id: 'recon-import-placeholder', success: true } }, { status: 201 });
    applyCommonHeaders(response, ctx.correlationId);
    cacheIdempotentResponse(req, idKey, ctx.tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

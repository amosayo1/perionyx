import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, handleIdempotentRequest, cacheIdempotentResponse, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError } from "@/server/procurement/api/errors";
import { idempotencyKey } from "@/server/procurement/api/idempotency";
import { parseJsonBody } from "@/server/http/handle-route";
import { executePaymentSchema } from "@/lib/validations/ap";

export async function POST(req: Request, { params }: { params: Promise<{ batchId: string }> }) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, "ap.payments.execute");
    const idKey = idempotencyKey(req);
    const cached = handleIdempotentRequest(req, idKey, ctx.tenant.companyId);
    if (cached) return cached;
    const { batchId } = await params;
    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = executePaymentSchema.safeParse(body);
    if (!parsed.success) return apValidationError(parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message, code: i.code })), ctx.correlationId);
    const response = NextResponse.json({ data: { batchId, paymentId: parsed.data.paymentId, executed: true } }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    cacheIdempotentResponse(req, idKey, ctx.tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

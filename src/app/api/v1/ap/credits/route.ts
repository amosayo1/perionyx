import { NextResponse } from "next/server";
import { apAuth, apRequirePermission, handleIdempotentRequest, cacheIdempotentResponse, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError } from "@/server/procurement/api/errors";
import { idempotencyKey } from "@/server/procurement/api/idempotency";
import { creditListQuerySchema, receiveCreditNoteSchema } from "@/lib/validations/ap";
import { parseJsonBody, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, 'ap.credits.view');
    const url = new URL(req.url);
    const query = creditListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const response = NextResponse.json({ data: { credits: [], pagination: { total: 0, page: query.page, limit: query.limit } } }, { status: 200, headers: cacheHeaders(30) });
    applyCommonHeaders(response, ctx.correlationId);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

export async function POST(req: Request) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, 'ap.credits.create');
    const idKey = idempotencyKey(req);
    const cached = handleIdempotentRequest(req, idKey, ctx.tenant.companyId);
    if (cached) return cached;
    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = receiveCreditNoteSchema.safeParse(body);
    if (!parsed.success) return apValidationError(parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message, code: i.code })), ctx.correlationId);
    const response = NextResponse.json({ data: { id: 'credit-placeholder', success: true } }, { status: 201 });
    applyCommonHeaders(response, ctx.correlationId);
    cacheIdempotentResponse(req, idKey, ctx.tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

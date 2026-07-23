import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/app-error";
import { apAuth, apRequirePermission, toCommandContext, handleIdempotentRequest, cacheIdempotentResponse, applyCommonHeaders } from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError } from "@/server/procurement/api/errors";
import { idempotencyKey } from "@/server/procurement/api/idempotency";
import { parseJsonBody } from "@/server/http/handle-route";
import { generatePaymentProposalSchema } from "@/lib/validations/ap";

export async function POST(req: Request) {
  const authResult = await apAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;
  try {
    await apRequirePermission(ctx.tenant, "ap.payments.create");
    const idKey = idempotencyKey(req);
    const cached = handleIdempotentRequest(req, idKey, ctx.tenant.companyId);
    if (cached) return cached;
    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = generatePaymentProposalSchema.safeParse(body);
    if (!parsed.success) return apValidationError(parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message, code: i.code })), ctx.correlationId);
    const cmdCtx = toCommandContext(ctx.tenant, ctx.correlationId);
    const proposalId = `proposal-${Date.now()}`;
    const response = NextResponse.json({ data: { proposalId, status: "DRAFT", createdBy: cmdCtx.userId, createdAt: cmdCtx.timestamp.toISOString() } }, { status: 201 });
    applyCommonHeaders(response, ctx.correlationId);
    cacheIdempotentResponse(req, idKey, ctx.tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

import { NextResponse } from "next/server";
import { parseJsonBody } from "@/server/http/handle-route";
import {
  apAuth,
  apRequirePermission,
  toCommandContext,
  handleIdempotentRequest,
  cacheIdempotentResponse,
  applyCommonHeaders,
} from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError } from "@/server/procurement/api/errors";
import { idempotencyKey } from "@/server/procurement/api/idempotency";
import { AppError } from "@/lib/errors/app-error";
import { getAPRepositories } from "@/server/procurement/ap-repositories/registry";
import { ApprovalApplicationService } from "@/server/procurement/application";
import { escalateApprovalApprovalSchema } from "@/lib/validations/ap";

const repos = getAPRepositories();

type RouteContext = { params: Promise<{ approvalChainId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;

  try {
    await apRequirePermission(ctx.tenant, "ap.approvals.escalate");

    const idKey = idempotencyKey(request);
    const cached = handleIdempotentRequest(request, idKey, ctx.tenant.companyId);
    if (cached) return applyCommonHeaders(cached, ctx.correlationId);

    const { approvalChainId } = await context.params;
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const parsed = escalateApprovalApprovalSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        ctx.correlationId,
      );
    }

    const service = new ApprovalApplicationService(repos);
    const cmdCtx = toCommandContext(ctx.tenant, ctx.correlationId);
    const result = await service.escalateApprovalLevel(
      { approvalRecordId: approvalChainId, reason: parsed.data.reason },
      cmdCtx,
    );

    if (!result.success) {
      return apErrorResponse(new AppError(result.error!.message, result.error!.code, result.error!.statusCode), ctx.correlationId);
    }

    const response = NextResponse.json({ data: { id: approvalChainId, status: "ESCALATED" } }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    cacheIdempotentResponse(request, idKey, ctx.tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

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
import { InMemoryAPRepositoryRegistry } from "@/server/procurement/ap-repositories/in-memory-registry";
import { ExceptionApplicationService } from "@/server/procurement/application";
import { assignExceptionSchema } from "@/lib/validations/ap";

const repos = new InMemoryAPRepositoryRegistry();

type RouteContext = { params: Promise<{ exceptionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { ctx } = authResult;

  try {
    await apRequirePermission(ctx.tenant, "ap.exceptions.assign");

    const idKey = idempotencyKey(request);
    const cached = handleIdempotentRequest(request, idKey, ctx.tenant.companyId);
    if (cached) return applyCommonHeaders(cached, ctx.correlationId);

    const { exceptionId } = await context.params;
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const parsed = assignExceptionSchema.safeParse({ ...body, exceptionId });
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        ctx.correlationId,
      );
    }

    const service = new ExceptionApplicationService(repos);
    const cmdCtx = toCommandContext(ctx.tenant, ctx.correlationId);
    const result = await service.assignException(parsed.data, cmdCtx);

    if (!result.success) {
      return apErrorResponse(new AppError(result.error!.message, result.error!.code, result.error!.statusCode), ctx.correlationId);
    }

    const response = NextResponse.json({ data: { id: exceptionId } }, { status: 200 });
    applyCommonHeaders(response, ctx.correlationId);
    cacheIdempotentResponse(request, idKey, ctx.tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new Error(String(error)), ctx.correlationId);
  }
}

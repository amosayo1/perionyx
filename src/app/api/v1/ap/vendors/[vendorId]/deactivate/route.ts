import { NextResponse } from "next/server";
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
import { VendorApplicationService } from "@/server/procurement/application";
import { vendorStateTransitionSchema } from "@/lib/validations/ap";

type RouteContext = { params: Promise<{ vendorId: string }> };

const repos = getAPRepositories();
const vendorService = new VendorApplicationService(repos);

export async function POST(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  const idemKey = idempotencyKey(request);
  const cached = handleIdempotentRequest(request, idemKey, tenant.companyId);
  if (cached) return applyCommonHeaders(cached, correlationId);

  try {
    await apRequirePermission(tenant, "ap.vendors.delete");
    const { vendorId } = await context.params;

    const body = await request.json();
    const parsed = vendorStateTransitionSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    if (!parsed.data.reason) {
      return apValidationError([{ path: "reason", message: "Deactivation reason is required", code: "required" }], correlationId);
    }

    const commandCtx = toCommandContext(tenant, correlationId);
    const result = await vendorService.deactivateVendor({ vendorId, reason: parsed.data.reason }, commandCtx);

    if (!result.success || !result.data) {
      return apErrorResponse(new AppError(result.error!.message, result.error!.code, result.error!.statusCode), correlationId);
    }

    const response = applyCommonHeaders(NextResponse.json({ data: result.data }), correlationId);
    cacheIdempotentResponse(request, idemKey, tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new AppError(String(error), "INTERNAL", 500), correlationId);
  }
}

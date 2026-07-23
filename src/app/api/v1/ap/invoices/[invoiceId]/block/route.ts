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
import { InMemoryAPRepositoryRegistry } from "@/server/procurement/ap-repositories/in-memory-registry";
import { InvoiceApplicationService } from "@/server/procurement/application";
import { blockInvoiceSchema } from "@/lib/validations/ap";

type RouteContext = { params: Promise<{ invoiceId: string }> };

const repos = new InMemoryAPRepositoryRegistry();
const invoiceService = new InvoiceApplicationService(repos);

export async function POST(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  const idemKey = idempotencyKey(request);
  const cached = handleIdempotentRequest(request, idemKey, tenant.companyId);
  if (cached) return applyCommonHeaders(cached, correlationId);

  try {
    await apRequirePermission(tenant, "ap.invoices.manage");
    const { invoiceId } = await context.params;

    const body = await request.json();
    const parsed = blockInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const commandCtx = toCommandContext(tenant, correlationId);
    const result = await invoiceService.blockInvoice(
      { invoiceId, reason: parsed.data.reason, blockType: parsed.data.blockType },
      commandCtx,
    );

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

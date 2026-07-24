import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
import { vendorListQuerySchema, createVendorSchema } from "@/lib/validations/ap";

const repos = getAPRepositories();
const vendorService = new VendorApplicationService(repos);

export async function GET(request: Request) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  try {
    await apRequirePermission(tenant, "ap.vendors.view");

    const { searchParams } = new URL(request.url);
    const query = vendorListQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return apValidationError(
        query.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const { page, limit, ...filters } = query.data;
    const result = await repos.vendor.findByFilter(
      { companyId: tenant.companyId, ...filters },
      undefined,
      { page, limit },
    );

    return applyCommonHeaders(NextResponse.json({ data: result }), correlationId);
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new AppError(String(error), "INTERNAL", 500), correlationId);
  }
}

export async function POST(request: Request) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  const idemKey = idempotencyKey(request);
  const cached = handleIdempotentRequest(request, idemKey, tenant.companyId);
  if (cached) return applyCommonHeaders(cached, correlationId);

  try {
    await apRequirePermission(tenant, "ap.vendors.create");

    const body = await request.json();
    const parsed = createVendorSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const commandCtx = toCommandContext(tenant, correlationId);
    const result = await vendorService.createVendor(
      { ...parsed.data, creditLimit: parsed.data.creditLimit !== undefined ? new Prisma.Decimal(parsed.data.creditLimit) : undefined },
      commandCtx,
    );

    if (!result.success || !result.data) {
      return apErrorResponse(new AppError(result.error!.message, result.error!.code, result.error!.statusCode), correlationId);
    }

    const response = applyCommonHeaders(NextResponse.json({ data: result.data }, { status: 201 }), correlationId);
    cacheIdempotentResponse(request, idemKey, tenant.companyId, response);
    return response;
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new AppError(String(error), "INTERNAL", 500), correlationId);
  }
}

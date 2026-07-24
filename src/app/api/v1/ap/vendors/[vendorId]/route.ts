import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  apAuth,
  apRequirePermission,
  toCommandContext,
  applyCommonHeaders,
} from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError, apNotFoundResponse } from "@/server/procurement/api/errors";
import { AppError } from "@/lib/errors/app-error";
import { getAPRepositories } from "@/server/procurement/ap-repositories/registry";
import { VendorApplicationService } from "@/server/procurement/application";
import { updateVendorSchema } from "@/lib/validations/ap";

type RouteContext = { params: Promise<{ vendorId: string }> };

const repos = getAPRepositories();
const vendorService = new VendorApplicationService(repos);

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await apAuth(_request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  try {
    await apRequirePermission(tenant, "ap.vendors.view");
    const { vendorId } = await context.params;

    const vendor = await repos.vendor.findById(vendorId, tenant.companyId);
    if (!vendor) return apNotFoundResponse("Vendor", correlationId);

    return applyCommonHeaders(NextResponse.json({ data: vendor }), correlationId);
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new AppError(String(error), "INTERNAL", 500), correlationId);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  try {
    await apRequirePermission(tenant, "ap.vendors.manage");
    const { vendorId } = await context.params;

    const body = await request.json();
    const parsed = updateVendorSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const commandCtx = toCommandContext(tenant, correlationId);
    const result = await vendorService.updateVendor(
      { ...parsed.data, vendorId, creditLimit: parsed.data.creditLimit !== undefined ? new Prisma.Decimal(parsed.data.creditLimit) : undefined },
      commandCtx,
    );

    if (!result.success || !result.data) {
      return apErrorResponse(new AppError(result.error!.message, result.error!.code, result.error!.statusCode), correlationId);
    }

    return applyCommonHeaders(NextResponse.json({ data: result.data }), correlationId);
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new AppError(String(error), "INTERNAL", 500), correlationId);
  }
}

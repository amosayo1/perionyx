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
import { InvoiceApplicationService } from "@/server/procurement/application";
import { invoiceListQuerySchema, receiveInvoiceSchema } from "@/lib/validations/ap";

const repos = getAPRepositories();
const invoiceService = new InvoiceApplicationService(repos);

export async function GET(request: Request) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  try {
    await apRequirePermission(tenant, "ap.invoices.view");

    const { searchParams } = new URL(request.url);
    const query = invoiceListQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return apValidationError(
        query.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const { page, limit, status, invoiceDateFrom, invoiceDateTo, dueDateFrom, dueDateTo, ...rest } = query.data;
    const filter: Record<string, unknown> = { companyId: tenant.companyId, ...rest };
    if (status) filter.status = status.split(",") as string[];
    if (invoiceDateFrom) filter.invoiceDateFrom = invoiceDateFrom;
    if (invoiceDateTo) filter.invoiceDateTo = invoiceDateTo;
    if (dueDateFrom) filter.dueDateFrom = dueDateFrom;
    if (dueDateTo) filter.dueDateTo = dueDateTo;

    const result = await repos.invoice.findByFilter(filter as never, undefined, { page, limit });

    return applyCommonHeaders(NextResponse.json({ data: result }), correlationId, 15);
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
    await apRequirePermission(tenant, "ap.invoices.create");

    const body = await request.json();
    const parsed = receiveInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const commandCtx = toCommandContext(tenant, correlationId);
    const result = await invoiceService.receiveInvoice(
      {
        ...parsed.data,
        invoiceDate: new Date(parsed.data.invoiceDate),
        dueDate: new Date(parsed.data.dueDate),
        lineItems: parsed.data.lineItems.map((li) => ({
          ...li,
          taxRate: li.taxRate !== undefined ? li.taxRate : undefined,
        })),
      } as never,
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

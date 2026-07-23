import { NextResponse } from "next/server";
import {
  apAuth,
  apRequirePermission,
  toCommandContext,
  applyCommonHeaders,
} from "@/server/procurement/api/middleware";
import { apErrorResponse, apValidationError, apNotFoundResponse } from "@/server/procurement/api/errors";
import { AppError } from "@/lib/errors/app-error";
import { InMemoryAPRepositoryRegistry } from "@/server/procurement/ap-repositories/in-memory-registry";
import { InvoiceApplicationService } from "@/server/procurement/application";
import { updateInvoiceSchema } from "@/lib/validations/ap";

type RouteContext = { params: Promise<{ invoiceId: string }> };

const repos = new InMemoryAPRepositoryRegistry();
const invoiceService = new InvoiceApplicationService(repos);

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await apAuth(_request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  try {
    await apRequirePermission(tenant, "ap.invoices.view");
    const { invoiceId } = await context.params;

    const invoice = await repos.invoice.findById(invoiceId, tenant.companyId);
    if (!invoice) return apNotFoundResponse("Invoice", correlationId);

    return applyCommonHeaders(NextResponse.json({ data: invoice }), correlationId);
  } catch (error) {
    return apErrorResponse(error instanceof Error ? error : new AppError(String(error), "INTERNAL", 500), correlationId);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await apAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { tenant, correlationId } = authResult.ctx;

  try {
    await apRequirePermission(tenant, "ap.invoices.manage");
    const { invoiceId } = await context.params;

    const body = await request.json();
    const parsed = updateInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return apValidationError(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })),
        correlationId,
      );
    }

    const commandCtx = toCommandContext(tenant, correlationId);
    const result = await invoiceService.updateInvoice(
      {
        invoiceId,
        invoiceDate: parsed.data.invoiceDate ? new Date(parsed.data.invoiceDate) : undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        description: parsed.data.description,
        lineItems: parsed.data.lineItems as never,
      },
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

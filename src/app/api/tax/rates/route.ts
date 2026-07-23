import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CorporateTaxService } from "@/modules/tax-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getRatesQuerySchema, createRateSchema } from "@/lib/validations/tax-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = getRatesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const offset = queryResult.data.page
      ? (queryResult.data.page - 1) * (queryResult.data.limit ?? 50)
      : 0;
    const result = await CorporateTaxService.getRates(ctx, {
      ...queryResult.data,
      offset,
    });
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<unknown>(req);
    const parsed = createRateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await CorporateTaxService.createRate(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

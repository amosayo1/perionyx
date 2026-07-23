import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { TaxProvisionService } from "@/modules/tax-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getProvisionsQuerySchema, createProvisionSchema } from "@/lib/validations/tax-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = getProvisionsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const offset = queryResult.data.page
      ? (queryResult.data.page - 1) * (queryResult.data.limit ?? 50)
      : 0;
    const result = await TaxProvisionService.getProvisions(ctx, {
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
    const parsed = createProvisionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await TaxProvisionService.createProvision(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

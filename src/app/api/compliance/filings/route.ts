import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { FilingManagementService } from "@/modules/compliance-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getFilingsQuerySchema, createFilingSchema } from "@/lib/validations/compliance-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = getFilingsQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const { page, limit, ...filters } = queryResult.data;
    const result = await FilingManagementService.getFilings(ctx, {
      ...filters,
      limit: limit ?? 50,
      offset: page ? (page - 1) * (limit ?? 50) : 0,
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
    const parsed = createFilingSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await FilingManagementService.createFiling(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

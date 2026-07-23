import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { FrameworkManagementService } from "@/modules/compliance-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getFrameworksQuerySchema, createFrameworkSchema } from "@/lib/validations/compliance-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = getFrameworksQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const { page, limit, ...filters } = queryResult.data;
    const result = await FrameworkManagementService.getFrameworks(ctx, {
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
    const parsed = createFrameworkSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await FrameworkManagementService.createFramework(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

import { NextResponse } from "next/server";
import { ObligationTrackerService } from "@/modules/compliance-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getObligationsQuerySchema, createObligationSchema } from "@/lib/validations/compliance-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const queryResult = getObligationsQuerySchema.safeParse(
        Object.fromEntries(url.searchParams),
      );
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const { page, limit, ...filters } = queryResult.data;
      const result = await ObligationTrackerService.getObligations(ctx.tenant, {
        ...filters,
        limit: limit ?? 50,
        offset: page ? (page - 1) * (limit ?? 50) : 0,
      });
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createObligationSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await ObligationTrackerService.createObligation(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

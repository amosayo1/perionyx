import { NextResponse } from "next/server";
import { TaxCalendarService } from "@/modules/tax-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getDeadlinesQuerySchema, createDeadlineSchema } from "@/lib/validations/tax-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const queryResult = getDeadlinesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const offset = queryResult.data.page
        ? (queryResult.data.page - 1) * (queryResult.data.limit ?? 50)
        : 0;
      const result = await TaxCalendarService.getDeadlines(ctx.tenant, {
        ...queryResult.data,
        offset,
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
      const parsed = createDeadlineSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await TaxCalendarService.createDeadline(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

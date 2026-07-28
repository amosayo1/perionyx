import { NextResponse } from "next/server";
import { TaxRiskService } from "@/modules/tax-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getRiskAssessmentsQuerySchema, createRiskAssessmentSchema } from "@/lib/validations/tax-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const queryResult = getRiskAssessmentsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const offset = queryResult.data.page
        ? (queryResult.data.page - 1) * (queryResult.data.limit ?? 50)
        : 0;
      const result = await TaxRiskService.getRiskAssessments(ctx.tenant, {
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
      const parsed = createRiskAssessmentSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await TaxRiskService.createRiskAssessment(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

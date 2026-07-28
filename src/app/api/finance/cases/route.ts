import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { getCasesSchema, createCaseSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse } from "@/server/http/handle-route";
import { parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getCasesSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await FinanceCollaborationService.getCaseManagement(ctx.tenant, parsed.data);
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createCaseSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await FinanceCollaborationService.getCaseManagement(ctx.tenant, parsed.data as any);
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

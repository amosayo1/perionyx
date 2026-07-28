import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CaseManagementService } from "@/modules/finance-collaboration";
import { updateCaseSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const data = await CaseManagementService.getCaseById(ctx.tenant, id);
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<Record<string, unknown>>(req);
      const parsed = updateCaseSchema.safeParse({ ...body, id });
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const { id: _caseId, ...updates } = parsed.data;
      const data = await CaseManagementService.updateCase(ctx.tenant, id, updates);
      return NextResponse.json(data);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { DecisionRegistry } from "@/modules/finance-collaboration";
import { registryDecisionStatusSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { z } from "zod";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteParams = { params: Promise<{ id: string }> };

const updateDecisionStatusSchema = z.object({
  status: registryDecisionStatusSchema,
});

export async function GET(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const data = await DecisionRegistry.getDecisionById(ctx.tenant, id);
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
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = updateDecisionStatusSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await DecisionRegistry.updateDecisionStatus(ctx.tenant, id, parsed.data.status);
      return NextResponse.json(data);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

import { NextResponse } from "next/server";
import { DecisionEngine } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import {
  createAgentDecisionSchema,
  agentDecisionListQuerySchema,
} from "@/lib/validations/agent-framework";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const url = new URL(req.url);
      const queryResult = agentDecisionListQuerySchema.safeParse(
        Object.fromEntries(url.searchParams),
      );
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const result = await DecisionEngine.list(ctx.tenant, { ...queryResult.data, agentId: id });
      return NextResponse.json(result, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "agents.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createAgentDecisionSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const decision = await DecisionEngine.create(ctx.tenant, id, parsed.data);
      return NextResponse.json(decision, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

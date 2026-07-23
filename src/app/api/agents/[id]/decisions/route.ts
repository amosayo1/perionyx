import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { DecisionEngine } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import {
  createAgentDecisionSchema,
  agentDecisionListQuerySchema,
} from "@/lib/validations/agent-framework";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = agentDecisionListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const result = await DecisionEngine.list(ctx, { ...queryResult.data, agentId: id });
    return NextResponse.json(result, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "agents.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = createAgentDecisionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const decision = await DecisionEngine.create(ctx, id, parsed.data);
    return NextResponse.json(decision, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

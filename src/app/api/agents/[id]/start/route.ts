import { NextResponse } from "next/server";
import { AgentRuntime } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "agents.manage");
  
      const body = await parseJsonBody<Record<string, unknown> | undefined>(req).catch(() => ({}));
      const result = await AgentRuntime.startAgent(ctx.tenant, id, body as Record<string, unknown> | undefined);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

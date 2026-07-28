import { NextResponse } from "next/server";
import { AgentRegistry } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateAgentDefinitionSchema } from "@/lib/validations/agent-framework";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const agent = await AgentRegistry.get(ctx.tenant, id);
      return NextResponse.json(agent);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "agents.manage");
  
      const body = await parseJsonBody<Record<string, unknown>>(req);
      const parsed = updateAgentDefinitionSchema.safeParse({ ...body, id });
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const { id: _, ...input } = parsed.data;
      const updated = await AgentRegistry.update(ctx.tenant, id, input);
      return NextResponse.json(updated);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "agents.manage");
  
      const disabled = await AgentRegistry.disable(ctx.tenant, id);
      return NextResponse.json(disabled);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

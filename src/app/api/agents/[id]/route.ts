import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AgentRegistry } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateAgentDefinitionSchema } from "@/lib/validations/agent-framework";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const agent = await AgentRegistry.get(ctx, id);
    return NextResponse.json(agent);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "agents.manage");

    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = updateAgentDefinitionSchema.safeParse({ ...body, id });
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const { id: _, ...input } = parsed.data;
    const updated = await AgentRegistry.update(ctx, id, input);
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "agents.manage");

    const disabled = await AgentRegistry.disable(ctx, id);
    return NextResponse.json(disabled);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

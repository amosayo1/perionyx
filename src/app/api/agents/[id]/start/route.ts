import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AgentRuntime } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "agents.manage");

    const body = await parseJsonBody<Record<string, unknown> | undefined>(req).catch(() => ({}));
    const result = await AgentRuntime.startAgent(ctx, id, body as Record<string, unknown> | undefined);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

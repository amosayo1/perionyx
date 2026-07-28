import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { WorkspaceService } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const items = await WorkspaceService.list(ctx.tenant);
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const items = await WorkspaceService.initialize(ctx.tenant);
      return NextResponse.json({ items }, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

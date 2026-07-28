import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { RoleExperienceService } from "@/modules/enterprise-experience";
import type { RoleDashboardConfig, RoleType } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const items = await RoleExperienceService.list(ctx.tenant);
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
      const items = await RoleExperienceService.initialize(ctx.tenant);
      return NextResponse.json({ items }, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const body = await parseJsonBody<{ role: RoleType; config: RoleDashboardConfig }>(request);
      const dashboard = await RoleExperienceService.update(ctx.tenant, body.role, body.config);
      return NextResponse.json(dashboard);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

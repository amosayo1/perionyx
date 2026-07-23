import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { RoleExperienceService } from "@/modules/enterprise-experience";
import type { RoleDashboardConfig, RoleType } from "@/modules/enterprise-experience";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const items = await RoleExperienceService.list(ctx);
    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const items = await RoleExperienceService.initialize(ctx);
    return NextResponse.json({ items }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const body = await parseJsonBody<{ role: RoleType; config: RoleDashboardConfig }>(request);
    const dashboard = await RoleExperienceService.update(ctx, body.role, body.config);
    return NextResponse.json(dashboard);
  } catch (error) {
    return handleRouteError(error);
  }
}

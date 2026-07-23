import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ImplementationCenterService } from "@/modules/enterprise-experience";
import type { MilestoneStatus } from "@/modules/enterprise-experience";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const { searchParams } = new URL(request.url);
    if (searchParams.get("summary") === "true") {
      const summary = await ImplementationCenterService.getProgress(ctx);
      return NextResponse.json(summary);
    }
    const items = await ImplementationCenterService.listMilestones(ctx);
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
    const items = await ImplementationCenterService.initializeMilestones(ctx);
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
    const body = await parseJsonBody<{
      milestoneId: string;
      status: MilestoneStatus;
      completedBy?: string;
      notes?: string;
    }>(request);
    const milestone = await ImplementationCenterService.updateMilestoneStatus(
      ctx,
      body.milestoneId,
      body.status,
      body.completedBy,
      body.notes,
    );
    return NextResponse.json(milestone);
  } catch (error) {
    return handleRouteError(error);
  }
}

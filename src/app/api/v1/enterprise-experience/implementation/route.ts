import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ImplementationCenterService } from "@/modules/enterprise-experience";
import type { MilestoneStatus } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const { searchParams } = new URL(request.url);
      if (searchParams.get("summary") === "true") {
        const summary = await ImplementationCenterService.getProgress(ctx.tenant);
        return NextResponse.json(summary);
      }
      const items = await ImplementationCenterService.listMilestones(ctx.tenant);
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
      const items = await ImplementationCenterService.initializeMilestones(ctx.tenant);
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
      const body = await parseJsonBody<{
        milestoneId: string;
        status: MilestoneStatus;
        completedBy?: string;
        notes?: string;
      }>(request);
      const milestone = await ImplementationCenterService.updateMilestoneStatus(
        ctx.tenant,
        body.milestoneId,
        body.status,
        body.completedBy,
        body.notes,
      );
      return NextResponse.json(milestone);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

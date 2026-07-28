import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ProductGuidanceService } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const { searchParams } = new URL(request.url);
      const trigger = searchParams.get("trigger") ?? undefined;
      const role = searchParams.get("role") ?? undefined;
      const tours = await ProductGuidanceService.getActiveTours(ctx.tenant, trigger ?? "", role ?? "");
      return NextResponse.json({ items: tours });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const body = await parseJsonBody<{
        userId: string;
        guidanceId: string;
        stepIndex: number;
        completed: boolean;
      }>(request);
      const progress = await ProductGuidanceService.recordProgress(ctx.tenant, body.userId, body.guidanceId, body.stepIndex, body.completed);
      return NextResponse.json(progress, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

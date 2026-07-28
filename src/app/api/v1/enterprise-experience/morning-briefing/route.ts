import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { MorningBriefingService } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      const briefing = id
        ? await MorningBriefingService.getById(ctx.tenant, id)
        : await MorningBriefingService.getToday(ctx.tenant);
      return NextResponse.json(briefing);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const briefing = await MorningBriefingService.generate(ctx.tenant);
      return NextResponse.json(briefing, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const body = await parseJsonBody<{ id: string }>(request);
      const briefing = await MorningBriefingService.markRead(ctx.tenant, body.id);
      return NextResponse.json(briefing);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

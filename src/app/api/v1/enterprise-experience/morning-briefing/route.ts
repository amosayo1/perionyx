import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { MorningBriefingService } from "@/modules/enterprise-experience";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const briefing = id
      ? await MorningBriefingService.getById(ctx, id)
      : await MorningBriefingService.getToday(ctx);
    return NextResponse.json(briefing);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const briefing = await MorningBriefingService.generate(ctx);
    return NextResponse.json(briefing, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const body = await parseJsonBody<{ id: string }>(request);
    const briefing = await MorningBriefingService.markRead(ctx, body.id);
    return NextResponse.json(briefing);
  } catch (error) {
    return handleRouteError(error);
  }
}

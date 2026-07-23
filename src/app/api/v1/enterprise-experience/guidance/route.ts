import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ProductGuidanceService } from "@/modules/enterprise-experience";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get("trigger") ?? undefined;
    const role = searchParams.get("role") ?? undefined;
    const tours = await ProductGuidanceService.getActiveTours(ctx, trigger ?? "", role ?? "");
    return NextResponse.json({ items: tours });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const body = await parseJsonBody<{
      userId: string;
      guidanceId: string;
      stepIndex: number;
      completed: boolean;
    }>(request);
    const progress = await ProductGuidanceService.recordProgress(ctx, body.userId, body.guidanceId, body.stepIndex, body.completed);
    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

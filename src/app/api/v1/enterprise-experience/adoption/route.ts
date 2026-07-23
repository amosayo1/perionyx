import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { AdoptionAnalyticsService } from "@/modules/enterprise-experience";
import type { AdoptionEventType, AdoptionCategory } from "@/modules/enterprise-experience";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? undefined;
    const score = userId
      ? await AdoptionAnalyticsService.getUserAdoption(ctx, userId)
      : await AdoptionAnalyticsService.getCompanyScore(ctx);
    return NextResponse.json(score);
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
      eventType: AdoptionEventType;
      category: AdoptionCategory;
      key: string;
      label?: string;
      metadata?: Record<string, unknown>;
      durationMs?: number;
    }>(request);
    const event = await AdoptionAnalyticsService.trackEvent(ctx, body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const score = await AdoptionAnalyticsService.computeScore(ctx);
    return NextResponse.json(score);
  } catch (error) {
    return handleRouteError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { AdoptionAnalyticsService } from "@/modules/enterprise-experience";
import type { AdoptionEventType, AdoptionCategory } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId") ?? undefined;
      const score = userId
        ? await AdoptionAnalyticsService.getUserAdoption(ctx.tenant, userId)
        : await AdoptionAnalyticsService.getCompanyScore(ctx.tenant);
      return NextResponse.json(score);
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
        eventType: AdoptionEventType;
        category: AdoptionCategory;
        key: string;
        label?: string;
        metadata?: Record<string, unknown>;
        durationMs?: number;
      }>(request);
      const event = await AdoptionAnalyticsService.trackEvent(ctx.tenant, body);
      return NextResponse.json(event, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const score = await AdoptionAnalyticsService.computeScore(ctx.tenant);
      return NextResponse.json(score);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

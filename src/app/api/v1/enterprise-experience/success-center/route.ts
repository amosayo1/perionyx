import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { CustomerSuccessService } from "@/modules/enterprise-experience";
import type { ResourceType, TicketPriority, FeatureRequestStatus } from "@/modules/enterprise-experience";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "enterprise.experience");
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") as ResourceType | null;
      const role = searchParams.get("role") ?? undefined;
      const search = searchParams.get("search") ?? undefined;
      const items = await CustomerSuccessService.listResources(ctx.tenant, {
        type: type ?? undefined,
        role,
        search,
      });
      return NextResponse.json({ items });
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
        title: string;
        description?: string;
        category?: string;
      }>(request);
      const featureRequest = await CustomerSuccessService.submitFeatureRequest(ctx.tenant, body);
      return NextResponse.json(featureRequest, { status: 201 });
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
        userId: string;
        subject: string;
        description?: string;
        category?: string;
        priority?: TicketPriority;
      }>(request);
      const ticket = await CustomerSuccessService.createTicket(ctx.tenant, body);
      return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

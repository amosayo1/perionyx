import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { CustomerSuccessService } from "@/modules/enterprise-experience";
import type { TicketStatus, TicketPriority } from "@/modules/enterprise-experience";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TicketStatus | null;
    const priority = searchParams.get("priority") as TicketPriority | null;
    const items = await CustomerSuccessService.listTickets(ctx, {
      status: status ?? undefined,
      priority: priority ?? undefined,
    });
    return NextResponse.json({ items });
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
      id: string;
      status?: TicketStatus;
      assignedTo?: string;
      resolution?: string;
    }>(request);
    const ticket = await CustomerSuccessService.updateTicket(ctx, body.id, {
      status: body.status,
      assignedTo: body.assignedTo,
      resolution: body.resolution,
    });
    return NextResponse.json(ticket);
  } catch (error) {
    return handleRouteError(error);
  }
}

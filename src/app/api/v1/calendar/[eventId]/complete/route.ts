import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { CalendarService } from "@/modules/calendar";
import { rbacService } from "@/modules/rbac/rbac.service";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'treasury.read');
    const { eventId } = await context.params;
    const result = await CalendarService.markComplete(ctx, eventId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { CalendarService } from "@/modules/calendar";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { eventId } = await context.params;
      const result = await CalendarService.markComplete(ctx.tenant, eventId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

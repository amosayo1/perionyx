import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { CalendarService } from "@/modules/calendar";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const result = await CalendarService.autoGenerateEvents(ctx.tenant);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

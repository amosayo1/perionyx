import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { CalendarService } from "@/modules/calendar";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") ?? undefined;
      const status = searchParams.get("status") ?? undefined;
      const from = searchParams.get("from") ?? undefined;
      const to = searchParams.get("to") ?? undefined;
      const result = await CalendarService.listEvents(ctx.tenant, { type, status, from, to });
      return NextResponse.json(result, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<unknown>(request);
      const result = await CalendarService.createEvent(ctx.tenant, body as any);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

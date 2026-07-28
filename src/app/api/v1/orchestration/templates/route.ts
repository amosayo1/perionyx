import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { TemplateLibrary } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const category = request.nextUrl.searchParams.get("category") ?? undefined;
      const items = await TemplateLibrary.list(ctx.tenant, category);
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

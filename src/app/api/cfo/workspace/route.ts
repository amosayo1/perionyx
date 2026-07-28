import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { updateWorkspaceSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.read");
  
      const prefs = await CFOAdvisorService.getWorkspacePreferences(ctx.tenant, ctx.tenant.userId);
      return NextResponse.json(prefs ?? { layout: {}, pinnedWidgets: [], hiddenWidgets: [], theme: "dark" });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = updateWorkspaceSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const prefs = await CFOAdvisorService.updateWorkspacePreferences(ctx.tenant, ctx.tenant.userId, parsed.data);
      return NextResponse.json(prefs);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

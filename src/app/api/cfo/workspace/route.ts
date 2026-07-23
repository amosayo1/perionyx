import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { updateWorkspaceSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.read");

    const prefs = await CFOAdvisorService.getWorkspacePreferences(ctx, ctx.userId);
    return NextResponse.json(prefs ?? { layout: {}, pinnedWidgets: [], hiddenWidgets: [], theme: "dark" });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const prefs = await CFOAdvisorService.updateWorkspacePreferences(ctx, ctx.userId, parsed.data);
    return NextResponse.json(prefs);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { updateRecommendationStatusSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = updateRecommendationStatusSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    let result;
    switch (parsed.data.action) {
      case "acknowledge":
        result = await CFOAdvisorService.acknowledgeRecommendation(ctx, id);
        break;
      case "accept":
        result = await CFOAdvisorService.acceptRecommendation(ctx, id);
        break;
      case "reject":
        result = await CFOAdvisorService.rejectRecommendation(ctx, id);
        break;
    }
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

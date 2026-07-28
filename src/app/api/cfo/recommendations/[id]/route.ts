import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { updateRecommendationStatusSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = updateRecommendationStatusSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      let result;
      switch (parsed.data.action) {
        case "acknowledge":
          result = await CFOAdvisorService.acknowledgeRecommendation(ctx.tenant, id);
          break;
        case "accept":
          result = await CFOAdvisorService.acceptRecommendation(ctx.tenant, id);
          break;
        case "reject":
          result = await CFOAdvisorService.rejectRecommendation(ctx.tenant, id);
          break;
      }
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

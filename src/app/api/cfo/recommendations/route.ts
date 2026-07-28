import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { createRecommendationSchema, updateRecommendationStatusSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.read");
  
      const url = new URL(req.url);
      const category = url.searchParams.get("category") as string | undefined;
      const status = url.searchParams.get("status") as string | undefined;
      const riskLevel = url.searchParams.get("riskLevel") as string | undefined;
      const page = Number(url.searchParams.get("page") ?? "1");
      const limit = Number(url.searchParams.get("limit") ?? "20");
  
      const result = await CFOAdvisorService.getRecommendations(ctx.tenant, {
        category: category as any,
        status: status as any,
        riskLevel: riskLevel as any,
        page,
        limit,
      });
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.access");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createRecommendationSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const recommendation = await CFOAdvisorService.createRecommendation(ctx.tenant, parsed.data);
      return NextResponse.json(recommendation, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

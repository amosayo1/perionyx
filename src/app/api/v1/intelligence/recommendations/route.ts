import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { RecommendationEngine } from "@/modules/intelligence-platform";
import { z } from "zod";
import { zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const updateStatusSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  status: z.enum(["active", "acknowledged", "implemented", "dismissed"]),
});

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const category = request.nextUrl.searchParams.get("category") ?? undefined;
      const status = request.nextUrl.searchParams.get("status") ?? undefined;
      const priority = request.nextUrl.searchParams.get("priority") ?? undefined;
  
      const items = await RecommendationEngine.list(ctx.tenant, { category, status, priority });
      return NextResponse.json({ items }, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function PUT(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const body = await parseJsonBody<unknown>(request);
      const parsed = updateStatusSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, request);
  
      const { id, ids, status } = parsed.data;
      if (id) {
        const result = await RecommendationEngine.updateStatus(ctx.tenant, id, status);
        return NextResponse.json({ updated: [result] }, { headers: { ...noCacheHeaders() } });
      }
      if (ids && ids.length > 0) {
        const results = await Promise.all(ids.map((i) => RecommendationEngine.updateStatus(ctx.tenant, i, status)));
        return NextResponse.json({ updated: results }, { headers: { ...noCacheHeaders() } });
      }
      return NextResponse.json({ error: { code: "VALIDATION", message: "Provide id or ids" } }, { status: 400 });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

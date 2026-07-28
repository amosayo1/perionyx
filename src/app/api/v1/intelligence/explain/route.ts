import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ExplainEngine } from "@/modules/intelligence-platform";
import type { ExplainTargetType, ExplainSourceType } from "@/modules/intelligence-platform/types";
import { z } from "zod";
import { zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const explainSchema = z.object({
  targetType: z.string(),
  targetId: z.string(),
});

const linkSchema = z.object({
  targetType: z.string(),
  targetId: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  sourceLabel: z.string().optional(),
  sourceUrl: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const body = await parseJsonBody<unknown>(request);
      const action = request.url.endsWith("/link") ? "link" : "explain";
  
      if (action === "link") {
        const parsed = linkSchema.safeParse(body);
        if (!parsed.success) return zodErrorResponse(parsed.error, request);
  
        const result = await ExplainEngine.link(ctx.tenant, parsed.data as Parameters<typeof ExplainEngine.link>[1]);
        return NextResponse.json(result, { status: 201, headers: { ...noCacheHeaders() } });
      }
  
      const parsed = explainSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, request);
  
      const result = await ExplainEngine.buildExplanation(
        ctx.tenant,
        parsed.data.targetType as ExplainTargetType,
        parsed.data.targetId,
      );
      return NextResponse.json(result, { headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

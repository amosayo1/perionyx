import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ExplainEngine } from "@/modules/intelligence-platform";
import type { ExplainTargetType, ExplainSourceType } from "@/modules/intelligence-platform/types";
import { z } from "zod";
import { zodErrorResponse } from "@/server/http/handle-route";

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
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const body = await parseJsonBody<unknown>(request);
    const action = request.url.endsWith("/link") ? "link" : "explain";

    if (action === "link") {
      const parsed = linkSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, request);

      const result = await ExplainEngine.link(ctx, parsed.data as Parameters<typeof ExplainEngine.link>[1]);
      return NextResponse.json(result, { status: 201, headers: { ...noCacheHeaders() } });
    }

    const parsed = explainSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, request);

    const result = await ExplainEngine.buildExplanation(
      ctx,
      parsed.data.targetType as ExplainTargetType,
      parsed.data.targetId,
    );
    return NextResponse.json(result, { headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}

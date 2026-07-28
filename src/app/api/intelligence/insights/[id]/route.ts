import { NextResponse } from "next/server";
import { executiveIntelligenceEngine } from "@/server/intelligence";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import type { InsightStatus } from "@/server/intelligence/types";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
  
      const { id } = await params;
      const body = await parseJsonBody<{ action: InsightStatus }>(request);
      const { action } = body;
  
      switch (action) {
        case "acknowledged":
          await executiveIntelligenceEngine.acknowledgeInsight(id);
          break;
        case "dismissed":
          await executiveIntelligenceEngine.dismissInsight(id);
          break;
        case "resolved":
          await executiveIntelligenceEngine.resolveInsight(id);
          break;
        default:
          return NextResponse.json(
            { error: { code: "VALIDATION", message: "Invalid action. Use: acknowledged, dismissed, or resolved" } },
            { status: 400 },
          );
      }
  
      return NextResponse.json({ success: true, insightId: id, status: action });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
